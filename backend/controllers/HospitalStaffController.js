import { PrismaClient } from '@prisma/client';

import { user_id } from '../middleware/Auth.js';
import { rand } from '../helpers/RandomHash.js';
import { currentTimeValue } from '../helpers/Timer.js';
const prisma = new PrismaClient();
import { created_at } from '../helpers/Timer.js';

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
  


export const manage_list_assis = async (req, res, next) => {
  try {
    const result=[]
    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);


    let f_columnFilters = req.body?.filter?.f_columnFilters
    let globalFilter = req.body?.filter?.globalFilter
    let f_globalFilters = req.body?.filter?.f_globalFilters
    let others =req.body?.filter?.others

      let result_=await prisma.admins.findMany({
          ...response.list_paginate(req),
          where: {
            ...others?{...others}:{}
          },
          include: {
            staff_hospital: true,
            creator:{select:{
              name:true
            }},
          },
        })

        let result2_=null
        
        if(result_.length>0){
            result2_=await prisma.admins.findMany({
              ...response.list_paginate(req),
              where: {
                id:result_[0]?.staff_hospital.admin_id
              },
              include: {
                creator:{select:{
                  name:true
                }},
              },
            })   
            
            let kkkk=result2_[0]
            let logox = kkkk.photo || 'defaultUser.png'
            result.push({
              "id": kkkk.id,
              "photo": url.origin+'/api/hospital-manage/image/'+logox,
              "name": kkkk.name,
              "email": kkkk.email,
              "address": kkkk.address,
              "created_by": kkkk.created_by,
              "created_at": kkkk.created_at,
              "updated_at": kkkk.updated_at,
              "hospital_id": kkkk.hospital_id,
              "password":null,
              "phone": kkkk.phone,
              "role": kkkk.role,
              "creator":kkkk?.creator?.name,
            })
            
        }
 
 
       
      
        for (let h = 0; h < result_.length; h++) {
            let this_=result_[h]

            let logo = this_.photo || 'defaultUser.png'

            

            result.push({
              "id": this_.id,
              "photo": url.origin+'/api/hospital-manage/image/'+logo,
              "name": this_.name,
              "email": this_.email,
              "address": this_.address,
              "created_by": this_.created_by,
              "created_at": this_.created_at,
              "updated_at": this_.updated_at,
              "hospital_id": this_.hospital_id,
              "password":null,
              "phone": this_.phone,
              "role": this_.role,
              "creator":this_?.creator?.name,
            })
        }



        


   
      response.list(result,res)
  } catch (error) {
      response.error(error,res,next)    
  }
};



export const manage_list = async (req, res, next) => {
  try {
    const { take, skip, order, others } = req.body;
    const hospitalId = others?.hospital_id ? parseInt(others.hospital_id) : null;

    // Base where conditions
    const whereConditions = {
      role: 'staff' // Always filter by staff role
    };

    // Add hospital filter if provided
    if (hospitalId) {
      whereConditions.hospital_id = hospitalId;
    }

    // Add other filters from 'others' except hospital_id
    if (others) {
      Object.entries(others).forEach(([key, value]) => {
        if (key !== 'hospital_id' && value !== undefined) {
          whereConditions[key] = value;
        }
      });
    }

    let result_ = await prisma.admins.findMany({
      take: take || 100,
      skip: skip || 0,
      orderBy: order ? JSON.parse(order) : undefined,
      where: whereConditions,
      include: {
        staff_hospital: true,
        creator: {
          select: {
            name: true
          }
        },
      },
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = result_.map(admin => ({
      id: admin.id,
      photo: `${baseUrl}/api/hospital-manage/image/${admin.photo || 'defaultUser.png'}`,
      name: admin.name,
      email: admin.email,
      address: admin.address,
      created_by: admin.created_by,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
      hospital_id: admin.hospital_id,
      password: null,
      phone: admin.phone,
      role: admin.role,
      creator: admin?.creator?.name,
    }));

    response.list({
      success: "success",
      message: "Data Fetch Successful",
      data: result
    }, res);
  } catch (error) {
    response.error(error, res, next);    
  }
};




export const manage_create = async (req, res, next) => {
  try {
 
      req.body.name=req.body.name
      req.body.email=req.body.email
      req.body.phone=req.body.phone
      req.body.hospital_id=req.body.hospital_id
      req.body.role='staff'
      req.body.created_by=user_id

      req.body.password=req.body.password

      req.body.return=true
      let reg=await registration(req, res, next)
      let clock=created_at()
 
      response.create(reg,res)
  } catch (error) {
      response.error(error,res,next)    
  }
};

export const image =   async (req, res, next) => {
  let image = req.params.image
  res.sendFile(path.join(__dirname.replace("\controllers", "") + "./uploads/"+image));
};


export const manage_issue_file =   async (req, res, next) => {

  console.log('333333')
  let img_name=''
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


        //console.log(newFilepath_1, newFilepath, 'newFilepath')
        fs.rename(newFilepath_1, newFilepath, err => err);
        img_name=trimmedStr_1

        //update hospital db
        /*const updatedHospital = await prisma.admins.update({
          where: { id: id },
          data: { photo: trimmedStr_1 },
        });*/


      } catch (error) {
        console.log(error, 'error')
      }


      //console.log(file.name,'file-'+x.toString())
    }
    res.status(200).json({img_name:img_name});
  });
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


        //console.log(newFilepath_1, newFilepath, 'newFilepath')
        fs.rename(newFilepath_1, newFilepath, err => err);


        //update hospital db
        const updatedHospital = await prisma.admins.update({
          where: { id: id },
          data: { photo: trimmedStr_1 },
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
    let id=req.body.id
    let name=req.body.name
    let email=req.body.email
    let phone=req.body.phone

    let password=null
    if(req.body.password){
      password=req.body.password
    }
 
    const update1 = await prisma.admins.updateMany({
      where: {
        id: id,
      },
      data: {
         name:name,
         email:email,
         phone:phone,
        ...password?{password:md5(password)}:{},
      },
    });
 

      response.update(update1,res)
  } catch (error) {
      response.error(error,res,next)    
  }
};


export const manage_remove = async (req, res, next) => {
  try {
    let email=req.body.email
 
    //if success remove hospital
 
        let  delete_ =  await prisma.admins.delete({
          where: {
             email: email 
          },
        })
 
  
  
      response.remove(delete_,res)
  } catch (error) {
      response.error(error,res,next)    
  }
};

