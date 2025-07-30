import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';
import apiConfig from '../../configs/apiConfig';
import {
  Computer as ComputerIcon,
  Folder as ProjectIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import {createdAt, formatJapaneseDate} from '../../helpers/timeHelpers';
import { useTheme } from '../../context/ThemeContext';


const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.02)'
  }
}));


const ProjectStatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 'active' ? theme.palette.success.light : theme.palette.error.light,
  color: status === 'active' ? theme.palette.success.dark : theme.palette.error.dark
}));

function ProjectsDashboard() {
  const { t } = useTranslation('shared-components');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);


  const headingTitle ="Dashboard"
  const { theme, toggleTheme } = useTheme();
  useEffect(() => {  toggleTheme(t(headingTitle))  }, [t(headingTitle)]);

  const { hospital, toggleHospital } = useTheme();
  axios.defaults.headers.common['X-ClientId-Header'] = hospital?.id || null; 

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(apiConfig.baseUrl + 'projects', {
      
        });
        setProjects(response.data.data.data);
      } catch (err) {
        setError('Failed to fetch projects data');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [hospital]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Calculate dashboard metrics
  const totalProjects = projects.length;
  const totalPCs = projects.reduce((sum, project) => sum + project.pc_count, 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const certificatesCount = projects.reduce((sum, project) => sum + project.certificates.length, 0);
 
  return (
    <Box sx={{ p: 3 }}>
       

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <ProjectIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    {t('Total Projects')}
                  </Typography>
                  <Typography variant="h4">{totalProjects}</Typography>
                </Box>
              </Box>
            </CardContent>
          </DashboardCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <ComputerIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    {t('Total PCs')}
                  </Typography>
                  <Typography variant="h4">{totalPCs}</Typography>
                </Box>
              </Box>
            </CardContent>
          </DashboardCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                  <ActiveIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    {t('Active Projects')}
                  </Typography>
                  <Typography variant="h4">{activeProjects}</Typography>
                </Box>
              </Box>
            </CardContent>
          </DashboardCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  {certificatesCount}
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    {t('Certificates Issued')}
                  </Typography>
                  <Typography variant="h4">{certificatesCount}</Typography>
                </Box>
              </Box>
            </CardContent>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Projects List */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('All Projects')}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} key={project.id}>
              <DashboardCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{project.name}</Typography>
                    <ProjectStatusChip
                      label={t(project.status)}
                      status={project.status}
                      size="small"
                    />
                  </Box>

                  <Typography color="textSecondary" variant="body2" sx={{ mt: 1, mb: 2 }}>
                    {project.description}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>{t('PCs')}:</strong> {project.pc_count}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('Created')}:</strong> {formatJapaneseDate(project.created_at)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t('Certificates')} ({project.certificates.length})
                  </Typography>

                  <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                    {project.certificates.map((cert) => (
                      <ListItem key={cert.serial} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {cert.pc_identifier.replace('PC-', '')}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">{cert.serial}</Typography>
                              <Chip
                                label={t(cert.status)}
                                size="small"
                                color={cert.status === 'active' ? 'success' : 'error'}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </DashboardCard>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('Recent Activity')}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          {projects.slice(0, 3).map((project) => (
            <ListItem key={project.id} divider>
              <ListItemAvatar>
                <Avatar>
                  <ProjectIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${project.name} (${project.pc_count} PCs)`}
                secondary={`Last updated: ${formatJapaneseDate(project.updated_at)}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default ProjectsDashboard;