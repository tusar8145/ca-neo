import express from "express";
import { auth } from "../middleware/Auth.js";
import * as HospitalController from "../controllers/HospitalController.js";  //*1
const router = express.Router();
 
router.post("/hospital-manage/list", auth,  HospitalController.manage_list);
router.post("/hospital-manage/create", auth,   HospitalController.manage_create);
router.post("/hospital-manage/remove", auth,   HospitalController.manage_remove);
router.post("/hospital-manage/update", auth,   HospitalController.manage_update);
router.post("/hospital-manage/logo",    HospitalController.manage_logo);
router.get("/hospital-manage/image/:image",    HospitalController.image);
router.post("/hospital-manage/auth",    auth);
export { router as HospitalRoute };  



 