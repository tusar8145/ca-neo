import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Typography,
  Tooltip
} from '@mui/material';
import { Search, Warning, CheckCircle, Block } from '@mui/icons-material';
import axios from 'axios';
import apiConfig from '../../configs/apiConfig';
import { formatJapaneseDate, daysUntil } from '../../helpers/timeHelpers';
import { useTheme } from '../../context/ThemeContext';


const ExpiringCertificatesPage = () => {
  const { t } = useTranslation('shared-components');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [daysThreshold, setDaysThreshold] = useState(1000);

  useEffect(() => {
    const fetchExpiringCertificates = async () => {
      try {
        const response = await axios.get(
          `${apiConfig.baseUrl}certificates/expiring/${daysThreshold}`,
          {
   
          }
        );
        setCertificates(response.data.data.expiringCerts);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch expiring certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringCertificates();
  }, [daysThreshold]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredCertificates = certificates.filter(cert => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cert.serial.toLowerCase().includes(searchLower) ||
      cert.common_name.toLowerCase().includes(searchLower) ||
      cert.pc_identifier.toLowerCase().includes(searchLower) ||
      cert.project.name.toLowerCase().includes(searchLower)
    );
  });

  const getExpiryStatus = (expiryDate) => {
    const days = daysUntil(expiryDate);
    if (days <= 30) return 'critical';
    if (days <= 90) return 'warning';
    return 'normal';
  };

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

    const headingTitle ="Expired Certificates"
    const { theme, toggleTheme } = useTheme();
     toggleTheme(t(headingTitle)) 
  
  

  return (
    <Box sx={{ p: 3 }}>
 

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder={t('Search certificates...')}
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />

        <TextField
          select
          label={t('Expiry Threshold (days)')}
          value={daysThreshold}
          onChange={(e) => setDaysThreshold(e.target.value)}
          variant="outlined"
          size="small"
          SelectProps={{ native: true }}
          sx={{ width: 200 }}
        >
          <option value={30}>30 {t('days')}</option>
          <option value={60}>60 {t('days')}</option>
          <option value={90}>90 {t('days')}</option>
          <option value={180}>180 {t('days')}</option>
          <option value={365}>1 {t('year')}</option>
          <option value={1000}>{t('All active')}</option>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('Serial')}</TableCell>
              <TableCell>{t('User Name')}</TableCell>
              <TableCell>{t('PC Identifier')}</TableCell>
              <TableCell>{t('Project')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
              <TableCell>{t('Issued At')}</TableCell>
              <TableCell>{t('Expires At')}</TableCell>
              <TableCell>{t('Days Left')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCertificates.length > 0 ? (
              filteredCertificates
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((cert) => {
                  const daysLeft = daysUntil(cert.expires_at);
                  const expiryStatus = getExpiryStatus(cert.expires_at);
                  
                  return (
                    <TableRow key={cert.serial} hover>
                      <TableCell>
                        <Tooltip title={cert.serial}>
                          <span style={{ fontFamily: 'monospace' }}>
                            {cert.serial.substring(0, 8)}...
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{cert.common_name}</TableCell>
                      <TableCell>{cert.pc_identifier}</TableCell>
                      <TableCell>{cert.project.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(cert.status)}
                          color={cert.status === 'active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatJapaneseDate(cert.issued_at)}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {expiryStatus === 'critical' && (
                            <Warning color="error" sx={{ mr: 1 }} />
                          )}
                          {expiryStatus === 'warning' && (
                            <Warning color="warning" sx={{ mr: 1 }} />
                          )}
                          {expiryStatus === 'normal' && (
                            <CheckCircle color="success" sx={{ mr: 1 }} />
                          )}
                          {formatJapaneseDate(cert.expires_at)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${daysLeft} ${t('days')}`}
                          color={
                            expiryStatus === 'critical' 
                              ? 'error' 
                              : expiryStatus === 'warning' 
                                ? 'warning' 
                                : 'success'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {t('No expiring certificates found')}
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

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <CheckCircle color="success" sx={{ mr: 1 }} />
          <Typography variant="body2">{t('More than 90 days')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Warning color="warning" sx={{ mr: 1 }} />
          <Typography variant="body2">{t('30-90 days')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Warning color="error" sx={{ mr: 1 }} />
          <Typography variant="body2">{t('Less than 30 days')}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ExpiringCertificatesPage;