import express from "express";
import { auth } from "../middleware/Auth.js";
import * as HospitalStaffController from "../controllers/HospitalStaffController.js";  //*1
const router = express.Router();
 
router.post("/hospital-staff-assistant-manage/list", auth,     HospitalStaffController.manage_list_assis);
router.post("/hospital-staff-manage/list", auth,     HospitalStaffController.manage_list);
router.post("/hospital-staff-manage/create", auth,   HospitalStaffController.manage_create);
router.post("/hospital-staff-manage/remove", auth,   HospitalStaffController.manage_remove);
router.post("/hospital-staff-manage/update", auth,   HospitalStaffController.manage_update);
router.post("/hospital-staff-manage/logo",           HospitalStaffController.manage_logo);
router.post("/issue/issue-file",     HospitalStaffController.manage_issue_file);
router.get("/issue/image/:image",    HospitalStaffController.image);

router.get("/hospital-staff-manage/image/:image",    HospitalStaffController.image);
export { router as HospitalStaffRoute };  



 