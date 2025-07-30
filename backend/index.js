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
  const referer = req.get('Referer') || req.headers.referer || '/';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Backend Connection Test</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: rgba(76, 175, 80, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .banner {
          position: fixed;
          top: 0;
          width: 100%;
          background: rgba(76, 175, 80, 0.9);
          color: white;
          padding: 15px 0;
          font-size: 18px;
          text-align: center;
          font-weight: bold;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 500px;
          text-align: center;
        }
        .success {
          color: #4CAF50;
          font-size: 36px;
          margin-bottom: 10px;
        }
        h1 {
          margin-top: 0;
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
        .countdown {
          margin: 10px 0;
          font-size: 14px;
          color: #666;
        }
      </style>
      <script>
        // Get the referer URL from server-side variable
        const refererUrl = "${referer}";
        let secondsLeft = 2;
        
        // Countdown function
        function updateCountdown() {
          document.getElementById('countdown').textContent = 
            'Redirecting back in ' + secondsLeft + ' second' + (secondsLeft !== 1 ? 's' : '') + '...';
          secondsLeft--;
          
          if (secondsLeft < 0) {
            try {
              // First try to go back in history
              if (window.history.length > 1) {
                window.history.back();
              } 
              // Fallback to redirect if no history
              else if (refererUrl) {
                window.location.href = refererUrl;
              }
            } catch (e) {
              document.getElementById('manual-redirect').style.display = 'block';
            }
          } else {
            setTimeout(updateCountdown, 1000);
          }
        }
        
        // Start countdown when page loads
        window.onload = function() {
          updateCountdown();
        };
      </script>
    </head>
    <body>
      <div class="banner">Backend Connected | バックエンドに接続されました</div>
      <div class="container">
        <div class="success">✓</div>
        <h1>Backend Connected Successfully</h1>
        <p id="countdown" class="countdown">Redirecting back in 2 seconds...</p>
        <div id="manual-redirect" style="display: none;">
          <p>Automatic redirect failed.</p>
          <button onclick="window.history.back()">Go Back</button>
          ${referer ? `<button onclick="window.location.href='${referer}'">Return to Site</button>` : ''}
        </div>
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
