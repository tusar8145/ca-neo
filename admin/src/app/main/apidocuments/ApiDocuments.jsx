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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCopy = (text) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apis = [
    {
      id: 'admin-login',
      title: 'Admin Login',
      method: 'POST',
      path: '/admin/login',
      description: 'Authenticate admin user and retrieve JWT token',
      authRequired: false,
      request: {
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          password: "12345678Ss.",
          email: "admin@dpc-management.com"
        }
      },
      response: {
        status: 200,
        body: {
          "user": {
            "uid": 3,
            "role": "hospitalAssistant",
            "data": {
              "displayName": "CA Neo",
              "email": "ca-neo@gmail.com"
            },
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          }
        }
      },
      curl: `curl -X POST "http://localhost:3000/api/admin/login" \\
-H "Content-Type: application/json" \\
-d '{"password":"12345678Ss.","email":"admin@dpc-management.com"}'`
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
      curl: `curl -X GET "http://localhost:3000/api/certificates/7069ca3615e4f3fc" \\
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
      curl: `curl -X PATCH "http://localhost:3000/api/certificates/7069ca3615e4f3fc/common-name" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer <token>" \\
-d '{"common_name":"Test"}'`
    },
    {
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
      curl: `curl -X DELETE "http://localhost:3000/api/certificates/7069ca3615e4f3fc/delete" \\
-H "Authorization: Bearer <token>"`
    },
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
      curl: `curl -X PATCH "http://localhost:3000/api/certificates/7611ee6a908a0a12/revoke" \\
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
      curl: `curl -X PATCH "http://localhost:3000/api/certificates/7069ca3615e4f3fc/renew" \\
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
      curl: `curl -X PATCH "http://localhost:3000/api/certificates/92bc7616126093411/verify" \\
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
      curl: `curl -X GET "http://localhost:3000/api/certificates/7069ca3615e4f3fc/download" \\
-H "Authorization: Bearer <token>" \\
--output certificate.zip`
    }
  ];

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };


  const { t } = useTranslation('shared-components');

    const headingTitle ="API Documentation"
    const { theme, toggleTheme } = useTheme();
    useEffect(() => {  toggleTheme(t(headingTitle))  }, [t(headingTitle)]);


  return (
    <Box sx={{ p: 4 }}>
 
      <Alert severity="info" icon={<VpnKeyIcon />} sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="bold">Authentication Required</Typography>
        <Typography variant="body2">
          Most endpoints require JWT authentication. Include the token in the Authorization header:
        </Typography>
        <Box component="pre" sx={{ mt: 1, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
          Authorization: Bearer &lt;your_jwt_token&gt;
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Obtain your token from the Admin Login endpoint.
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
          1. First, obtain a JWT token by calling the <strong>Admin Login</strong> endpoint
        </Typography>
        <Typography variant="body1" paragraph>
          2. For subsequent requests, include the token in the header:
        </Typography>
        <Box component="pre" sx={{ p: 2, backgroundColor: 'white', borderRadius: 1 }}>
          {`// Example using fetch API
fetch('/api/protected-route', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})`}
        </Box>
        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
          Your backend middleware will:
        </Typography>
        <List dense sx={{ pl: 2 }}>
          <ListItem>
            <ListItemText primary="1. Check for Authorization header" />
          </ListItem>
          <ListItem>
            <ListItemText primary="2. Extract the JWT token (removing 'Bearer ' prefix)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="3. Verify the token using your JWT_SECRET" />
          </ListItem>
          <ListItem>
            <ListItemText primary="4. Attach the decoded user to req.user" />
          </ListItem>
          <ListItem>
            <ListItemText primary="5. Return 401 Unauthorized if token is missing or invalid" />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default ApiDocumentation;