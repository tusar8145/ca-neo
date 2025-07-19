import express from "express";
import * as CrudController from "./CrudController.js";
import { auth } from "../middleware/Auth.js";
const router = express.Router();

router.post("/crud/:table/create", CrudController.create);
router.post("/crud/:table/update", auth, CrudController.update);
router.post("/crud/:table/list", CrudController.list);
router.post("/crud/:table/count", CrudController.count);
router.post("/crud/:table/remove", CrudController.remove);
router.post("/crud/:table/remove-all", CrudController.remove_all);
router.post("/crud/:table/count/:group", CrudController.count_group);
router.post("/crud/test", CrudController.test);
export { router as CrudRoute };



 