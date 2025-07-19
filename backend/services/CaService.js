// backend/src/services/CaService.js

// backend/src/services/CaService.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { isoTime,timeBeauty } from '../helpers/Timer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CA_DIR = path.join(__dirname, '../../ca');
const CERTS_DIR = path.join(__dirname, '../../certs');
const CRL_DIR = path.join(__dirname, '../../crl');

// Ensure directories exist
[CA_DIR, CERTS_DIR, CRL_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

class CertificateService {
  constructor() {
    this.ensureRootCA();
  }

  ensureRootCA() {
    const rootKeyPath = path.join(CA_DIR, 'root.key');
    const rootCertPath = path.join(CA_DIR, 'root.crt');
    
    if (!fs.existsSync(rootKeyPath) || !fs.existsSync(rootCertPath)) {
      console.warn('Root CA not found. Creating new Root CA...');
      this.createRootCA();
    }
  }

  createRootCA() {
    try {
      const rootKeyPath = path.join(CA_DIR, 'root.key');
      const rootCertPath = path.join(CA_DIR, 'root.crt');
      const rootConfigPath = path.join(CA_DIR, 'root.cnf');

      // Create root CA configuration
      const rootConfig = `
[ req ]
default_bits        = 4096
default_keyfile     = root.key
distinguished_name  = req_distinguished_name
prompt              = no
x509_extensions     = v3_ca

[ req_distinguished_name ]
C  = US
ST = California
L  = San Francisco
O  = My Organization
OU = Root CA
CN = My Organization Root CA

[ v3_ca ]
subjectKeyIdentifier   = hash
authorityKeyIdentifier = keyid:always,issuer:always
basicConstraints       = CA:true
keyUsage               = digitalSignature, keyCertSign, cRLSign
`;

      fs.writeFileSync(rootConfigPath, rootConfig.trim());

      // Generate Root CA
      execSync(`openssl genrsa -out ${rootKeyPath} 4096`);
      execSync(`openssl req -x509 -new -nodes -key ${rootKeyPath} -sha256 -days 7300 -out ${rootCertPath} -config ${rootConfigPath}`);

      console.info('Root CA initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Root CA', error);
      throw new Error('Root CA initialization failed');
    }
  }

async createProjectCA(projectId, projectName) {
    try {
      // Helper function to normalize paths for OpenSSL
      const normalizePath = (p) => path.resolve(p).replace(/\\/g, '/');
      
      // Define all paths
      const projectKeyPath = normalizePath(path.join(CA_DIR, `project_${projectId}.key`));
      const projectCsrPath = normalizePath(path.join(CA_DIR, `project_${projectId}.csr`));
      const projectCertPath = normalizePath(path.join(CA_DIR, `project_${projectId}.crt`));
      const projectConfigPath = normalizePath(path.join(CA_DIR, `project_${projectId}.cnf`));
      const projectCombinedPath = normalizePath(path.join(CA_DIR, `project_${projectId}_combined.crt`));
      const projectSerialPath = normalizePath(path.join(CA_DIR, `project_${projectId}.srl`));
      const projectDatabasePath = normalizePath(path.join(CA_DIR, `project_${projectId}.txt`));
      const projectCrlPath = normalizePath(path.join(CRL_DIR, `project_${projectId}.crl`));
      const rootCertPath = normalizePath(path.join(CA_DIR, 'root.crt'));
      const rootKeyPath = normalizePath(path.join(CA_DIR, 'root.key'));

      // Verify root CA files exist
      if (!fs.existsSync(rootCertPath) || !fs.existsSync(rootKeyPath)) {
        throw new Error('Root CA files not found. Please initialize root CA first.');
      }

      // Ensure CRL directory exists
      if (!fs.existsSync(CRL_DIR)) {
        fs.mkdirSync(CRL_DIR, { recursive: true });
      }

      // Create project CA configuration
      const projectConfig = `
[ ca ]
default_ca      = CA_default

[ CA_default ]
dir             = ${normalizePath(CA_DIR)}
database        = ${projectDatabasePath}
new_certs_dir   = ${normalizePath(CERTS_DIR)}
certificate     = ${projectCertPath}
serial          = ${projectSerialPath}
private_key     = ${projectKeyPath}
RANDFILE        = ${normalizePath(path.join(CA_DIR, '.rand'))}

default_days    = 365
default_crl_days= 30
default_md      = sha256
policy          = policy_loose

[ policy_loose ]
countryName             = optional
stateOrProvinceName     = optional
organizationName        = optional
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ req ]
default_bits        = 4096
default_keyfile     = ${projectKeyPath}
distinguished_name  = req_distinguished_name
prompt              = no
x509_extensions     = v3_intermediate_ca

[ req_distinguished_name ]
C  = US
ST = California
L  = San Francisco
O  = My Organization
OU = Project ${projectId}
CN = ${projectName} Project CA

[ v3_intermediate_ca ]
subjectKeyIdentifier   = hash
authorityKeyIdentifier = keyid:always,issuer:always
basicConstraints       = CA:true, pathlen:0
keyUsage               = digitalSignature, keyCertSign, cRLSign

[ server_cert ]
basicConstraints       = CA:FALSE
nsCertType             = server
keyUsage               = digitalSignature, keyEncipherment
extendedKeyUsage       = serverAuth

[ client_cert ]
basicConstraints       = CA:FALSE
nsCertType             = client
keyUsage               = digitalSignature
extendedKeyUsage       = clientAuth

[ crl_ext ]
authorityKeyIdentifier = keyid:always
`;

      fs.writeFileSync(projectConfigPath, projectConfig.trim());
      
      // Initialize project CA files
      fs.writeFileSync(projectDatabasePath, '');
      fs.writeFileSync(projectSerialPath, '01');

      // Generate Project Intermediate CA
      execSync(`openssl genrsa -out "${projectKeyPath}" 4096`);
      fs.chmodSync(projectKeyPath, 0o600); // Set restrictive permissions
      
      execSync(`openssl req -new -key "${projectKeyPath}" -out "${projectCsrPath}" -config "${projectConfigPath}"`);
      execSync(`openssl x509 -req -in "${projectCsrPath}" -CA "${rootCertPath}" -CAkey "${rootKeyPath}" -CAcreateserial -out "${projectCertPath}" -days 3650 -sha256 -extensions v3_intermediate_ca -extfile "${projectConfigPath}"`);

      // Create combined CA file for Nginx
      const rootCert = fs.readFileSync(rootCertPath, 'utf8');
      const projectCert = fs.readFileSync(projectCertPath, 'utf8');
      fs.writeFileSync(projectCombinedPath, `${rootCert}\n${projectCert}`);

      // Generate initial CRL with explicit environment
      execSync(`openssl ca -config "${projectConfigPath}" -gencrl -out "${projectCrlPath}"`, {
        env: {
          ...process.env,
          OPENSSL_CONF: projectConfigPath
        }
      });

      return {
        keyPath: projectKeyPath,
        certPath: projectCertPath,
        combinedPath: projectCombinedPath,
        crlPath: projectCrlPath,
        configPath: projectConfigPath
      };
    } catch (error) {
      console.error('CA Creation Error Details:', {
        message: error.message,
        stack: error.stack,
        stderr: error.stderr?.toString(),
        stdout: error.stdout?.toString()
      });
      throw new Error(`Project CA creation failed: ${error.stderr?.toString() || error.message}`);
    }
  }

  async issueCertificate(projectId, pcIdentifier, daysValid = 365) {
    const serial = crypto.randomBytes(8).toString('hex');
    const password = crypto.randomBytes(12).toString('hex');
    const commonName = `PC-${pcIdentifier}-Project-${projectId}`;

    const keyPath = path.join(CERTS_DIR, `${serial}.key`);
    const csrPath = path.join(CERTS_DIR, `${serial}.csr`);
    const crtPath = path.join(CERTS_DIR, `${serial}.crt`);
    const p12Path = path.join(CERTS_DIR, `${serial}.p12`);
    const projectConfigPath = path.join(CA_DIR, `project_${projectId}.cnf`);

    try {
      // Generate PC certificate
      execSync(`openssl genrsa -out ${keyPath} 2048`);
      execSync(`openssl req -new -key ${keyPath} -out ${csrPath} -subj "/CN=${commonName}"`);
      execSync(`openssl ca -config ${projectConfigPath} -in ${csrPath} -out ${crtPath} -days ${daysValid} -extensions client_cert -batch`);
      execSync(`openssl pkcs12 -export -out ${p12Path} -inkey ${keyPath} -in ${crtPath} -certfile ${path.join(CA_DIR, `project_${projectId}.crt`)} -password pass:${password}`);

      // Set secure permissions
      fs.chmodSync(keyPath, 0o600);
      fs.chmodSync(p12Path, 0o600);

      return {
        serial,
        password,
        commonName,
        downloadPath: p12Path,
        expiresAt: isoTime(daysValid),   
        keyPath,
        crtPath
      };
    } catch (err) {
      [keyPath, csrPath, crtPath, p12Path].forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });
      throw err;
    }
  }

async revokeCertificate(projectId, serial) {
    // Normalize paths for Windows compatibility
    const normalizePath = (p) => path.resolve(p).replace(/\\/g, '/');
    
    const crtPath = normalizePath(path.join(CERTS_DIR, `${serial}.crt`));
    const projectConfigPath = normalizePath(path.join(CA_DIR, `project_${projectId}.cnf`));
    const projectCrlPath = normalizePath(path.join(CRL_DIR, `project_${projectId}.crl`));

    if (!fs.existsSync(crtPath)) {
      throw new Error('Certificate file not found for revocation');
    }

    if (!fs.existsSync(projectConfigPath)) {
      throw new Error('Project CA configuration not found');
    }

    try {
      // Revoke certificate - add quotes for paths and include stderr in error
      execSync(`openssl ca -config "${projectConfigPath}" -revoke "${crtPath}" -batch`, {
        stdio: ['pipe', 'pipe', 'pipe'] // Capture stderr
      });
      
      // Update CRL
      execSync(`openssl ca -config "${projectConfigPath}" -gencrl -out "${projectCrlPath}"`);
      return {
        success: true,
        crlPath: projectCrlPath,
        serial
      };
    } catch (error) {
      // Include OpenSSL's stderr output in the error message
      const errorMsg = error.stderr?.toString() || error.message;
      
      // Special handling for already revoked certificates
      if (errorMsg.includes('Already revoked')) {
        return {
          success: true,
          alreadyRevoked: true,
          crlPath: projectCrlPath,
          serial,
          message: 'Certificate was already revoked in CA'
        };
      }
      
      throw new Error(`Revocation failed: ${errorMsg}`);
    }
  }

  async getProjectCRL(projectId) {
    const projectCrlPath = path.join(CRL_DIR, `project_${projectId}.crl`);
    
    if (!fs.existsSync(projectCrlPath)) {
      throw new Error('CRL not found for this project');
    }
    
    return {
      crl: fs.readFileSync(projectCrlPath, 'utf8'),
      path: projectCrlPath,
      lastUpdated: fs.statSync(projectCrlPath).mtime
    };
  }

  async getProjectCA(projectId) {
    const projectCertPath = path.join(CA_DIR, `project_${projectId}.crt`);
    const projectCombinedPath = path.join(CA_DIR, `project_${projectId}_combined.crt`);
    
    if (!fs.existsSync(projectCertPath)) {
      throw new Error('Project CA not found');
    }
    
    return {
      cert: fs.readFileSync(projectCertPath, 'utf8'),
      combined: fs.existsSync(projectCombinedPath) ? fs.readFileSync(projectCombinedPath, 'utf8') : null,
      certPath: projectCertPath,
      combinedPath: projectCombinedPath
    };
  }

async verifyCertificate(projectId, serial) {
    // Normalize paths for Windows compatibility
    const normalizePath = (p) => path.resolve(p).replace(/\\/g, '/');
    
    const crtPath = normalizePath(path.join(CERTS_DIR, `${serial}.crt`));
    const projectCertPath = normalizePath(path.join(CA_DIR, `project_${projectId}.crt`));
    const rootCertPath = normalizePath(path.join(CA_DIR, 'root.crt'));

    if (!fs.existsSync(crtPath)) {
      throw new Error('Certificate file not found');
    }

    if (!fs.existsSync(projectCertPath)) {
      throw new Error('Project CA certificate not found');
    }

    if (!fs.existsSync(rootCertPath)) {
      throw new Error('Root CA certificate not found');
    }

    try {
      // Create temporary combined CA file
      const tempCaPath = normalizePath(path.join(CERTS_DIR, `temp_ca_${Date.now()}.crt`));
      const projectCert = fs.readFileSync(projectCertPath, 'utf8');
      const rootCert = fs.readFileSync(rootCertPath, 'utf8');
      fs.writeFileSync(tempCaPath, `${projectCert}\n${rootCert}`);

      // Verify with full chain
      const result = execSync(
        `openssl verify -CAfile "${tempCaPath}" -untrusted "${projectCertPath}" "${crtPath}"`
      ).toString();

      // Clean up temporary file
      fs.unlinkSync(tempCaPath);

      return {
        valid: result.includes('OK'),
        result: result.trim(),
        verification_time: new Date().toISOString()
      };
    } catch (error) {
      return {
        valid: false,
        result: error.stderr?.toString()?.trim() || error.message,
        verification_time: new Date().toISOString()
      };
    }
  }
}

export default new CertificateService();
