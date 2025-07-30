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
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Person as PersonIcon,
  History as HistoryIcon,
  Assignment as CertificateIcon,
  Folder as ProjectIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import axios from 'axios';
import apiConfig from '../../configs/apiConfig';
import { formatJapaneseDate } from '../../helpers/timeHelpers';
import { useTheme } from '../../context/ThemeContext';

const Root = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh'
}));

const ActivityCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  transition: 'box-shadow 0.3s',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 'active' ? theme.palette.success.light : theme.palette.error.light,
  color: status === 'active' ? theme.palette.success.dark : theme.palette.error.dark
}));

function UserActivityPage() {
  const { t } = useTranslation('shared-components');

    const headingTitle ="User Activity"
    const {  hospital, theme, toggleTheme } = useTheme();
    useEffect(() => {  toggleTheme(t(headingTitle))  }, [t(headingTitle)]);
  

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

 
  axios.defaults.headers.common['X-ClientId-Header'] = hospital?.id || null;


  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await axios.get(`${apiConfig.baseUrl}user/activity`, {
       
        });
        setData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [hospital]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
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

  if (!data) {
    return null;
  }


 

  return ( 
    <Root>
      

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }} >
        <Grid item xs={12} sm={6} md={3}>
          <ActivityCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    {t('Total Users')}
                  </Typography>
                  <Typography variant="h4">{data.stats.total_users}</Typography>
                </Box>
              </Box>
            </CardContent>
          </ActivityCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ActivityCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <HistoryIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    {t('Total Actions')}
                  </Typography>
                  <Typography variant="h4">{data.stats.total_actions}</Typography>
                </Box>
              </Box>
            </CardContent>
          </ActivityCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ActivityCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                  <ActiveIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    {t('Active Users')}
                  </Typography>
                  <Typography variant="h4">{data.stats.active_users}</Typography>
                </Box>
              </Box>
            </CardContent>
          </ActivityCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ActivityCard>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  {data.stats.by_role.admin}
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    {t('Admin Users')}
                  </Typography>
                  <Typography variant="h4">{data.stats.by_role.admin}</Typography>
                </Box>
              </Box>
            </CardContent>
          </ActivityCard>
        </Grid>
      </Grid>
 
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label={t('User List')} />
          <Tab label={t('Recent Activity')} />
          <Tab label={t('Statistics')} />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('User')}</TableCell>
                <TableCell>{t('Role')}</TableCell>
                <TableCell align="right">{t('Total Actions')}</TableCell>
                <TableCell align="right">{t('Certificate Logs')}</TableCell>
                <TableCell align="right">{t('Certificates Created')}</TableCell>
                <TableCell align="right">{t('Projects Created')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography>{user.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(user.role)}
                      color={
                        user.role === 'admin' 
                          ? 'primary' 
                          : user.role === 'hospitalAssistant' 
                            ? 'secondary' 
                            : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{user.total_actions}</TableCell>
                  <TableCell align="right">{user.certificate_logs}</TableCell>
                  <TableCell align="right">{user.certificates_created}</TableCell>
                  <TableCell align="right">{user.projects_created}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 1 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Timestamp')}</TableCell>
                  <TableCell>{t('User')}</TableCell>
                  <TableCell>{t('Action')}</TableCell>
                  <TableCell>{t('Target')}</TableCell>
                  <TableCell>{t('Project')}</TableCell>
                  <TableCell>{t('Details')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recent_activity
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((activity) => (
                    <TableRow key={activity.id} hover>
                      <TableCell>{formatJapaneseDate(activity.timestamp)}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {activity.actor_name.charAt(0)}
                          </Avatar>
                          {activity.actor_name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={activity.action_display}
                          status={activity.action === 'revoke' ? 'inactive' : 'active'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {activity.type === 'certificate' ? (
                          <Typography noWrap>
                            {activity.target} ({activity.serial})
                          </Typography>
                        ) : (
                          activity.target
                        )}
                      </TableCell>
                      <TableCell>{activity.project_name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {activity.note}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={data.recent_activity.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
 
{tabValue === 2 && (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <ActivityCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('Actions by Role')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {Object.entries(data.stats.by_role).map(([role, count]) => (
              <ListItem key={role} divider>
                <ListItemText
                  primary={t(role)}
                  secondary={`${count} ${t('users')}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </ActivityCard>
    </Grid>
    <Grid item xs={12} md={6}>
      <ActivityCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('Activity Distribution')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem divider>
              <ListItemAvatar>
                <Avatar>
                  <CertificateIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={t('Certificate Logs')}
                secondary={`${data.users.reduce((sum, user) => sum + user.certificate_logs, 0)} ${t('actions')}`}
              />
            </ListItem>
            <ListItem divider>
              <ListItemAvatar>
                <Avatar>
                  <CertificateIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={t('Certificates Created')}
                secondary={`${data.users.reduce((sum, user) => sum + user.certificates_created, 0)} ${t('actions')}`}
              />
            </ListItem>
            <ListItem divider>
              <ListItemAvatar>
                <Avatar>
                  <CertificateIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={t('Certificates Updated')}
                secondary={`${data.users.reduce((sum, user) => sum + user.certificates_updated, 0)} ${t('actions')}`}
              />
            </ListItem>
            <ListItem divider>
              <ListItemAvatar>
                <Avatar>
                  <ProjectIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={t('Projects Created')}
                secondary={`${data.users.reduce((sum, user) => sum + user.projects_created, 0)} ${t('actions')}`}
              />
            </ListItem>
            <ListItem divider>
              <ListItemAvatar>
                <Avatar>
                  <ProjectIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={t('Projects Updated')}
                secondary={`${data.users.reduce((sum, user) => sum + user.projects_updated, 0)} ${t('actions')}`}
              />
            </ListItem>
          </List>
        </CardContent>
      </ActivityCard>
    </Grid>
  </Grid>
)}
    </Root>
  );
}

export default UserActivityPage;