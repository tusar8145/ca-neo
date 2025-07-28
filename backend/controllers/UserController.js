import { PrismaClient } from '@prisma/client';

import { user_id } from '../middleware/Auth.js';
import { rand } from '../helpers/RandomHash.js';
import { currentTimeValue } from '../helpers/Timer.js';
const prisma = new PrismaClient();
import { created_at } from '../helpers/Timer.js';
import * as response from "../helpers/Response.js";
import jwt from "jsonwebtoken";
import md5 from "md5";

import fs from 'node:fs';
import path  from 'path';
import { fileURLToPath } from 'url';
import { IncomingForm } from 'formidable';
import  multer   from 'multer';

const storage = multer.diskStorage({
 destination: function (req, file, cb) {
   cb(null, 'uploads/')
 },
 filename: function (req, file, cb) {
   const uniqueSuffix = file.originalname
   cb(null, uniqueSuffix)
 }
})


const upload = multer({ storage: storage })

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 

export const uploads = async (req, res, next) => {
    try {
 

        //app.post('/api/pod/:counts', async (req, res, next) => {
           //console.log('99999999999999999999999999999999999999999999999999999999999999',req.params.counts);
             const uploadDir = path.join(__dirname + '/uploads'); 
             if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, '0777', true);
             const customOptions = { uploadDir: uploadDir, keepExtensions: true, allowEmptyFiles: false, maxFileSize: 5 * 1024 * 1024 * 1024, multiples: true };
             const form = new IncomingForm(customOptions);
 
             let file_count = req.params.counts
            
             form.parse(req, (err, fields, files) => {
               if (err) {
              
                 next(err);
                 return;
               }
               for (let x = 0; x < file_count; x++) {
                 try {
     
                   const file = files['file-' + x.toString()]
                   let str = file.toString()
                   const myArray = str.split(",");
           
           
                   const ssmyArray1 = myArray[1].split(":");
                   var trimmedStr = ssmyArray1[1].trimStart();
                   trimmedStr = trimmedStr.trimEnd();
                   const newFilepath = `${uploadDir}/${trimmedStr}`;
           
           
           
                   const ssmyArray1_1 = myArray[0].split(":");
                   var trimmedStr_1 = ssmyArray1_1[1].trimStart();
                   trimmedStr_1 = trimmedStr_1.trimEnd();
                   const newFilepath_1 = `${uploadDir}/${trimmedStr_1}`;
           
           
              
                   fs.rename(newFilepath_1, newFilepath, err => err);
           
                 } catch (error) {
                 
                 }
           
           
                 //console.log(file.name,'file-'+x.toString())
               }
               res.status(200).json({});
             });
          

    } catch (error) {
        //next(error)
        response.error(error,res,next)
    }
};

export const update_password = async (req, res, next) => {
    try {

        let  password=req.body.password
        let  old_password=req.body.old_password
        let id=req.body.id

        var admins = null;
        admins = await prisma.admins.findMany({
            where: {
                id: id,
                password: md5(old_password),
            }
        });

        if(admins.length>0){
            const update1 = await prisma.admins.updateMany({
                where: {
                id: id,
                },
                data: {
                ...password?{password:md5(password)}:{},
                },
            });

            res.status(200).json({
                success: 'success',
                message: 'Password updated successful',
            });

        }else{
            res.status(200).json({
                success: 'error',
                message: 'Invalid current password',
            });
        }



    } catch (error) {
        //next(error)
        response.error(error,res,next)
    }
};     

export const login = async (req, res, next) => {
    try {
        
        const req_data = req.body

        const email = req.body.email;
        const password = req.body.password;

        if (!email.length > 2 && !password.length > 2) {
            res.status(401).json({
                success: false,
                message: "unauthorize",
            });
        }

        var admins = null;
        admins = await prisma.admins.findMany({
            where: {
                email: email,
                password: md5(password),
            },
            include:{hospital:{select:{logo:true, name: true, address:true, id:true, primary_color:true, sub_color_1:true, sub_color_2:true, }}}
        });

        let hospital=null
        if(admins[0]?.hospital_id>0){
              hospital = await prisma.hospitals.findUnique({
                where: {
                    id: admins[0]?.hospital_id, 
                }, 
            });

          
        }

 
        if (Object.keys(admins).length > 0) {

 
            let this_user = admins[0]

            const authorization = jwt.sign(
                { ...admins[0],  ...this_user.hospital_id?{"hospital":{id:this_user.hospital_id, name:hospital?.name, logo:hospital?.logo, address:hospital?.address, primary_color:hospital?.primary_color, sub_color_1:hospital?.sub_color_1, sub_color_2:hospital?.sub_color_2, }}:{"hospital":this_user?.hospital,}, },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_VALIDITY }
            );           

            const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
            let logo = this_user.photo || 'user.png'
            res.status(200).json(
                {


                    "user": {
                        "uid": this_user.id,
                        "role": this_user.role,
                        "data": {
                            "displayName": this_user.name,
                            "phone":this_user.phone,
                            "photoURL": url.origin+'/api/hospital-manage/image/'+logo,
                            "email": this_user.email,
                            "settings": {
                                "layout": {},
                                "theme": {}
                            },
                            "shortcuts": [
                                "apps.calendar",
                                "apps.mailbox",
                                "apps.contacts"
                            ]
                        },
                        
                        ...this_user.hospital_id?{"hospital":{id:this_user.hospital_id, name:hospital?.name, logo:hospital?.logo, address:hospital?.address, primary_color:hospital?.primary_color, sub_color_1:hospital?.sub_color_1, sub_color_2:hospital?.sub_color_2,}}:{"hospital":this_user?.hospital,},
                        "title": "hi"
                    },
                    "access_token": authorization

                }
            );

        } else {
            res.status(404).json({
                success: false,
                getadmin: admins,
            });
        }
    } catch (error) {
        //next(error)
        response.error(error,res,next)
    }
};


export const authenticate = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || email.length < 3 || password.length < 3) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - invalid credentials",
            });
        }

        // Find admin with hospital and associated projects (only selected fields)
        const admins = await prisma.admins.findMany({
            where: {
                email: email,
                password: md5(password),
            },
            include: {
                hospital: {
                    select: {
                        logo: true, 
                        name: true, 
                        address: true, 
                        id: true, 
                        primary_color: true, 
                        sub_color_1: true, 
                        sub_color_2: true
                    }
                },
                admin_projects: {
                    include: {
                        project: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                pc_count: true,
                                status: true,
                                certificates: {
                                    select: {
                                        id: true,
                                        serial: true,
                                        common_name: true,
                                        pc_identifier: true,
                                        issued_at: true,
                                        expires_at: true,
                                        revoked_at: true,
                                        status: true,
                                        p12_password: true,
                                        download_count: true,
                                        revocation_reason: true,
                                        previous_serial: true,
                                        created_at: true,
                                        updated_at: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }



        const this_user = admins[0];
        const hospital = this_user.hospital;

        // Format projects with only the requested fields
        const projects = this_user.admin_projects.map(ap => ({
            id: ap.project.id,
            name: ap.project.name,
            description: ap.project.description,
            pc_count: ap.project.pc_count,
            status: ap.project.status,
            certificates: ap.project.certificates
        }));

        //auth
        let admins2 = null;
        admins2 = await prisma.admins.findMany({
            where: {
                email: email,
                password: md5(password),
            },
            include:{hospital:{select:{logo:true, name: true, address:true, id:true, primary_color:true, sub_color_1:true, sub_color_2:true, }}}
        });

        const authorization = jwt.sign(
            { 
                ...admins2[0],
                hospital: hospital,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_VALIDITY }
        );

        res.status(200).json({
            user: {
                uid: md5(this_user.id),
                data: {
                    displayName: this_user.name,
                    phone: this_user.phone,
                    email: this_user.email,
                    role: this_user.role
                },
            },
            projects: projects,
            access_token: authorization
        });

    } catch (error) {
        console.error('Authentication error:', error);
        response.error(error, res, next);
    }
};

export const refresh = async (req, res, next) => {
    try {

        let token = req.headers.authorization;
        token = token.split(" ")[1];
        let user = jwt.verify(token, process.env.JWT_SECRET);
        const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        let logo = user.photo || 'user.png'


        console.log(user,'user')

        res.status(200).json(
            {

                "uid": user.id,
                "role": user.role,
                "data": {
                    "displayName": user.name,
                    "phone":user.phone,
                    "photoURL": url.origin+'/api/hospital-manage/image/'+logo,
                    "email": user.email,
                    "settings": {
                        "layout": {},
                        "theme": {}
                    },
                    "shortcuts": [
                        "apps.calendar",
                        "apps.mailbox",
                        "apps.contacts"
                    ]
                },

                hospital:user.hospital
            }
        );

    } catch (error) {
        //next(error)
        response.error(error,res,next)
    }
};



export const registration = async (req, res, next) => {
    try {
        const { name, password, email, phone, role, hospital_id, created_by } = req.body;
       
        // Check if the email is already in use
        const existingadmin = await prisma.admins.findUnique({
            where: {
                email: email,
            },
        });

        if (existingadmin) {
            return res.status(200).json({ success: 'error', message: 'Email already in use' });
        }

        // Hash the password
        // Save the admin to the database
        const addadmin = await prisma.admins.create({
            data: {
                name: name,
                email: email,
                phone: phone,
                role: role,
                ...hospital_id?{hospital_id:hospital_id}:{},
                ...created_by?{created_by:created_by}:{},
                password: md5(password),
            },
        });

        // Create a JWT token
        const authorization = jwt.sign({ id: addadmin.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_VALIDITY });

        if(req.body.return==true){
            return addadmin.id;
        }else{
            return res.status(200).json({
                success: true,
                message: "admin created successfully!",
                authorization: authorization,
                id: addadmin.id,
            });            
        }



    } catch (error) {
   
        response.error(error,res,next)
        //next(error)
    }
}; 

