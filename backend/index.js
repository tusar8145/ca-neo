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

app.use((req, res, next) => {
  const clientId = req.headers['x-clientid-header'] || null;
  if(clientId){
    req.clientId = parseInt(clientId); // Now available in all route handlers
  }else{
    req.clientId = null
  }
  next();
});

// Add this new route before your other routes
app.get('/api/connection-test', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Backend Connection Test</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 500px;
          margin: 0 auto;
        }
        .success {
          color: #4CAF50;
          font-size: 24px;
          margin-bottom: 20px;
        }
        button {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
        }
        button:hover {
          background: #45a049;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success">✓</div>
        <h1>Backend Connected Successfully</h1>
        <p>You can safely close this tab now.</p>
        <button onclick="window.close()">Close This Tab</button>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});


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
