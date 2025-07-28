// backend/src/controllers/CertificateController.js

// backend/src/controllers/CertificateController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { user_id } from '../middleware/Auth.js';
import { isoTime,timeBeauty } from '../helpers/Timer.js';
import * as response from "../helpers/Response.js";
import CertificateService from '../services/CaService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import Hashids from 'hashids';

const clock = isoTime()
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERTS_DIR = path.join(__dirname, '../../certs');
const DOWNLOAD_DIR = path.join(__dirname, '../../downloads');
const CA_DIR = path.join(__dirname, '../../ca');
const CRL_DIR = path.join(__dirname, '../../crl');
const hashids = new Hashids('your-salt', 16);

// Helper function to validate project ownership
const validateProjectOwnership = async (projectId, userId) => {
  const project = await prisma.projects.findUnique({
    where: { id: parseInt(projectId) }
  });
  return project /*&& project.created_by === userId*/;
};

 export const downloadProjectCerts = async (req, res) => {
    const { projectId } = req.params;

    try {
        // 1. Create temp directory structure
        const tempDir = path.join(DOWNLOAD_DIR, `project_${projectId}_${Date.now()}`);
        const serverDir = path.join(tempDir, 'server');
        const clientsDir = path.join(tempDir, 'clients');
        
        fs.mkdirSync(tempDir, { recursive: true });
        fs.mkdirSync(serverDir, { recursive: true });
        fs.mkdirSync(clientsDir, { recursive: true });

        // 2. Get project CA files
        const projectCA = await CertificateService.getProjectCA(projectId);
        
        // 3. Copy server files with proper naming
        fs.copyFileSync(
            path.join(CA_DIR, `project_${projectId}.key`),
            path.join(serverDir, 'server.key')
        );
        fs.copyFileSync(
            path.join(CA_DIR, `project_${projectId}.crt`),
            path.join(serverDir, 'server.crt')
        );
        fs.copyFileSync(
            path.join(CA_DIR, `project_${projectId}_combined.crt`),
            path.join(serverDir, 'combined.crt')
        );
        fs.copyFileSync(
            path.join(CRL_DIR, `project_${projectId}.crl`),
            path.join(serverDir, 'revocation.crl')
        );

        // 4. Get all certificates for this project from database
        const certificates = await prisma.certificates.findMany({
            where: { project_id: parseInt(projectId) }
        });
 
        // 5. Copy client .p12 files
        for (const cert of certificates) {
            try {
                let str=`client_${cert.pc_identifier}_${cert.common_name}.p12`
                const repl = str.replaceAll(`${cert.pc_identifier}_${cert.pc_identifier}`, `${cert.pc_identifier}`);

                const p12Path = path.join(CERTS_DIR, `${cert.serial}.p12`);
                if (fs.existsSync(p12Path)) {
                    fs.copyFileSync(
                        p12Path,
                        path.join(clientsDir,repl)
                    );
                }
            } catch (error) {
                console.error(`Error copying cert ${cert.serial}:`, error);
            }
        }

        // 6. Create ZIP archive
        const zipPath = path.join(DOWNLOAD_DIR, `project_${projectId}_certs.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        return new Promise((resolve, reject) => {
            output.on('close', () => {
                res.download(zipPath, `project_${projectId}_certs.zip`, (err) => {
                    // Cleanup temp files
                    fs.rmSync(tempDir, { recursive: true, force: true });
                    fs.rmSync(zipPath, { force: true });
                    if (err) reject(err);
                    else resolve();
                });
            });

            archive.on('error', (err) => {
                fs.rmSync(tempDir, { recursive: true, force: true });
                reject(err);
            });

            archive.pipe(output);
            archive.directory(tempDir, false);
            archive.finalize();
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            error: 'Failed to package certificates',
            details: error.message 
        });
    }
}

export const createProjectWithCertificates = async (req, res, next) => {
  try {
    const { name, description, status, days_valid, auto_create, staff_ids = [] } = req.body;
    const pc_count = parseInt(req.body.pc_count, 10);
    const pcCount = parseInt(pc_count, 10) || 0;
    const created_by = req.user.id; // Assuming user_id comes from authenticated user

    // Validate staff_ids (if provided)
    if (staff_ids && staff_ids.length > 0) {
      const existingAdmins = await prisma.admins.findMany({
        where: {
          id: { in: staff_ids }
        },
        select: { id: true }
      });

      if (existingAdmins.length !== staff_ids.length) {
        const missingIds = staff_ids.filter(id => 
          !existingAdmins.some(admin => admin.id === id)
        );
        return res.status(400).json({
          error: 'Invalid staff_ids',
          message: `The following staff IDs do not exist: ${missingIds.join(', ')}`
        });
      }
    }

    // Create project
    const project = await prisma.projects.create({
      data: {
        name,
        description,
        pc_count: pc_count || 1,
        status: status || 'active',
        created_by,
        updated_by: created_by,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    // Create project CA
    const projectCA = await CertificateService.createProjectCA(project.id, project.name);

    // Create admin_project associations
    if (staff_ids && staff_ids.length > 0) {
      await prisma.admin_projects.createMany({
        data: staff_ids.map(staff_id => ({
          admin_id: staff_id,
          project_id: project.id,
        })),
        skipDuplicates: true
      });
    }

    // Also associate the creator with the project if not already in staff_ids
    /*if (!staff_ids.includes(created_by)) {
      await prisma.admin_projects.create({
        data: {
          admin_id: created_by,
          project_id: project.id,
        }
      });
    }*/

    // Issue certificates for each PC
    const certificates = [];
    if (auto_create === true) {
      for (let i = 1; i <= project.pc_count; i++) {
        try {
          const issuedCert = await CertificateService.issueCertificate(
            project.id,
            i,
            days_valid // default validity
          );

          const certificate = await prisma.certificates.create({
            data: {
              serial: issuedCert.serial,
              common_name: issuedCert.commonName,
              pc_identifier: `PC-${i}`,
              expires_at: issuedCert.expiresAt,
              issued_at: new Date(),
              p12_password: issuedCert.password,
              project_id: project.id,
              created_by,
              updated_by: created_by,
              status: 'active',
              created_at: new Date(),
              updated_at: new Date(),
            }
          });

          certificates.push(certificate);

          await prisma.certificate_logs.create({
            data: {
              certificate_id: certificate.id,
              action: 'create',
              action_by: created_by,
              new_status: 'active',
              note: `Auto-generated for project ${project.name} (PC-${i})`,
              created_at: new Date(),
            }
          });
        } catch (error) {
          console.error(`Failed to create certificate for PC-${i}:`, error);
          // Continue with next PC even if one fails
        }
      }
    }

    const result = {
      project: {
        ...project,
        created_at: timeBeauty(project.created_at),
        updated_at: timeBeauty(project.updated_at),
      },
      ca_certificate: {
        // download_url: `/api/projects/${project.id}/ca-certificate`,
        crl_url: `/api/projects/${project.id}/crl`
      },
      certificates: certificates.map(cert => ({
        ...cert,
        issued_at: timeBeauty(cert.issued_at),
        expires_at: timeBeauty(cert.expires_at),
        // download_url: `/api/certificates/${cert.serial}/download`,
        // revoke_url: `/api/certificates/${cert.serial}/revoke`
      })),
      associated_staff: staff_ids.concat(
        staff_ids.includes(created_by) ? [] : [created_by]
      )
    };

    response.create(result, res);
  } catch (error) {
    response.error(error, res, next);
  }
};
/*
export const downloadCertificate = async (req, res, next) => {
  try {
    const { serial } = req.params;
    const userId = user_id;

    const certificate = await prisma.certificates.findUnique({
      where: { serial },
      include: { project: true }
    });

    if (!certificate || certificate.project.created_by !== userId) {
      return response.notFound('Certificate not found or access denied', res);
    }

    const p12Path = path.join(CERTS_DIR, `${serial}.p12`);

    if (!fs.existsSync(p12Path)) {
      return response.notFound('Certificate file not found', res);
    }

    // Update download count
    await prisma.certificates.update({
      where: { serial },
      data: { download_count: { increment: 1 } }
    });

    // Log the download
    await prisma.certificate_logs.create({
      data: {
        certificate_id: certificate.id,
        action: 'download',
        action_by: userId,
        new_status: certificate.status,
        note: `Downloaded certificate ${serial}`,
        created_at: clock
      }
    });

    res.download(p12Path, `certificate_${serial}.p12`);
  } catch (error) {
    response.error(error, res, next);
  }
};*/
 

export const downloadCertificate = async (req, res, next) => {
    const { serial } = req.params;
    const p12Path = path.join(CERTS_DIR, `${serial}.p12`);
//user_id
    try {
        // Check if certificate exists
        if (!fs.existsSync(p12Path)) {
            return res.status(404).json({ 
                error: 'Certificate not found',
                message: `No .p12 certificate found with serial ${serial}`
            });
        }

        // Get certificate details from database for filename
        const cert = await prisma.certificates.findUnique({
            where: { serial }
        });

        if (!cert) {
            return res.status(404).json({ 
                error: 'Certificate not found',
                message: `No certificate record found with serial ${serial}`
            });
        }

        // Create a proper filename
        let filename = `client_${cert.pc_identifier}_${cert.common_name}.p12`;
        filename = filename.replaceAll(`${cert.pc_identifier}_${cert.pc_identifier}`, `${cert.pc_identifier}`);

                // Log the download action
        await prisma.certificate_logs.create({
            data: {
                certificate_id: cert.id,
                action: 'download',
                action_by: user_id,
                previous_status: cert.status,
                new_status: cert.status, // Status remains the same
                note: `Certificate file downloaded`,
                created_at: clock
            }
        });

        // Send the file
        res.download(p12Path, filename, (err) => {
            if (err) {
                console.error(`Error downloading certificate ${serial}:`, err);
                if (!res.headersSent) {
                    res.status(500).json({ 
                        error: 'Download failed',
                        details: err.message 
                    });
                }
            }
        });

    } catch (error) {
        console.error(`Error processing download for serial ${serial}:`, error);
        res.status(500).json({ 
            error: 'Failed to download certificate',
            details: error.message 
        });
    }
};

export const revokeCertificate = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const { serial } = req.params;
    const userId = user_id;

    // Find certificate with project info
    const certificate = await prisma.certificates.findFirst({
      where: { serial },
      include: { project: true }
    });

    // Validate ownership and existence
    if (!certificate /*|| certificate.project.created_by !== userId*/) {
      return response.forbidden('Certificate not found or access denied', res);
    }

    // Check if already revoked in database
    if (certificate.status === 'revoked') {
      return response.update({
        message: 'Certificate was already revoked',
        serial,
        revoked_at: timeBeauty(certificate.revoked_at),
        crl_url: `/api/projects/${certificate.project_id}/crl`
      }, res);
    }

    try {
      // Attempt revocation with CA service
      const revocation = await CertificateService.revokeCertificate(
        certificate.project_id,
        serial
      );

      // Update database
      const updatedCert = await prisma.certificates.update({
        where: { serial },
        data: {
          status: 'revoked',
          revocation_reason: reason,
          revoked_at: clock,
          updated_at: clock,
        }
      });

      // Log the revocation
      await prisma.certificate_logs.create({
        data: {
          certificate_id: certificate.id,
          action: 'revoke',
          action_by: userId,
          new_status: 'revoked',
          note: reason || `Certificate revoked via API`,
          created_at: clock
        }
      });

      return response.update({
        message: 'Certificate revoked successfully',
        serial,
        crl_url: `/api/projects/${certificate.project_id}/crl`,
        revoked_at: timeBeauty(updatedCert.revoked_at)
      }, res);

    } catch (error) {
      // Handle case where OpenSSL says already revoked but our DB doesn't know
      if (error.message.includes('Already revoked')) {
        // Update our database to match OpenSSL's state
        const updatedCert = await prisma.certificates.update({
          where: { serial },
          data: {
            status: 'revoked',
            revocation_reason: reason || 'Previously revoked in CA but not recorded',
            revoked_at: clock,
            updated_at: clock,
          }
        });

        return response.update({
          message: 'Certificate was already revoked in CA (clock recorded in database)',
          serial,
          crl_url: `/api/projects/${certificate.project_id}/crl`,
          revoked_at: timeBeauty(updatedCert.revoked_at)
        }, res);
      }
      throw error;
    }
  } catch (error) {
    response.error(error, res, next);
  }
};

export const renewCertificate = async (req, res, next) => {
  try {
    const { daysValid = 365 } = req.body;
    const { serial } = req.params;
    const userId = user_id;

    const certificate = await prisma.certificates.findUnique({
      where: { serial },
      include: { project: true }
    });


    if (!certificate /*|| certificate.project.created_by !== userId*/) {
      return response.notFound('Certificate not found or access denied', res);
    }

    if (certificate.status === 'revoked') {
      return response.badRequest('Cannot renew a revoked certificate', res);
    }

    // Extract PC identifier from common name
    const pcIdentifier = certificate.pc_identifier.replace('PC-', '');

    // First revoke the old certificate
    try {
      await CertificateService.revokeCertificate(
        certificate.project_id,
        certificate.serial
      );
      
      // Update old certificate status in database
      await prisma.certificates.update({
        where: { serial: certificate.serial },
        data: {
          status: 'revoked',
          revoked_at: clock,
          updated_at: clock,
          revocation_reason: 'Renewed with new certificate'
        }
      });

      // Log the revocation
      await prisma.certificate_logs.create({
        data: {
          certificate_id: certificate.id,
          action: 'revoke',
          action_by: userId,
          previous_status: certificate.status,
          new_status: 'revoked',
          note: `Revoked for renewal with new certificate`,
          created_at: clock
        }
      });
    } catch (revokeError) {
      // If certificate was already revoked in CA but not in our DB
      if (revokeError.message.includes('Already revoked')) {
        await prisma.certificates.update({
          where: { serial: certificate.serial },
          data: {
            status: 'revoked',
            revoked_at: clock,
            updated_at: clock,
            revocation_reason: 'Previously revoked in CA (renewal process)'
          }
        });
      } else {
        throw revokeError;
      }
    }

    // Issue new certificate with updated common name to avoid conflict
    const newCommonName = `${certificate.common_name}-Renewed-${new Date().toLocaleDateString('en-GB').split('/').map((v, i) => i === 2 ? v.slice(-2) : v.padStart(2, '0')).join('')}`;
    const issuedCert = await CertificateService.issueCertificate(
      certificate.project_id,
      `${pcIdentifier}-Renewed-${Date.now()}`, // Add uniqueness to identifier
      daysValid,
      newCommonName // Pass the new common name
    );

    // Create new certificate record
    const newCert = await prisma.certificates.create({
      data: {
        serial: issuedCert.serial,
        common_name: newCommonName,
        pc_identifier: certificate.pc_identifier,
        expires_at: issuedCert.expiresAt,
        p12_password: issuedCert.password,
        project_id: certificate.project_id,
        created_by: userId,
        updated_by: userId,
        status: 'active',
        previous_serial: certificate.serial,
        created_at: clock,
        updated_at: clock,
      }
    });

    // Log the renewal
    await prisma.certificate_logs.create({
      data: {
        certificate_id: newCert.id,
        action: 'renew',
        action_by: userId,
        new_status: 'active',
        note: `Renewed from certificate ${serial}`,
        created_at: clock
      }
    });

    response.update({
      message: 'Certificate renewed successfully',
      old_serial: serial,
      new_serial: newCert.serial,
     // download_url: `/api/certificates/${newCert.serial}/download`,
      expires_at: timeBeauty(newCert.expires_at)
    }, res);
  } catch (error) {
    console.error('Certificate renewal error:', error);
    response.error(error, res, next);
  }
};


export const verifyCertificate = async (req, res, next) => {
  try {
    const { serial } = req.params;
    const userId = user_id;

    const certificate = await prisma.certificates.findUnique({
      where: { serial },
      include: { project: true }
    });

    if (!certificate/* || certificate.project.created_by !== userId*/) {
      return response.notFound('Certificate not found or access denied', res);
    }


    const verification = await CertificateService.verifyCertificate(
      certificate.project_id,
      serial
    );
 
    response.list({
      serial,
      valid: verification.valid,
      result: verification.result,
      status: certificate.status,
      verification_time: new Date().toISOString()
    }, res);
  } catch (error) {
    response.error(error, res, next);
  }
};


export const downloadProjectCACertificate = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = user_id;

    if (!await validateProjectOwnership(projectId, userId)) {
      return response.notFound('Project not found or access denied', res);
    }

    const ca = await CertificateService.getProjectCA(projectId);
    res.setHeader('Content-Type', 'application/x-pem-file');
    res.setHeader('Content-Disposition', `attachment; filename=project_${projectId}_ca.crt`);
    res.send(ca.combined);
  } catch (error) {
    response.error(error, res, next);
  }
};

export const getProjectCRL = async (req, res, next) => {
  try {
    let { projectId } = req.params; projectId=parseInt(projectId)
    const userId = user_id;

    if (!await validateProjectOwnership(projectId, userId)) {
      return response.notFound('Project not found or access denied', res);
    }

    const crl = await CertificateService.getProjectCRL(projectId);
    res.setHeader('Content-Type', 'application/x-pem-file');
    res.setHeader('Content-Disposition', `attachment; filename=project_${projectId}_crl.pem`);
    res.send(crl.crl);
  } catch (error) {
    response.error(error, res, next);
  }
};

export const getCertificateList = async (req, res, next) => {
  try {
    let { projectId, status } = req.query; projectId=parseInt(projectId)
    if (status=='all'){status=null}
    const userId = user_id;

    const where = {};
    if (projectId) {
      if (!await validateProjectOwnership(projectId, userId)) {
        return response.notFound('Project not found or access denied', res);
      }
      where.project_id = projectId;
    } else {
      // Get all projects owned by user
      const projects = await prisma.projects.findMany({
       // where: { created_by: userId },
        select: { id: true }
      });
      where.project_id = { in: projects.map(p => p.id) };
    }

    if (status) where.status = status;

    const certificates = await prisma.certificates.findMany({
      where,
      include: {
        project: {
          select: {
            name: true,
            id: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    const result = certificates.map(cert => ({
      ...cert,
      issued_at: timeBeauty(cert.issued_at),
      expires_at: timeBeauty(cert.expires_at),
      created_at: timeBeauty(cert.created_at),
      updated_at: timeBeauty(cert.updated_at),
      project_name: cert.project.name,
     // download_url: `/api/certificates/${cert.serial}/download`,
     // revoke_url: `/api/certificates/${cert.serial}/revoke`,
     // verify_url: `/api/certificates/${cert.serial}/verify`
    }));

    response.list({ certificates: result }, res);
  } catch (error) {
    response.error(error, res, next);
  }
};

export const getCertificateDetails = async (req, res, next) => {
  try {
    const { serial } = req.params;
    const userId = user_id;

    const certificate = await prisma.certificates.findUnique({
      where: { serial },
      include: {
        project: {
          select: {
            name: true,
            id: true
          }
        },
        logs: {
          include:{
            actor:{
              select:{name:true}
            },
          },
          orderBy: { created_at: 'asc' },
          take: 10
        }
      }
    });

    if (!certificate/* || certificate.project.created_by !== userId*/) {
      return response.notFound('Certificate not found or access denied', res);
    }


    const verification = await CertificateService.verifyCertificate(
      certificate.project_id,
      serial
    );
 delete certificate.id;
    if (certificate && certificate.project && certificate.project.id) {
  certificate.project.id = hashids.encode(certificate.project.id);
}

    const result = { 
       ...certificate,
      issued_at: timeBeauty(certificate.issued_at),
      expires_at: timeBeauty(certificate.expires_at),
      created_at: timeBeauty(certificate.created_at),
      updated_at: timeBeauty(certificate.updated_at),
      project_name: certificate.project.name,
      valid: verification.valid,
      verification_result: verification.result,
    //  download_url: `/api/certificates/${certificate.serial}/download`,
     // revoke_url: `/api/certificates/${certificate.serial}/revoke`,
      logs: certificate.logs.map(log => ({
        ...log,
        created_at: timeBeauty(log.created_at)
      }))
    };

    response.list(result, res);
  } catch (error) {
    response.error(error, res, next);
  }
};

// controllers/CertificateController.js
export const addNewPCsWithCertificates = async (req, res) => {
  let { projectId } = req.params;

  if(projectId.toString().length==16){
    projectId=hashids.decode(projectId)
  }

  const { count = 1 } = req.body; // Default to 1 if not specified
  const created_by = req.user.id; // Assuming user_id comes from authenticated user

  try {
    // 1. Verify project exists
    const project = await prisma.projects.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        certificates: {
          select: { pc_identifier: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 2. Check if requested count exceeds project's PC limit
    const currentPCsCount = project.certificates.length;
    const remainingCapacity = project.pc_count - currentPCsCount;

    if (count > remainingCapacity) {
      return res.status(400).json({ 
        error: 'Exceeds PC limit',
        message: `Project only has capacity for ${remainingCapacity} more PCs (current: ${currentPCsCount}, limit: ${project.pc_count})`
      });
    }

    // 3. Get current highest PC number
    const numbers = project.certificates.map(item => {
      const match = item.pc_identifier.match(/PC-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });

    const lastPCNumber = numbers.length > 0 ? Math.max(...numbers) : 0;

    // 4. Create new certificates
    const newCertificates = [];
    for (let i = 1; i <= count; i++) {
      const pcNumber = lastPCNumber + i;
      const pcIdentifier = `PC-${pcNumber}`;

      try {
        const issuedCert = await CertificateService.issueCertificate(
          projectId,
          pcNumber,
          365 // validity in days
        );

        const certificate = await prisma.certificates.create({
          data: {
            serial: issuedCert.serial,
            common_name: issuedCert.commonName,
            pc_identifier: pcIdentifier,
            expires_at: issuedCert.expiresAt,
            p12_password: issuedCert.password,
            project_id: parseInt(projectId),
            created_by,
            updated_by: created_by,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          }
        });

        await prisma.certificate_logs.create({
          data: {
            certificate_id: certificate.id,
            action: 'create',
            action_by: created_by,
            new_status: 'active',
            note: `Added new PC (${pcIdentifier}) to project ${project.name}`,
            created_at: new Date()
          }
        });

        let { id, ...rest } = certificate;
        newCertificates.push({
          ...rest,
          // download_url: `/api/certificates/${certificate.serial}/download`
        });

        newCertificates.push({
          ...rest,
          // download_url: `/api/certificates/${certificate.serial}/download`
        });

      } catch (error) {
        console.error(`Failed to create certificate for ${pcIdentifier}:`, error);
        // Continue with next PC even if one fails
      }
    }

    // 5. Update project (without changing pc_count)
    await prisma.projects.update({
      where: { id: parseInt(projectId) },
      data: { 
        updated_by: created_by,
        updated_at: new Date(),
      }
    });

    res.json({
      success: true,
      added_count: newCertificates.length,
      certificates: newCertificates,
      project: {
       // id: project.id,
        name: project.name,
        current_pc_count: currentPCsCount + newCertificates.length,
        pc_limit: project.pc_count
      }
    });

  } catch (error) {
    console.error('Error adding new PCs:', error);
    res.status(500).json({ 
      error: 'Failed to add new PCs',
      details: error.message 
    });
  }
}

// controllers/CertificateController.js
export const  deletePCWithCertificate = async (req, res) => {
  const {  serial } = req.params;

  try {
    // 1. Find the certificate in database
    const certificate = await prisma.certificates.findFirst({
      where: {
        serial:serial
      }
    });
  
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // 2. Revoke the certificate
    await CertificateService.revokeCertificate(certificate.project_id, certificate.serial);

    await prisma.$transaction([
      prisma.certificate_logs.deleteMany({ where: { certificate_id: certificate.id } }),
      prisma.certificates.delete({ where: { id: certificate.id } })
    ]);

    // 5. Delete physical files
    const certFiles = [
      path.join(CERTS_DIR, `${certificate.serial}.key`),
      path.join(CERTS_DIR, `${certificate.serial}.crt`),
      path.join(CERTS_DIR, `${certificate.serial}.p12`),
      path.join(CERTS_DIR, `${certificate.serial}.csr`)
    ];

    certFiles.forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });

    res.json({ 
      success: true,
      message: `PC-${certificate.pc_identifier} and its certificate deleted successfully`
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete certificate',
      details: error.message 
    });
  }
}

export const deleteProjectPCWithCertificate = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const created_by = req.user.id; // Assuming user_id comes from authenticated user

    const project = await prisma.projects.findFirst({
      where: { id: parseInt(projectId) },
      include: {
        certificates: {
          select: { id: true, serial: true }
        },
        admin_projects: {
          select: { id: true }
        }
      }
    });

    if (!project) {
      return response.notFound('Project not found', res);
    }

    // Project CA files to delete
    const projectCaFiles = [
      path.join(CA_DIR, `project_${project.id}.key`),
      path.join(CA_DIR, `project_${project.id}.crt`),
      path.join(CA_DIR, `project_${project.id}.csr`),
      path.join(CA_DIR, `project_${project.id}.cnf`),
      path.join(CA_DIR, `project_${project.id}.srl`),
      path.join(CA_DIR, `project_${project.id}.txt`),
      path.join(CA_DIR, `project_${project.id}_combined.crt`),
      path.join(CRL_DIR, `project_${project.id}.crl`)
    ];

    // Start transaction to delete all related data
    await prisma.$transaction(async (tx) => {
      const certificateIds = project.certificates.map(cert => cert.id);

      // 1. Delete certificate logs
      if (certificateIds.length > 0) {
        await tx.certificate_logs.deleteMany({
          where: { certificate_id: { in: certificateIds } }
        });

        // 2. Delete certificates
        await tx.certificates.deleteMany({
          where: { id: { in: certificateIds } }
        });
      }

      // 3. Delete admin_project associations
      if (project.admin_projects.length > 0) {
        await tx.admin_projects.deleteMany({
          where: { project_id: project.id }
        });
      }

      // 4. Delete the project itself
      await tx.projects.delete({
        where: { id: project.id }
      });
    });

    // File deletion outside transaction (filesystem operations can't be rolled back)
    try {
      // Delete all certificate files (.key, .crt, .p12, .csr)
      project.certificates.forEach(cert => {
        const basePath = path.join(CERTS_DIR, cert.serial);
        ['.key', '.crt', '.p12', '.csr'].forEach(ext => {
          const filePath = `${basePath}${ext}`;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      });

      // Delete project CA files
      projectCaFiles.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });

    } catch (fileError) {
      console.error('Error deleting project files:', fileError);
      // Continue even if file deletion fails
    }

    response.remove({ 
      count: 1, 
      data: { 
        message: 'Project and all related data deleted successfully',
        certificates_deleted: project.certificates.length,
        admin_associations_deleted: project.admin_projects.length,
        files_deleted: project.certificates.length * 4 + projectCaFiles.length
      } 
    }, res);

  } catch (error) {
    console.error('Error deleting project:', error);
    response.error(error, res, next);
  }
};


export const getExpiringCertificates = async (req, res, next) => {
  try {
    const days = parseInt(req.params.days) || 30;
    const userId = user_id;
console.log(days)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + days);

    const expiringCerts = await prisma.certificates.findMany({
      where: {
        status: 'active',
        expires_at: {
          lte: thresholdDate
        },
        //created_by: userId
      },
      orderBy: { expires_at: 'asc' },
      include: {
        project: true // ✅ fixed: changed from projects to project
      }
    });

    response.list({ expiringCerts, thresholdDate }, res);
  } catch (error) {
    response.error(error, res, next);
  }
};


export const getUserActions = async (req, res, next) => {
  try {
    const { action, targetType, limit = 50 } = req.query;
    const userId = user_id;

    const where = { action_by: userId };
    if (action) where.action = action;
    if (targetType) where.target_type = targetType;

    const actions = await prisma.certificate_logs.findMany({
      where,
      take: parseInt(limit),
      orderBy: { created_at: 'desc' }
    });

    response.list({ actions }, res);
  } catch (error) {
    response.error(error, res, next);
  }
};

// controllers/certificateController.js

// controllers/certificateController.js
export const updateCommonNameBySerial = async (req, res, next) => {
  try {
    const { serial } = req.params;
    const { common_name } = req.body;
    const updated_by = req.user.id; // Assuming user_id comes from auth middleware
    const clock = new Date().toISOString();

    // Validate input
    if (!common_name || typeof common_name !== 'string') {
      return response.error({ message: 'Valid username is required' }, res, next, 400);
    }

    // Update certificate
    const updatedCert = await prisma.certificates.update({
      where: { serial },
      data: {
        common_name,
        updated_by,
        updated_at: clock
      }
    });

    if (!updatedCert) {
      return response.error({ message: 'Certificate not found' }, res, next, 404);
    }

    // Create log entry
    await prisma.certificate_logs.create({
      data: {
        certificate_id: updatedCert.id,
        action: 'update',
        action_by: updated_by,
        note: `User name updated`,
        created_at: clock,
        new_status:updatedCert.status
      }
    });

    const result = {
      certificate: {
        ...updatedCert,
        issued_at: timeBeauty(updatedCert.issued_at),
        expires_at: timeBeauty(updatedCert.expires_at),
        updated_at: timeBeauty(clock),
     //   download_url: `/api/certificates/${serial}/download`
      },
      log: {
        action: 'common_name_update',
        timestamp: timeBeauty(clock)
      }
    };

    response.update(result, res);
  } catch (error) {
    response.error(error, res, next);
  }
};



export const getAllUsersActivity = async (req, res, next) => {
  try {
    // Get all admins with their activity counts
    const users = await prisma.admins.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            certificate_actions: true,
            created_projects: true,
            updated_projects: true,
            created_certificates: true,
            updated_certificates: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Get recent activity from certificate logs only (since project_logs doesn't exist)
    const recentActivity = await prisma.certificate_logs.findMany({
      select: {
        id: true,
        action: true,
        created_at: true,
        note: true,
        metadata: true,
        certificate: {
          select: {
            serial: true,
            common_name: true,
            project: {
              select: {
                name: true
              }
            }
          }
        },
        actor: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 100
    });

    const result = {
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        total_actions: user._count.certificate_actions + 
                      user._count.created_projects + 
                      user._count.updated_projects +
                      user._count.created_certificates +
                      user._count.updated_certificates,
        certificate_logs: user._count.certificate_actions,
        certificates_created: user._count.created_certificates,
        certificates_updated: user._count.updated_certificates,
        projects_created: user._count.created_projects,
        projects_updated: user._count.updated_projects
      })),
      recent_activity: recentActivity.map(item => ({
        type: 'certificate',
        id: item.id,
        action: item.action,
        action_by: item.actor.id,
        actor_name: item.actor.name,
        actor_role: item.actor.role,
        target: item.certificate.common_name,
        project_name: item.certificate.project.name,
        serial: item.certificate.serial,
        note: item.note,
        timestamp: timeBeauty(item.created_at),
        metadata: item.metadata,
        action_display: formatActionDisplay(item.action, 'certificate')
      })),
      stats: {
        total_users: users.length,
        total_actions: users.reduce((sum, user) => sum + 
          user._count.certificate_actions +
          user._count.created_projects +
          user._count.updated_projects +
          user._count.created_certificates +
          user._count.updated_certificates, 0),
        active_users: users.filter(u => 
          u._count.certificate_actions > 0 || 
          u._count.created_projects > 0 ||
          u._count.updated_projects > 0 ||
          u._count.created_certificates > 0 ||
          u._count.updated_certificates > 0
        ).length,
        by_role: {
          superAdmin: users.filter(u => u.role === 'superAdmin').length,
          admin: users.filter(u => u.role === 'admin').length,
          hospitalAssistant: users.filter(u => u.role === 'hospitalAssistant').length,
          staff: users.filter(u => u.role === 'staff').length
        }
      }
    };

    response.list(result, res);
  } catch (error) {
    response.error(error, res, next);
  }
};

// Action display formatter
function formatActionDisplay(action, type) {
  const actions = {
    certificate: {
      create: 'Certificate Created',
      revoke: 'Certificate Revoked',
      renew: 'Certificate Renewed',
      download: 'Certificate Downloaded',
      update: 'Certificate Updated',
      status_change: 'Certificate Status Changed'
    }
  };
  return actions[type]?.[action] || action;
}