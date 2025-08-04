import { PrismaClient } from '@prisma/client';

import { user_id } from '../middleware/Auth.js';
import { rand } from '../helpers/RandomHash.js';
import { currentTimeValue } from '../helpers/Timer.js';
const prisma = new PrismaClient();
import { created_at,timeBeauty } from '../helpers/Timer.js';

import jwt from "jsonwebtoken";
import md5 from "md5";

import fs from 'node:fs';
import path  from 'path';
import { fileURLToPath } from 'url';
import { IncomingForm } from 'formidable';
import  multer   from 'multer';
import * as response from "../helpers/Response.js";
import { registration } from './UserController.js';
import { create } from '../crud/CrudController.js';
import axios from 'axios';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/') // Uploads will be saved in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname) // File names will be unique
  }
});

const upload = multer({ storage: storage });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
  
 
export const manage_list = async (req, res, next) => {
  try {

    let f_columnFilters = req.body?.filter?.f_columnFilters
    let globalFilter = req.body?.filter?.globalFilter
    let f_globalFilters = req.body?.filter?.f_globalFilters

      let result_=await prisma.hospitals.findMany({
          ...response.list_paginate(req),
          where: {
            ...f_columnFilters ? { ...f_columnFilters } : {},
            ...globalFilter ?{...f_globalFilters} : {},
          },
          include: {
            admin: true,
            creator:{select:{
              name:true
            }},
          },
        })

        const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        const result=[]
        for (let h = 0; h < result_.length; h++) {
            let this_=result_[h]

            let logo = this_.logo || 'default.png'

            

            result.push({
              "id": this_.id,
              "logo": url.origin+'/api/hospital-manage/image/'+logo,
              "name": this_.name,
              "address": this_.address,
              "created_by": 1,
              "created_at": timeBeauty(this_.created_at),
              "updated_at": timeBeauty(this_.updated_at),
              "admin_id": this_.admin.id,
              "admin_name": this_.admin.name,
              "admin_email": this_.admin.email,
              "admin_password":null,
              "admin_phone": this_.admin.phone,
              "admin_role": this_.admin.role,
              "creator":this_.creator.name,
              "primary_color":this_.primary_color
            })
        }
   
      response.list(result,res)
  } catch (error) {
      response.error(error,res,next)    
  }
};




export const manage_create = async (req, res, next) => {
  try {
 
 
      req.body.name=req.body.admin_name
      req.body.email=req.body.admin_email
      req.body.phone=req.body.admin_phone
      req.body.role='admin'

      req.body.password=req.body.admin_password

      req.body.return=true
      let reg=await registration(req, res, next)
      let clock=created_at()

      let hospital_data={
        "name": req.body.name,
        "address": req.body.address,
        "created_at": clock,
        "created_by":user_id,
        primary_color:req.body.primary_color,

        admin_id:reg
      }

      let hos=null
      if(reg>0){
        //create hospital
        req.body=hospital_data
        req.query.return=true
        req.params.table='hospitals'
        hos=await create(req, res, next)
      }
      response.create(hos,res)
  } catch (error) {
      response.error(error,res,next)    
  }
};

export const image =   async (req, res, next) => {
  let image = req.params.image
  res.sendFile(path.join(__dirname.replace("\controllers", "") + "./uploads/"+image));
};


export const manage_logo =   async (req, res, next) => {
 
  const uploadDir = path.join(__dirname.replace("\controllers", "") + '/uploads'); 
 
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, '0777', true);
  const customOptions = { uploadDir: uploadDir, keepExtensions: true, allowEmptyFiles: false, maxFileSize: 5 * 1024 * 1024 * 1024, multiples: true };
  const form = new IncomingForm(customOptions);
 // console.log(form)
  let file_count = req.query.counts

  let id=parseInt(req.query.id)

  form.parse(req, async (err, fields, files) => {
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
        const newFilepath_1 = `${uploadDir}/${'fff'+trimmedStr_1}`;


        //console.log(trimmedStr,trimmedStr_1, 'yyyyyyyyyyy')
        fs.rename(newFilepath_1, newFilepath, err => err);


        //update hospital db
        const updatedHospital = await prisma.hospitals.update({
          where: { id: id },
          data: { logo: trimmedStr_1 },
        });


      } catch (error) {
        console.log(error, 'error')
      }


      //console.log(file.name,'file-'+x.toString())
    }
    res.status(200).json({});
  });
};

export const manage_update = async (req, res, next) => {
  try {
    let clock=created_at()
 
    //admin update
    let name=req.body.admin_name
    let email=req.body.admin_email
    let phone=req.body.admin_phone
    let primary_color=req.body.primary_color

 
    let password=null
    if(req.body.admin_password){
      password=req.body.admin_password
    }
    
    //hospital update
    let id=req.body.id
    let h_name=req.body.name
    let h_address=req.body.address
    let updated_at=clock
    let updated_by=user_id

 
    const filterhospitals = await prisma.hospitals.findMany({
      where: {
        id:id,
      },
    });


    const update1 = await prisma.admins.updateMany({
      where: {
        id: filterhospitals[0].admin_id,
      },
      data: {
         name:name,
         email:email,
         phone:phone,
        ...password?{password:md5(password)}:{},
      },
    });

    const update2 = await prisma.hospitals.updateMany({
      where: {
        id: id,
      },
      data: {
         name:h_name,
         address:h_address,
         updated_at:updated_at,
         updated_by:updated_by,
         primary_color:primary_color,

      },
    });

    let res_final=[]
    if(update1){res_final=update1}else{res_final=update2}
 

      response.update([],res)
  } catch (error) {
      response.error(error,res,next)    
  }
};


export const manage_remove = async (req, res, next) => {
  try {
    const hospitalId = req.body.id;
    const adminEmail = req.body.admin_email;

    // First, find the hospital and its admin
    const hospital = await prisma.hospitals.findUnique({
      where: { id: hospitalId },
      include: { admin: true }
    });

    if (!hospital) {
      return response.error({ message: "Hospital not found" }, res, next);
    }

    // Check if the provided email matches the hospital admin's email
    if (hospital.admin.email !== adminEmail) {
      return response.error({ message: "Admin email doesn't match hospital admin" }, res, next);
    }

    // Delete related data in the correct order:

    // 1. Delete certificate logs for certificates in projects of this hospital
    await prisma.certificate_logs.deleteMany({
      where: {
        certificate: {
          project: {
            admin_projects: {
              some: {
                admin: {
                  hospital_id: hospitalId
                }
              }
            }
          }
        }
      }
    });

    // 2. Delete certificates in projects of this hospital
    await prisma.certificates.deleteMany({
      where: {
        project: {
          admin_projects: {
            some: {
              admin: {
                hospital_id: hospitalId
              }
            }
          }
        }
      }
    });

    // 3. Delete admin_projects relations for admins of this hospital
    await prisma.admin_projects.deleteMany({
      where: {
        admin: {
          hospital_id: hospitalId
        }
      }
    });

    // 4. Delete projects created by admins of this hospital
    await prisma.projects.deleteMany({
      where: {
        OR: [
          { created_by: { in: await prisma.admins.findMany({ 
            where: { hospital_id: hospitalId },
            select: { id: true }
          }).then(admins => admins.map(a => a.id)) } },
          { updated_by: { in: await prisma.admins.findMany({ 
            where: { hospital_id: hospitalId },
            select: { id: true }
          }).then(admins => admins.map(a => a.id)) } }
        ]
      }
    });

    // 5. Delete other admins associated with this hospital (non-admin role)
    await prisma.admins.deleteMany({
      where: {
        hospital_id: hospitalId,
        id: { not: hospital.admin_id } // don't delete the main admin yet
      }
    });

    // 6. Delete the hospital
    await prisma.hospitals.delete({
      where: { id: hospitalId }
    });

    // 7. Finally, delete the main admin
    const deletedAdmin = await prisma.admins.delete({
      where: { id: hospital.admin_id }
    });

    response.remove(deletedAdmin, res);

  } catch (error) {
    console.error("Error in manage_remove:", error);
    response.error(error, res, next);
  }
};
