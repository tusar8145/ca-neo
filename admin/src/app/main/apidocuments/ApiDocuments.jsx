import React from 'react';
import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Button,
  Tab,
  Tabs,
  TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { copyToClipboard } from '../../utils/clipboard';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ApiDocumentation = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [baseUrl, setBaseUrl] = React.useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCopy = (text) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Get base URL from environment variables
    const envBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8000/api';
    setBaseUrl(envBaseUrl);
  }, []);

  const apis = [
    {
      id: 'user-authenticate',
      title: 'User Authentication',
      method: 'POST',
      path: '/user/authenticate',
      description: 'Authenticate user and retrieve JWT token along with assigned projects and certificates',
      authRequired: false,
      request: {
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          password: "123456",
          email: "type@gmail.com"
        }
      },
      response: {
        status: 200,
        body: {
          "user": {
            "uid": "e2ba905bf306f46faca223d3cb20e2cf",
            "data": {
              "displayName": "test",
              "phone": "0265455",
              "email": "test128888x@gmail.com",
              "role": "staff"
            }
          },
          "projects": [
            {
              "id": 45,
              "name": "Sample",
              "description": "Sample",
              "pc_count": 10,
              "status": "active",
              "certificates": [
                {
                  "id": 232,
                  "serial": "488ef08284a7b06f",
                  "common_name": "PC-1-Project-45",
                  "pc_identifier": "PC-1",
                  "issued_at": "2025-07-28T10:58:06.809Z",
                  "expires_at": "2026-07-28T19:58:06.807Z",
                  "revoked_at": null,
                  "status": "active",
                  "p12_password": "eacd431cebfa5b890c07f847",
                  "download_count": 0,
                  "revocation_reason": null,
                  "previous_serial": null,
                  "created_at": "2025-07-28T10:58:06.807Z",
                  "updated_at": "2025-07-28T10:58:06.807Z"
                }
              ]
            }
          ],
          "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
      },
      curl: `curl --location '${baseUrl}/user/authenticate' \\
--header 'Content-Type: application/json' \\
--data-raw '{
    "password":"123456",
    "email":"type@gmail.com"
}'`
    },
    {
      id: 'add-pcs-to-project',
      title: 'Add PCs to Project',
      method: 'POST',
      path: '/projects/:projectId/add-pcs',
      description: 'Add new PCs (certificates) to an existing project',
      authRequired: true,
      request: {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer <token>"
        },
        pathParams: {
          projectId: 45
        },
        body: {
          count: 1
        }
      },
      response: {
        status: 200,
        body: {
          "success": true,
          "added_count": 1,
          "certificates": [
              {
                  "id": 235,
                  "serial": "6646efedfd229e97",
                  "common_name": "PC-4-Project-45",
                  "pc_identifier": "PC-4",
                  "issued_at": "2025-07-28T11:48:22.770Z",
                  "expires_at": "2026-07-28T20:48:22.768Z",
                  "revoked_at": null,
                  "status": "active",
                  "p12_password": "358866e7c0d71ba2fedbefe2",
                  "download_count": 0,
                  "revocation_reason": null,
                  "project_id": 45,
                  "previous_serial": null,
                  "created_at": "2025-07-28T11:48:22.769Z",
                  "updated_at": "2025-07-28T11:48:22.769Z",
                  "created_by": 8,
                  "updated_by": 8
              }
          ],
          "project": {
              "id": 45,
              "name": "t1",
              "current_pc_count": 4,
              "pc_limit": 10
          }
        }
      },
      curl: `curl --location '${baseUrl}/projects/45/add-pcs' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwibmFtZSI6InR5cGUiLCJyb2xlIjoic3RhZmYiLCJlbWFpbCI6InR5cGVAZ21haWwuY29tIiwicGFzc3dvcmQiOiJlMTBhZGMzOTQ5YmE1OWFiYmU1NmUwNTdmMjBmODgzZSIsImFkZHJlc3MiOm51bGwsInBob25lIjoiMDI2NTQ1NSIsImNyZWF0ZWRfYXQiOiIyMDI1LTA3LTI4VDEwOjUwOjE2LjQ1OVoiLCJjcmVhdGVkX2J5IjozLCJ1cGRhdGVkX2F0IjoiMjAyNS0wNy0yOFQxMDo1MDoxNi40NTlaIiwidXBkYXRlZF9ieSI6bnVsbCwiaG9zcGl0YWxfaWQiOjIsInBob3RvIjpudWxsLCJob3NwaXRhbCI6bnVsbCwiaWF0IjoxNzUzNzAxMTg1LCJleHAiOjE3NTM3ODc1ODV9.vHGtl_ffc3N4xFvqcQG51cFlfpxhjEVS9L2RhHB7FB8' \\
--data '{
    "count":1
}'`
    },
    {
      id: 'get-certificate',
      title: 'Get Certificate Details',
      method: 'GET',
      path: '/certificates/:serial',
      description: 'Retrieve certificate information including status, project details, and audit logs',
      authRequired: true,
      request: {
        headers: {
          "Authorization": "Bearer <token>"
        },
        pathParams: {
          serial: "7069ca3615e4f3fc"
        }
      },
      response: {
        status: 200,
        body: {
          "success": "success",
          "message": "Data Fetch Successful",
          "data": {
            "serial": "7069ca3615e4f3fc",
            "common_name": "Test",
            "status": "revoked",
            "p12_password": "011c76989f7aeadd7cde2cf0",
            "project": {
              "name": "dd",
              "id": 28
            },
            "logs": [
              {
                "action": "create",
                "timestamp": "2025-07-18T19:09:44.263Z",
                "actor": {
                  "name": "CA Neo"
                }
              }
            ]
          }
        }
      },
      curl: `curl -X GET "${baseUrl}/certificates/7069ca3615e4f3fc" \\
-H "Authorization: Bearer <token>"`
    },
    {
      id: 'update-common-name',
      title: 'Update PC UserName',
      method: 'PATCH',
      path: '/certificates/:serial/common-name',
      description: 'Update the common name (username) associated with a certificate',
      authRequired: true,
      request: {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer <token>"
        },
        pathParams: {
          serial: "7069ca3615e4f3fc"
        },
        body: {
          common_name: "Test"
        }
      },
      response: {
        status: 200,
        body: {
          "success": "success",
          "message": "Update Successful",
          "result": {
            "certificate": {
              "serial": "7069ca3615e4f3fc",
              "common_name": "Test"
            },
            "log": {
              "action": "common_name_update",
              "timestamp": "2025-07-18T16:10:38.265Z"
            }
          }
        }
      },
      curl: `curl -X PATCH "${baseUrl}/certificates/7069ca3615e4f3fc/common-name" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer <token>" \\
-d '{"common_name":"Test"}'`
    },
   /* {
      id: 'delete-certificate',
      title: 'Delete Certificate',
      method: 'DELETE',
      path: '/certificates/:serial/delete',
      description: 'Permanently delete a certificate',
      authRequired: true,
      request: {
        headers: {
          "Authorization": "Bearer <token>"
        },
        pathParams: {
          serial: "7069ca3615e4f3fc"
        }
      },
      response: {
        status: 200,
        body: {
          "success": true,
          "message": "PC-PC-1 and its certificate deleted successfully"
        }
      },
      curl: `curl -X DELETE "${baseUrl}/certificates/7069ca3615e4f3fc/delete" \\
-H "Authorization: Bearer <token>"`
    },*/
    {
      id: 'revoke-certificate',
      title: 'Revoke Certificate',
      method: 'PATCH',
      path: '/certificates/:serial/revoke',
      description: 'Revoke a certificate with optional reason',
      authRequired: true,
      request: {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer <token>"
        },
        pathParams: {
          serial: "7611ee6a908a0a12"
        },
        body: {
          reason: "Employee left the company"
        }
      },
      response: {
        status: 200,
        body: {
          "success": "success",
          "message": "Update Successful",
          "result": {
            "message": "Certificate revoked successfully",
            "serial": "7611ee6a908a0a12",
            "revoked_at": "2025-07-19T01:10:05.230Z"
          }
        }
      },
      curl: `curl -X PATCH "${baseUrl}/certificates/7611ee6a908a0a12/revoke" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer <token>" \\
-d '{"reason":"Employee left the company"}'`
    },
    {
      id: 'renew-certificate',
      title: 'Renew Certificate',
      method: 'PATCH',
      path: '/certificates/:serial/renew',
      description: 'Renew a certificate with new validity period',
      authRequired: true,
      request: {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer <token>"
        },
        pathParams: {
          serial: "7069ca3615e4f3fc"
        },
        body: {
          daysValid: 730
        }
      },
      response: {
        status: 200,
        body: {
          "success": "success",
          "message": "Update Successful",
          "result": {
            "message": "Certificate renewed successfully",
            "old_serial": "7069ca3615e4f3fc",
            "new_serial": "236c4a26dcca0eef",
            "expires_at": "2027-07-19T01:14:59.549Z"
          }
        }
      },
      curl: `curl -X PATCH "${baseUrl}/certificates/7069ca3615e4f3fc/renew" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer <token>" \\
-d '{"daysValid":730}'`
    },
    {
      id: 'verify-certificate',
      title: 'Verify Certificate',
      method: 'PATCH',
      path: '/certificates/:serial/verify',
      description: 'Verify the validity of a certificate',
      authRequired: true,
      request: {
        headers: {
          "Authorization": "Bearer <token>"
        },
        pathParams: {
          serial: "92bc7616126093411"
        }
      },
      response: {
        status: 200,
        body: {
          "success": "success",
          "message": "Data Fetch Successful",
          "data": {
            "serial": "7b52cace2db2bb6b",
            "valid": true,
            "status": "revoked"
          }
        }
      },
      curl: `curl -X PATCH "${baseUrl}/certificates/92bc7616126093411/verify" \\
-H "Authorization: Bearer <token>"`
    },
    {
      id: 'download-certificate',
      title: 'Download Certificate',
      method: 'GET',
      path: '/certificates/:serial/download',
      description: 'Download certificate files (CRT, KEY, P12) as a zip archive',
      authRequired: true,
      request: {
        headers: {
          "Authorization": "Bearer <token>"
        },
        pathParams: {
          serial: "7069ca3615e4f3fc"
        }
      },
      response: {
        status: 200,
        body: "Binary file download"
      },
      curl: `curl -X GET "${baseUrl}/certificates/7069ca3615e4f3fc/download" \\
-H "Authorization: Bearer <token>" \\
--output certificate.zip`
    }
  ];

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const { t } = useTranslation('shared-components');
  const headingTitle = "API Documentation";
  const { theme, toggleTheme } = useTheme();
  useEffect(() => { toggleTheme(t(headingTitle)) }, [t(headingTitle)]);

  return (
    <Box sx={{ p: 4 }}>
      <Box  sx={{ mb: 3, p: 2, backgroundColor: 'primary.light', color:'white', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          API Base URL
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {baseUrl}
          </Typography>
          <Button 
            size="small" 
            startIcon={<ContentCopyIcon />}
            onClick={() => handleCopy(baseUrl)}
            variant="outlined"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </Box>
      </Box>

      <Alert severity="info" icon={<VpnKeyIcon />} sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="bold">Authentication Required</Typography>
        <Typography variant="body2">
          Most endpoints require JWT authentication. Include the token in the Authorization header:
        </Typography>
        <Box component="pre" sx={{ mt: 1, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
          Authorization: Bearer &lt;your_jwt_token&gt;
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Obtain your token from the User Authentication endpoint.
        </Typography>
      </Alert>

      <List>
        {apis.map((api) => (
          <Paper key={api.id} elevation={2} sx={{ mb: 3 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Chip 
                    label={api.method} 
                    color={
                      api.method === 'GET' ? 'primary' : 
                      api.method === 'POST' ? 'success' :
                      api.method === 'PATCH' ? 'warning' :
                      'error'
                    }
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="subtitle1" sx={{ flex: 1 }}>
                    {api.path}
                  </Typography>
                  {api.authRequired && (
                    <Chip 
                      label="Auth" 
                      size="small" 
                      color="secondary" 
                      sx={{ mr: 1 }} 
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>{api.description}</Typography>
                
                {api.authRequired && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Requires valid JWT token in Authorization header
                  </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">cURL</Typography>
                    <Button 
                      size="small" 
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopy(api.curl)}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    value={api.curl}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      sx: {
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        backgroundColor: 'grey.100'
                      }
                    }}
                  />
                </Box>

                <Typography variant="subtitle2">Request</Typography>
                <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.100', mb: 2 }}>
                  {api.request.headers && (
                    <>
                      <Typography variant="overline">Headers:</Typography>
                      <pre style={{ margin: '8px 0' }}>{formatJson(api.request.headers)}</pre>
                    </>
                  )}
                  {api.request.pathParams && (
                    <>
                      <Typography variant="overline">Path Parameters:</Typography>
                      <pre style={{ margin: '8px 0' }}>{formatJson(api.request.pathParams)}</pre>
                    </>
                  )}
                  {api.request.body && (
                    <>
                      <Typography variant="overline">Body:</Typography>
                      <pre style={{ margin: '8px 0 0 0' }}>{formatJson(api.request.body)}</pre>
                    </>
                  )}
                </Paper>

                <Typography variant="subtitle2">Response</Typography>
                <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.100' }}>
                  <Typography variant="caption" color="text.secondary">
                    Status: {api.response.status}
                  </Typography>
                  <pre style={{ margin: '8px 0 0 0' }}>{formatJson(api.response.body)}</pre>
                </Paper>
              </AccordionDetails>
            </Accordion>
          </Paper>
        ))}
      </List>

      <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Authentication Flow
        </Typography>
        <Typography variant="body1" paragraph>
          1. First, obtain a JWT token by calling the <strong>User Authentication</strong> endpoint
        </Typography>
        <Typography variant="body1" paragraph>
          2. For subsequent requests, include the token in the header:
        </Typography>
        <Box component="pre" sx={{ p: 2, backgroundColor: 'white', borderRadius: 1 }}>
          {`// Example using fetch API
fetch('${baseUrl}/protected-route', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})`}
        </Box>
        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
          The authentication response includes:
        </Typography>
        <List dense sx={{ pl: 2 }}>
          <ListItem>
            <ListItemText primary="1. User details (name, email, role)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="2. List of assigned projects with certificates" />
          </ListItem>
          <ListItem>
            <ListItemText primary="3. Access token for subsequent requests" />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default ApiDocumentation;