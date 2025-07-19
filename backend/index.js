import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cluster from  'cluster';
import os from 'os';
import cors from "cors" 
import { CrudRoute } from "./crud/CrudRoute.js";

import { UserRoute } from "./routes/UserRoute.js";
import { HospitalRoute } from "./routes/HospitalRoute.js";
import { HospitalStaffRoute } from "./routes/HospitalStaffRoute.js";
import { ProjectRoute } from "./routes/ProjectRoute.js";
import { CertificateRoute } from "./routes/CertificateRoute.js";

const app = express();
const SYSVERSION = "/api/";

app.use(express.json({limit: '2500mb'}));
 



const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions))  
ProjectRoute
app.use(SYSVERSION, UserRoute);
app.use(SYSVERSION, HospitalRoute);
app.use(SYSVERSION, HospitalStaffRoute);
app.use(SYSVERSION, CrudRoute);
app.use(SYSVERSION, ProjectRoute);
app.use(SYSVERSION, CertificateRoute);

app.use((req, res, next) => {
  res.status(404).json({
    message: "404 not found",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port: ${process.env.PORT}`);
});
