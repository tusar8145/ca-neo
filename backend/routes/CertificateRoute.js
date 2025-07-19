// backend/src/routes/certificateRoutes.js
import express from 'express';
import {
  createProjectWithCertificates,
  downloadCertificate,
  revokeCertificate,
  renewCertificate,
  downloadProjectCACertificate,
  getProjectCRL,
  verifyCertificate,
  getCertificateList,
  getCertificateDetails,
  downloadProjectCerts,
  deletePCWithCertificate,
  addNewPCsWithCertificates,
  deleteProjectPCWithCertificate,
  getExpiringCertificates,
  getUserActions,
  updateCommonNameBySerial,
  getAllUsersActivity
} from '../controllers/CertificateController.js';
import { auth } from "../middleware/Auth.js";

const router = express.Router();

// Certificate Operations
router.get('/certificates', auth, getCertificateList);
router.get('/certificates/:serial', auth, getCertificateDetails);

router.get('/certificates/:serial/download', auth, downloadCertificate);

router.patch('/certificates/:serial/revoke', auth, revokeCertificate);
router.patch('/certificates/:serial/renew', auth, renewCertificate);
router.patch('/certificates/:serial/verify', auth, verifyCertificate);
router.delete('/certificates/:serial/delete', auth, deletePCWithCertificate);

// Project Operations
router.post('/projects', auth, createProjectWithCertificates);
router.post('/projects/:projectId/add-pcs', auth, addNewPCsWithCertificates);

router.get('/projects/:projectId/ca-certificate', auth, downloadProjectCACertificate);
router.get('/projects/:projectId/crl', auth, getProjectCRL);
router.get('/projects/:projectId/certificates/download-all', auth, downloadProjectCerts);

router.delete('/projects/:projectId', auth, deleteProjectPCWithCertificate);

//others
router.get('/certificates/expiring/:days', auth, getExpiringCertificates);
router.get('/certificates/actions', auth, getUserActions);

// routes/certificateRoutes.js
router.patch('/certificates/:serial/common-name', auth, updateCommonNameBySerial);

router.get('/user/activity',  auth,  getAllUsersActivity);

export { router as CertificateRoute };  

