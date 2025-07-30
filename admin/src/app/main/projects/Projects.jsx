import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import axios from 'axios';
import apiConfig from '../../configs/apiConfig';
import Alert from '@mui/material/Alert';
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
  Checkbox,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import ComputerIcon from '@mui/icons-material/Computer';
import DownloadIcon from '@mui/icons-material/Download';
import PeopleIcon from '@mui/icons-material/People';
import {createdAt, formatJapaneseDate} from '../../helpers/timeHelpers';
import { useTheme } from '../../context/ThemeContext';


import { useAppSelector } from 'app/store/hooks';
import { selectUserRole, selectUser } from '../../auth/user/store/userSlice';


    

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

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1.5, 3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark
  }
}));

function Projects() {  
  const { t } = useTranslation('shared-components');
  const headingTitle = "Projects";
  const { theme, toggleTheme } = useTheme();
  useEffect(() => { toggleTheme(t(headingTitle)) }, [t(headingTitle)]);
  const { hospital, toggleHospital } = useTheme();
  axios.defaults.headers.common['X-ClientId-Header'] = hospital?.id || null;

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [successAlert, setSuccessAlert] = useState(null);
  const [failAlert, setFailAlert] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('add');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pc_count: 1,
    days_valid: 365,
    status: 'active',
    auto_create: false
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    description: false,
    pc_count: false,
    days_valid: false
  });
  const [certificatesDialogOpen, setCertificatesDialogOpen] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState([]);
  const [actionLoading, setActionLoading] = useState({
    add: false,
    edit: false,
    delete: false,
    fetch: false,
    addPC: false,
    download: false
  });
  const [addPcDialogOpen, setAddPcDialogOpen] = useState(false);
  const [pcCount, setPcCount] = useState(1);
  const [hospitalStaff, setHospitalStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const user = useAppSelector(selectUser);

  useEffect(() => {
    fetchProjects();
    fetchHospitalStaff();
  }, [hospital]);

  const fetchProjects = async () => {
    setActionLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await axios.get(apiConfig.baseUrl + 'projects');
      setProjects(response.data.data.data);
    } catch (error) {
      setFailAlert('Failed to fetch projects');
      console.error('Error fetching projects:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, fetch: false }));
    }
  };

const fetchHospitalStaff = async () => {
  setStaffLoading(true);
  try {
    const response = await axios.post(`${apiConfig.baseUrl}hospital-staff-manage/list`, {
      take: 100,
      skip: 0,
      order: '',
      others: {
        role: 'staff',
        hospital_id: hospital?.id
      }
    });

    // Handle nested data structure
    const staffData = response.data?.data?.data || [];
    setHospitalStaff(staffData);
  } catch (error) {
    console.error('Error fetching hospital staff:', error);
    setHospitalStaff([]); // Fallback to empty array
  } finally {
    setStaffLoading(false);
  }
};

  const validateForm = () => {
    const errors = {
      name: !formData.name.trim(),
      description: !formData.description.trim(),
      pc_count: formData.pc_count < 1,
      days_valid: dialogType === 'add' ? formData.days_valid < 1 : false
    };
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

const handleEditClick = () => {
  setDialogType('edit');
  setFormData({
    name: selectedProject.name,
    description: selectedProject.description,
    pc_count: selectedProject.pc_count,
    status: selectedProject.status
  });
  
  // Set selected staff from project data
  if (selectedProject.admin_projects) {
    setSelectedStaff(selectedProject.admin_projects.map(ap => ({
      id: ap.admin_id,
      name: ap.admin?.name || 'Unknown',
      ...ap.admin // Include all admin properties
    })) || []);
  }
  
  setFormErrors({
    name: false,
    description: false,
    pc_count: false
  });
  setOpenDialog(true);
  handleMenuClose();
};

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    setActionLoading(prev => ({ ...prev, delete: true }));
    try {
      await axios.delete(`${apiConfig.baseUrl}projects/${selectedProject.id}`);
      setSuccessAlert('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      setFailAlert('Failed to delete project');
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
      setDeleteDialogOpen(false);
    }
  };

  const handleAddClick = () => {
    setDialogType('add');
    setFormData({
      name: '',
      description: '',
      pc_count: 1,
      days_valid: 365,
      status: 'active',
      auto_create: false
    });
    setSelectedStaff([]);
    setFormErrors({
      name: false,
      description: false,
      pc_count: false,
      days_valid: false
    });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: false
      });
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

const handleSubmit = async () => {
  if (!validateForm()) return;

  const actionType = dialogType === 'add' ? 'add' : 'edit';
  setActionLoading(prev => ({ ...prev, [actionType]: true }));

  try {
    if (dialogType === 'add') {
      // Create project with staff assignments in one request
      const projectResponse = await axios.post(apiConfig.baseUrl + 'projects', {
        ...formData,
        staff_ids: selectedStaff.map(staff => staff.id)
      });
      
      setSuccessAlert('Project created successfully');
    } else {
      // Update project with staff assignments
      const { auto_create, days_valid, ...editData } = formData;
      await axios.put(`${apiConfig.baseUrl}projects/${selectedProject.id}`, {
        ...editData,
        staff_ids: selectedStaff.map(staff => staff.id)
      });
      
      setSuccessAlert('Project updated successfully');
    }
    fetchProjects();
    setOpenDialog(false);
  } catch (error) {
    setFailAlert(`Failed to ${dialogType === 'add' ? 'create' : 'update'} project`);
    console.error('Error:', error.response?.data || error.message);
  } finally {
    setActionLoading(prev => ({ ...prev, [actionType]: false }));
  }
};

  const handleShowCertificates = (project) => {
    setSelectedCertificates(project.certificates);
    setCertificatesDialogOpen(true);
  };

  const handleAddPcClick = () => {
    setPcCount(1);
    setAddPcDialogOpen(true);
    handleMenuClose();
  };

  const handleAddPcSubmit = async () => {
    setActionLoading(prev => ({ ...prev, addPC: true }));
    try {
      const response = await axios.post(
        `${apiConfig.baseUrl}projects/${selectedProject.id}/add-pcs`,
        { count: pcCount }
      );
      setSuccessAlert(`Added ${response.data.added_count} PCs to project`);
      fetchProjects();
      setAddPcDialogOpen(false);
    } catch (error) {
      setFailAlert('Failed to add PCs to project. Please Check PC Limit');
      setAddPcDialogOpen(false);
      setTimeout(() => {
        setAddPcDialogOpen(true);
      }, 1000);
    } finally {
      setActionLoading(prev => ({ ...prev, addPC: false }));
    }
  };

  const handleDownloadCertificates = async () => {
    setActionLoading(prev => ({ ...prev, download: true }));
    try {
      const response = await axios.get(
        `${apiConfig.baseUrl}projects/${selectedProject.id}/certificates/download-all`,
        {
          responseType: 'blob',
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedProject.name}_certificates.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setSuccessAlert('Certificates downloaded successfully');
    } catch (error) {
      setFailAlert('Failed to download certificates');
    } finally {
      setActionLoading(prev => ({ ...prev, download: false }));
      handleMenuClose();
    }
  };

  return (
    <Root
      header={
        <div className="p-24 hidden-on-large">
          <h4>{t('Projects')}</h4>
        </div>
      }
      content={
        <div className="flex flex-col p-24 sm:p-40 container">
          {successAlert && (
            <Alert severity="success" className='mb-2' onClose={() => setSuccessAlert(null)}>
              {t(successAlert)}
            </Alert>
          )}
          {failAlert && (
            <Alert severity="error" onClose={() => setFailAlert(null)}>
              {t(failAlert)}
            </Alert>
          )}

{user?.role =='superAdmin' &&
        <div className="flex justify-end mb-4" style={{ padding: '16px 0' }}>
          <StyledButton
            variant="contained"
            className="bg-[#0A2E52BF] hover:bg-[#0A2E52] text-white"
            startIcon={actionLoading.add ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            onClick={handleAddClick}
            disabled={actionLoading.add || !(hospital?.id>0)}
          >
            {actionLoading.add ? t('Creating...') : t('Add New Project')}
          </StyledButton>
        </div>
}
          <TableContainer component={Paper} className="shadow-md rounded-lg">
            <Table className="min-w-full">
              <TableHead className="bg-gray-100">
                <TableRow>
                  <TableCell className="font-bold" width="5%">{t('SL')}</TableCell>
                  <TableCell className="font-bold">{t('Name')}</TableCell>
                  <TableCell className="font-bold">{t('Description')}</TableCell>
                  <TableCell className="font-bold" width="10%">{t('PC Limit')}</TableCell>
                  <TableCell className="font-bold" width="10%">{t('Assigned API Users')}</TableCell>
                  <TableCell className="font-bold" width="10%">{t('Status')}</TableCell>
                  <TableCell className="font-bold" width="15%">{t('Created')}</TableCell>
                  <TableCell className="font-bold" width="15%">{t('Updated')}</TableCell>
                  <TableCell className="font-bold" width="15%">{t('Certificates')}</TableCell>
                  <TableCell className="font-bold" width="10%">{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actionLoading.fetch ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : projects.length > 0 ? (
                  projects
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((project, index) => (
                      <TableRow key={project.id} hover>
                        <TableCell width="5%">{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{project.name}</TableCell>
                        <TableCell className="truncate max-w-xs">
                          <Tooltip title={project.description}>
                            <span>{project.description}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell width="10%">{project.pc_count}</TableCell>
                        <TableCell width="10%">
                          <Tooltip title={project.admin_projects?.map(ap => ap.admin?.name).join(', ') || 'None'}>
                            <div className="flex items-center">
                              <PeopleIcon className="mr-1" fontSize="small" />
                              {project.admin_projects?.length || 0}
                            </div>
                          </Tooltip>
                        </TableCell>
                        <TableCell width="10%">
                          <Chip
                            label={t(project.status)}
                            color={project.status === 'active' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell width="15%">{formatJapaneseDate(project.created_at)}</TableCell>
                        <TableCell width="15%">{formatJapaneseDate(project.updated_at)}</TableCell>
                        <TableCell width="15%">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<InfoIcon />}
                            onClick={() => handleShowCertificates(project)}
                            style={{ backgroundColor: 'white' }}
                          >
                            {t('View')} ({project.certificates.length})
                          </Button>
                        </TableCell>
                        <TableCell width="10%">
                          <IconButton
                            aria-label="more"
                            aria-controls="project-menu"
                            aria-haspopup="true"
                            onClick={(e) => handleMenuClick(e, project)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      {t('No projects found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={projects.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>

          <Menu
            id="project-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditClick}>
              <EditIcon className="mr-2" /> {t('Edit')}
            </MenuItem>
            <MenuItem onClick={handleAddPcClick}>
              <ComputerIcon className="mr-2" /> {t('Add PC')}
            </MenuItem>
            <MenuItem onClick={handleDownloadCertificates}>
              <DownloadIcon className="mr-2" /> {t('Download Certificates')}
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <DeleteIcon className="mr-2" /> {t('Delete')}
            </MenuItem>
          </Menu>

          {/* Add/Edit Dialog */}
          <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle>
              {dialogType === 'add' ? t('Add New Project') : t('Edit Project')}
            </DialogTitle>
            <DialogContent style={{ paddingTop: '16px' }}>
              <div className="grid gap-4 mt-4">
                <TextField
                  fullWidth
                  label={t('Name')}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  required
                  error={formErrors.name}
                  helperText={formErrors.name && t('Name is required')}
                />
                <TextField
                  fullWidth
                  label={t('Description')}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  margin="normal"
                  required
                  error={formErrors.description}
                  helperText={formErrors.description && t('Description is required')}
                />
                <TextField
                  fullWidth
                  label={t('PC Limit')}
                  name="pc_count"
                  type="number"
                  value={formData.pc_count}
                  onChange={handleInputChange}
                  variant="outlined"
                  inputProps={{ min: 1 }}
                  margin="normal"
                  required
                  error={formErrors.pc_count}
                  helperText={formErrors.pc_count && t('PC Limit must be at least 1')}
                />
                
                {dialogType === 'add' && (
                  <>
                    <TextField
                      fullWidth
                      label={t('Validity Days')}
                      name="days_valid"
                      type="number"
                      value={formData.days_valid}
                      onChange={handleInputChange}
                      variant="outlined"
                      inputProps={{ min: 1 }}
                      margin="normal"
                      required
                      error={formErrors.days_valid}
                      helperText={formErrors.days_valid && t('Validity Days must be at least 1')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.auto_create}
                          onChange={handleCheckboxChange}
                          name="auto_create"
                          color="primary"
                        />
                      }
                      label={t('Auto Create Certificates')}
                    />
                  </>
                )}


                <TextField
                  fullWidth
                  select
                  label={t('Status')}
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  required
                >
                  <MenuItem value="active">{t('Active')}</MenuItem>
                  <MenuItem value="inactive">{t('Inactive')}</MenuItem>
                </TextField>

                <br/>
<Autocomplete
  multiple
  options={hospitalStaff}
  getOptionLabel={(option) => option?.name || ''}
  value={selectedStaff || []}
  onChange={(event, newValue) => {
    setSelectedStaff(newValue || []);
  }}
  loading={staffLoading}
  renderInput={(params) => (
    <TextField
      {...params}
      label={t("Assign API User")}
      placeholder={hospitalStaff.length > 0 ? t("Select staff members") : t("No staff available")}
      helperText={hospitalStaff.length === 0 && !staffLoading ? t("No staff members found for this hospital") : ""}
    />
  )}
  isOptionEqualToValue={(option, value) => option?.id === value?.id}
  noOptionsText={
    staffLoading 
      ? "Loading..." 
      : hospitalStaff.length === 0 
        ? t("No staff members available") 
        : t("No options")
  }
  disabled={hospitalStaff.length === 0}
/>


              </div>
            </DialogContent>
            <DialogActions style={{ padding: '16px 24px' }}>
              <Button onClick={handleDialogClose}>{t('Cancel')}</Button>
              <Button 
                onClick={handleSubmit} 
                className="bg-[#0A2E52BF] hover:bg-[#0A2E52] text-white"
                variant="contained"
                disabled={actionLoading.add || actionLoading.edit}
                startIcon={(actionLoading.add || actionLoading.edit) && (
                  <CircularProgress size={20} color="inherit" />
                )}
              >
                {dialogType === 'add' 
                  ? (actionLoading.add ? t('Creating...') : t('Create'))
                  : (actionLoading.edit ? t('Updating...') : t('Update'))}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            maxWidth="sm"
          >
            <DialogTitle>{t('Confirm Delete')}</DialogTitle>
            <DialogContent>
              <p>{t('Are you sure you want to delete this project?')}</p>
            </DialogContent>
            <DialogActions style={{ padding: '16px 24px' }}>
              <Button onClick={() => setDeleteDialogOpen(false)}>
                {t('Cancel')}
              </Button>
              <Button 
                onClick={confirmDelete} 
                variant="contained"
                className="bg-[#ef3c3ce8] hover:bg-[#ea1515] text-white"
                disabled={actionLoading.delete}
                startIcon={actionLoading.delete && (
                  <CircularProgress size={20} color="inherit" />
                )}
              >
                {actionLoading.delete ? t('Deleting...') : t('Delete')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add PC Dialog */}
          <Dialog
            open={addPcDialogOpen}
            onClose={() => setAddPcDialogOpen(false)}
            maxWidth="sm"
          >
            <DialogTitle>{t('Add PCs to Project')}</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label={t('Number of PCs to Add')}
                type="number"
                value={pcCount}
                onChange={(e) => setPcCount(Math.max(1, parseInt(e.target.value) || 1))}
                variant="outlined"
                margin="normal"
                inputProps={{ min: 1 }}
                required
              />
            </DialogContent>
            <DialogActions style={{ padding: '16px 24px' }}>
              <Button onClick={() => setAddPcDialogOpen(false)}>
                {t('Cancel')}
              </Button>
              <Button 
                onClick={handleAddPcSubmit} 
                className="bg-[#0A2E52BF] hover:bg-[#0A2E52] text-white"
                variant="contained"
                disabled={actionLoading.addPC}
                startIcon={actionLoading.addPC && (
                  <CircularProgress size={20} color="inherit" />
                )}
              >
                {actionLoading.addPC ? t('Adding...') : t('Add PCs')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Certificates Dialog */}
          <Dialog
            open={certificatesDialogOpen}
            onClose={() => setCertificatesDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>{t('Project Certificates')}</DialogTitle>
            <DialogContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Serial Number')}</TableCell>
                      <TableCell>{t('PC Identifier')}</TableCell>
                      <TableCell>{t('Status')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCertificates.map((cert, index) => (
                      <TableRow key={index}>
                        <TableCell>{cert.serial}</TableCell>
                        <TableCell>{cert.pc_identifier}</TableCell>
                        <TableCell>
                          <Chip
                            label={t(cert.status)}
                            color={cert.status === 'active' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions style={{ padding: '16px 24px' }}>
              <Button 
                onClick={() => setCertificatesDialogOpen(false)}
                style={{ backgroundColor: '#f5f5f5' }}
              >
                {t('Close')}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      }
    />
  );
}

export default Projects;