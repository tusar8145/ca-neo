import express from "express";
import { auth } from "../middleware/Auth.js";
import * as UserController from "../controllers/UserController.js";  //*1
const router = express.Router();
 
router.post("/admin/registration",   UserController.registration);
router.post("/admin/login",   UserController.login);
router.get("/admin/refresh",   UserController.refresh);
router.post("/admin/uploads/:counts",   UserController.uploads);
router.post("/admin/update_password",   UserController.update_password);

export { router as UserRoute };  



 