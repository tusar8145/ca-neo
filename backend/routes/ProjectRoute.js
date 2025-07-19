import express from 'express';
import { auth } from "../middleware/Auth.js";
import * as projectController from "../controllers/ProjectController.js";

const router = express.Router();


router.get('/projects', auth, projectController.list);
router.get('/projects/:id', auth, projectController.show);
router.put('/projects/:id', auth, projectController.update);


export { router as ProjectRoute };  
