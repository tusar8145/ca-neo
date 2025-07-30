// Certificates.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import axios from 'axios';
import apiConfig from '../../configs/apiConfig';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  Tooltip,
  CircularProgress,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { createdAt, formatJapaneseDate } from '../../helpers/timeHelpers';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTheme } from '../../context/ThemeContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
 

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider
  },
  '& .FusePageSimple-content': {
    padding: theme.spacing(4)
  },
  '& .FusePageSimple-sidebarHeader': {},
  '& .FusePageSimple-sidebarContent': {}
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 'active' ? theme.palette.success.main : theme.palette.error.main,
  color: theme.palette.common.white,
  fontWeight: 600
}));

function Certificates() {
  const { t } = useTranslation('shared-components');
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [successAlert, setSuccessAlert] = useState(null);
  const [failAlert, setFailAlert] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    renew: false,
    revoke: false,
    delete: false,
    verify: false,
    update: false,
    download: false
  });
  const [daysValid, setDaysValid] = useState(365);
  const [revokeReason, setRevokeReason] = useState('');
  const [certificateDetails, setCertificateDetails] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newCommonName, setNewCommonName] = useState('');
  const [commonNameError, setCommonNameError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(null);

  const { hospital, toggleHospital } = useTheme();
  axios.defaults.headers.common['X-ClientId-Header'] = hospital?.id || null;



  useEffect(() => {
    fetchProjects();
    fetchCertificates();
  }, [hospital]);

  useEffect(() => {
    fetchCertificates();
  }, [selectedProject, selectedStatus, hospital]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(apiConfig.baseUrl + 'projects');
      setProjects(response.data.data.data);
    } catch (error) {
      setFailAlert('Failed to fetch projects');
    }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      let url = `${apiConfig.baseUrl}certificates?status=${selectedStatus}`;
      if (selectedProject) {
        url += `&projectId=${selectedProject}`;
      }
      const response = await axios.get(url);
      setCertificates(response.data.data.certificates);
    } catch (error) {
      setFailAlert('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificateDetails = async (serial) => {
    try {
      const response = await axios.get(`${apiConfig.baseUrl}certificates/${serial}`);
      setCertificateDetails(response.data.data);
    } catch (error) {
      setFailAlert('Failed to fetch certificate details');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, certificate) => {
    setAnchorEl(event.currentTarget);
    setSelectedCertificate(certificate);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRenewClick = () => {
    setDialogType('renew');
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleRevokeClick = () => {
    setDialogType('revoke');
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDialogType('delete');
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleVerifyClick = () => {
    verifyCertificate();
    handleMenuClose();
  };

  const handleDetailsClick = async () => {
    await fetchCertificateDetails(selectedCertificate.serial);
    setDetailsDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setDaysValid(365);
    setRevokeReason('');
  };

  const renewCertificate = async () => {
    setActionLoading(prev => ({ ...prev, renew: true }));
    try {
      const response = await axios.patch(
        `${apiConfig.baseUrl}certificates/${selectedCertificate.serial}/renew`,
        { daysValid }
      );
      setSuccessAlert('Certificate renewed successfully');
      fetchCertificates();
    } catch (error) {
      setFailAlert('Failed to renew certificate');
    } finally {
      setActionLoading(prev => ({ ...prev, renew: false }));
      handleDialogClose();
    }
  };

  const revokeCertificate = async () => {
    setActionLoading(prev => ({ ...prev, revoke: true }));
    try {
      const response = await axios.patch(
        `${apiConfig.baseUrl}certificates/${selectedCertificate.serial}/revoke`,
        { reason: revokeReason }
      );
      setSuccessAlert('Certificate revoked successfully');
      fetchCertificates();
    } catch (error) {
      setFailAlert('Failed to revoke certificate');
    } finally {
      setActionLoading(prev => ({ ...prev, revoke: false }));
      handleDialogClose();
    }
  };

  const deleteCertificate = async () => {
    setActionLoading(prev => ({ ...prev, delete: true }));
    try {
      const response = await axios.delete(
        `${apiConfig.baseUrl}certificates/${selectedCertificate.serial}/delete`
      );
      setSuccessAlert('Certificate deleted successfully');
      fetchCertificates();
    } catch (error) {
      setFailAlert('Failed to delete certificate');
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
      handleDialogClose();
    }
  };

  const verifyCertificate = async () => {
    setActionLoading(prev => ({ ...prev, verify: true }));
    try {
      const response = await axios.patch(
        `${apiConfig.baseUrl}certificates/${selectedCertificate.serial}/verify`
      );
      setSuccessAlert('Certificate verified successfully');
      fetchCertificates();
    } catch (error) {
      setFailAlert(error.response.data.message);
    } finally {
      setActionLoading(prev => ({ ...prev, verify: false }));
    }
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    setPage(0);
  };

  const handleEditClick = () => {
    setNewCommonName(selectedCertificate.common_name);
    setCommonNameError('');
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setNewCommonName('');
    setCommonNameError('');
  };

  const validateCommonName = () => {
    if (!newCommonName || newCommonName.trim().length === 0) {
      setCommonNameError(t('User Name is required'));
      return false;
    }
    if (newCommonName.length > 64) {
      setCommonNameError(t('Maximum 64 characters allowed'));
      return false;
    }
    setCommonNameError('');
    return true;
  };

  const updateCommonName = async () => {
    if (!validateCommonName()) return;

    try {
      setActionLoading(prev => ({ ...prev, update: true }));
      const response = await axios.patch(
        `${apiConfig.baseUrl}certificates/${selectedCertificate.serial}/common-name`,
        { common_name: newCommonName }
      );

      setSuccessAlert('User Name updated successfully');
      fetchCertificates();
      handleEditDialogClose();
    } catch (error) {
      setFailAlert(error.response?.data?.message || 'Failed to update User Name');
    } finally {
      setActionLoading(prev => ({ ...prev, update: false }));
    }
  };
const ExcelIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#217346"/>
    <path d="M14 2V8H20M16 13H8V11H16V13ZM16 17H8V15H16V17ZM10 9H8V7H10V9Z" fill="white"/>
  </svg>
);
  const downloadCertificate = async () => {
    setActionLoading(prev => ({ ...prev, download: true }));
    try {
      const response = await axios.get(
        `${apiConfig.baseUrl}certificates/${selectedCertificate.serial}/download`,
        {
          responseType: 'blob',
        }
      );

      const filename = `client_${selectedCertificate.pc_identifier}_${selectedCertificate.common_name}.p12`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setSuccessAlert('Certificate downloaded successfully');
    } catch (error) {
      setFailAlert('Failed to download certificate');
    } finally {
      setActionLoading(prev => ({ ...prev, download: false }));
      handleMenuClose();
    }
  };

  const copyPassword = (password) => {
    navigator.clipboard.writeText(password);
    setCopiedPassword(password);
    setTimeout(() => setCopiedPassword(null), 2000);
  };

  const exportToExcel = () => {
    const dataToExport = filteredCertificates.map(cert => ({
      'Serial': cert.serial,
      'User Name': cert.common_name,
      'PC Identifier': cert.pc_identifier,
      'Project': cert.project_name,
      'Status': cert.status,
      'Password': cert.p12_password,
      'Issued At': formatJapaneseDate(cert.issued_at),
      'Expires At': formatJapaneseDate(cert.expires_at),
      'Revoked At': cert.revoked_at ? formatJapaneseDate(cert.revoked_at) : '',
      'Revocation Reason': cert.revocation_reason || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates');
    XLSX.writeFile(workbook, `certificates_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToCSV = () => {
    const dataToExport = filteredCertificates.map(cert => ({
      'Serial': cert.serial,
      'User Name': cert.common_name,
      'PC Identifier': cert.pc_identifier,
      'Project': cert.project_name,
      'Status': cert.status,
      'Password': cert.p12_password,
      'Issued At': formatJapaneseDate(cert.issued_at),
      'Expires At': formatJapaneseDate(cert.expires_at),
      'Revoked At': cert.revoked_at ? formatJapaneseDate(cert.revoked_at) : '',
      'Revocation Reason': cert.revocation_reason || ''
    }));

    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(dataToExport));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `certificates_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const headingTitle = "Certificates";
  const { theme, toggleTheme } = useTheme();
  useEffect(() => { toggleTheme(t(headingTitle)) }, [t(headingTitle)]);

  const filteredCertificates = certificates.filter(certificate => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (certificate.serial && certificate.serial.toLowerCase().includes(term)) ||
      (certificate.common_name && certificate.common_name.toLowerCase().includes(term)) ||
      (certificate.pc_identifier && certificate.pc_identifier.toLowerCase().includes(term)) ||
      (certificate.project_name && certificate.project_name.toLowerCase().includes(term)) ||
      (certificate.status && certificate.status.toLowerCase().includes(term))
    );
  });

  return (
    <Root
      header={
        <div className="p-24 hidden-on-large">
          <h4>{t('Certificate Management')}</h4>
        </div>
      }
      content={
        <div className="flex flex-col p-24 sm:p-40 container">
          {successAlert && (
            <Alert severity="success" onClose={() => setSuccessAlert(null)} sx={{ mb: 2 }}>
              {t(successAlert)}
            </Alert>
          )}
          {failAlert && (
            <Alert severity="error" onClose={() => setFailAlert(null)} sx={{ mb: 2 }}>
              {t(failAlert)}
            </Alert>
          )}

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>{t('Project')}</InputLabel>
              <Select
                value={selectedProject}
                onChange={handleProjectChange}
                label={t('Project')}
              >
                <MenuItem value="">
                  <em>{t('All Projects')}</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>{t('Status')}</InputLabel>
              <Select
                value={selectedStatus}
                onChange={handleStatusChange}
                label={t('Status')}
              >
                <MenuItem value="all">{t('All Statuses')}</MenuItem>
                <MenuItem value="active">{t('Active')}</MenuItem>
                <MenuItem value="revoked">{t('Revoked')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={t('Search Certificates')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                endAdornment: searchTerm && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />



 

            <IconButton
              onClick={fetchCertificates}
              color="primary"
              aria-label="refresh"
              size="large"
            >
              <RefreshIcon />
            </IconButton>
 

            <IconButton
              onClick={exportToExcel}
              color="primary"
              className='ml-1'
              aria-label="refresh"
              size="large"
            >
              <ExcelIcon />
            </IconButton> 
          </div>

          <TableContainer component={Paper} className="shadow-md rounded-lg">
            <Table className="min-w-full">
              <TableHead className="bg-gray-100">
                <TableRow>
                  <TableCell className="font-bold">{t('Serial')}</TableCell>
                  <TableCell className="font-bold">{t('User Name')}</TableCell>
                  <TableCell className="font-bold">{t('PC Identifier')}</TableCell>
                  <TableCell className="font-bold">{t('Project')}</TableCell>
                  <TableCell className="font-bold">{t('Status')}</TableCell>
                  <TableCell className="font-bold">{t('Password')}</TableCell>
                  <TableCell className="font-bold">{t('Issued At')}</TableCell>
                  <TableCell className="font-bold">{t('Expires At')}</TableCell>
                  <TableCell className="font-bold">{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredCertificates.length > 0 ? (
                  filteredCertificates
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((certificate) => (
                      <TableRow key={certificate.serial} hover>
                        <TableCell>
                          <Tooltip title={certificate.serial}>
                            <span className="truncate max-w-xs inline-block">
                              {certificate.serial}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{certificate.common_name}</TableCell>
                        <TableCell>{certificate.pc_identifier}</TableCell>
                        <TableCell>{certificate.project_name}</TableCell>
                        <TableCell>
                          <StatusChip
                            label={t(certificate.status)}
                            status={certificate.status}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Tooltip 
                              title={copiedPassword === certificate.p12_password ? 'Copied!' : 'Copy password'}
                              placement="top"
                            >
                              <IconButton
                                size="small"
                                onClick={() => copyPassword(certificate.p12_password)}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              ••••••••
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{formatJapaneseDate(certificate.issued_at)}</TableCell>
                        <TableCell>{formatJapaneseDate(certificate.expires_at)}</TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="more"
                            aria-controls="certificate-menu"
                            aria-haspopup="true"
                            onClick={(e) => handleMenuClick(e, certificate)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {t('No certificates found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredCertificates.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>

          <Menu
            id="certificate-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleDetailsClick}>
              <InfoIcon className="mr-2" /> {t('Details')}
            </MenuItem>
            <MenuItem onClick={() => downloadCertificate()}>
              <FileDownloadIcon className="mr-2" /> {t('Download Certificate')}
            </MenuItem>
            <MenuItem 
              onClick={handleRenewClick} 
              disabled={selectedCertificate?.status !== 'active'}
            >
              <AutorenewIcon className="mr-2" /> {t('Renew')}
            </MenuItem>
            <MenuItem 
              onClick={handleRevokeClick} 
              disabled={selectedCertificate?.status !== 'active'}
            >
              <BlockIcon className="mr-2" /> {t('Revoke')}
            </MenuItem>
            <MenuItem onClick={handleEditClick}>
              <EditIcon className="mr-2" /> {t('Edit User Name')}
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <DeleteIcon className="mr-2" /> {t('Delete')}
            </MenuItem>
            <MenuItem onClick={handleVerifyClick}>
              <CheckCircleIcon className="mr-2" /> {t('Verify')}
            </MenuItem>
          </Menu>

          <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
            <DialogTitle>{t('Edit User Name')}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label={t('User Name')}
                type="text"
                fullWidth
                variant="outlined"
                value={newCommonName}
                onChange={(e) => setNewCommonName(e.target.value)}
                error={!!commonNameError}
                helperText={commonNameError}
                onBlur={validateCommonName}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditDialogClose}>{t('Cancel')}</Button>
              <Button
                onClick={updateCommonName}
                className="bg-[#0A2E52BF] hover:bg-[#0A2E52] text-white"
                variant="contained"
                disabled={actionLoading.update}
                startIcon={actionLoading.update && <CircularProgress size={20} />}
              >
                {actionLoading.update ? t('Updating...') : t('Update')}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openDialog && dialogType === 'renew'} onClose={handleDialogClose}>
            <DialogTitle>{t('Renew Certificate')}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label={t('Validity Days')}
                type="number"
                fullWidth
                variant="outlined"
                value={daysValid}
                onChange={(e) => setDaysValid(e.target.value)}
                inputProps={{ min: 1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>{t('Cancel')}</Button>
              <Button 
                onClick={renewCertificate} 
                className="bg-[#0A2E52BF] hover:bg-[#0A2E52] text-white"
                variant="contained"
                disabled={actionLoading.renew}
                startIcon={actionLoading.renew && <CircularProgress size={20} />}
              >
                {actionLoading.renew ? t('Renewing...') : t('Renew')}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openDialog && dialogType === 'revoke'} onClose={handleDialogClose}>
            <DialogTitle>{t('Revoke Certificate')}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label={t('Reason')}
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>{t('Cancel')}</Button>
              <Button 
                onClick={revokeCertificate} 
                className="bg-[#ef3c3ce8] hover:bg-[#ea1515] text-white"
                variant="contained"
                disabled={actionLoading.revoke}
                startIcon={actionLoading.revoke && <CircularProgress size={20} />}
              >
                {actionLoading.revoke ? t('Revoking...') : t('Revoke')}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openDialog && dialogType === 'delete'} onClose={handleDialogClose}>
            <DialogTitle>{t('Delete Certificate')}</DialogTitle>
            <DialogContent>
              <Typography>{t('Are you sure you want to delete this certificate?')}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>{t('Cancel')}</Button>
              <Button 
                onClick={deleteCertificate} 
                className="bg-[#ef3c3ce8] hover:bg-[#ea1515] text-white"
                variant="contained"
                disabled={actionLoading.delete}
                startIcon={actionLoading.delete && <CircularProgress size={20} />}
              >
                {actionLoading.delete ? t('Deleting...') : t('Delete')}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog 
            open={detailsDialogOpen} 
            onClose={() => setDetailsDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            {certificateDetails && (
              <>
                <DialogTitle>
                  <Box display="flex" alignItems="center">
                    <Avatar className="mr-2">
                      <InfoIcon />
                    </Avatar>
                    <Typography variant="h6">
                      {t('Certificate Details')} - {certificateDetails.serial}
                    </Typography>
                  </Box>
                </DialogTitle>
                <DialogContent dividers>
                  <Box mb={3}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('Basic Information')}
                    </Typography>
                    <Divider />
                    <Box mt={2} display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={2}>
                      <div>
                        <Typography variant="body2" color="textSecondary">
                          {t('User Name')}
                        </Typography>
                        <Typography variant="body1">
                          {certificateDetails.common_name}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="textSecondary">
                          {t('PC Identifier')}
                        </Typography>
                        <Typography variant="body1">
                          {certificateDetails.pc_identifier}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="textSecondary">
                          {t('Project')}
                        </Typography>
                        <Typography variant="body1">
                          {certificateDetails.project_name}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="textSecondary">
                          {t('Status')}
                        </Typography>
                        <StatusChip
                          label={t(certificateDetails.status)}
                          status={certificateDetails.status}
                        />
                      </div>
                      <div>
                        <Typography variant="body2" color="textSecondary">
                          {t('Password')}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Tooltip title="Copy password">
                            <IconButton
                              size="small"
                              onClick={() => copyPassword(certificateDetails.p12_password)}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Typography variant="body1" sx={{ ml: 1 }}>
                            {certificateDetails.p12_password}
                          </Typography>
                        </Box>
                      </div>
                      <div>
                        <Typography variant="body2" color="textSecondary">
                          {t('Issued At')}
                        </Typography>
                        <Typography variant="body1">
                          {formatJapaneseDate(certificateDetails.issued_at)}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="textSecondary">
                          {t('Expires At')}
                        </Typography>
                        <Typography variant="body1">
                          {formatJapaneseDate(certificateDetails.expires_at)}
                        </Typography>
                      </div>
                      {certificateDetails.revoked_at && (
                        <div>
                          <Typography variant="body2" color="textSecondary">
                            {t('Revoked At')}
                          </Typography>
                          <Typography variant="body1">
                            {formatJapaneseDate(certificateDetails.revoked_at)}
                          </Typography>
                        </div>
                      )}
                      {certificateDetails.revocation_reason && (
                        <div>
                          <Typography variant="body2" color="textSecondary">
                            {t('Revocation Reason')}
                          </Typography>
                          <Typography variant="body1">
                            {certificateDetails.revocation_reason}
                          </Typography>
                        </div>
                      )}
                    </Box>
                  </Box>

                  <Box mt={3}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('Activity Logs')}
                    </Typography>
                    <Divider />
                    {certificateDetails.logs?.length > 0 ? (
                      <List>
                        {certificateDetails.logs.map((log) => (
                          <ListItem key={log.id} divider>
                            <ListItemText
                              primary={
                                <Box display="flex" justifyContent="space-between">
                                  <Typography>
                                    <strong>{t(log.action)}</strong> - {log.note}
                                  </Typography>
                                  <Typography variant="caption">
                                    {formatJapaneseDate(log.created_at)}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box display="flex" alignItems="center" mt={1}>
                                  {log.previous_status && (
                                    <>
                                      <Chip
                                        label={t(log.previous_status)}
                                        size="small"
                                        variant="outlined"
                                        className="mr-1"
                                      />
                                      <CancelIcon fontSize="small" className="mx-1" />
                                    </>
                                  )}
                                  <Chip
                                    label={t(log.new_status)}
                                    size="small"
                                    color={log.new_status === 'active' ? 'success' : 'error'}
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="textSecondary" align="center">
                        {t('No activity logs found')}
                      </Typography>
                    )}
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button 
                    onClick={() => setDetailsDialogOpen(false)}
                    color="primary"
                  >
                    {t('Close')}
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </div>
      }
    />
  );
}

export default Certificates;