import express from "express";
import * as response from '../helpers/Response.js';
import { user_id } from '../middleware/Auth.js';
import {created_at} from '../helpers/Timer.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const create = async (req, res, next) => {
    try {
        let table_name=req.params.table
        const result = await prisma[`${table_name}`].createMany({
            data: req.body,
            skipDuplicates: true,
        }) 
  
        if(req.query.return==true){
            return result;
        }else{
            response.create(result,res)
        }
        

    } catch (error) {
        response.error(error,res,next)
    }
}
 

export const update =  async (req, res, next) => {
    try {   
        let table_name=req.params.table

        let receipt = req.body.receipt  
        let hospital_id=req.body.hospital_id

        let data = req.body

        let clock=created_at()
      
      
        Reflect.deleteProperty(data, 'receipt');  
        Reflect.deleteProperty(data, 'hospital_id');

        let updateMany =[]

        if(hospital_id>0){

            //find parent_id
            const parent = await prisma[`${table_name}`].findMany({
                where: {
                    receipt: parseInt(receipt),
                    parent_id:null
                },
              })
             
            if(parent.length>0){
                    updateMany = await prisma[`${table_name}`].updateMany({
                        where: {
                            receipt: parseInt(receipt),
                            hospital_id: parseInt(hospital_id),
                        },
                        data: {...data, updated_at:clock,},
                    })  

                    if(updateMany.count==0){
                        updateMany = await prisma[`${table_name}`].createMany({
                            data:{
                                ...data,
                                parent_id:parent[0].id,
                                receipt: parseInt(receipt),
                                hospital_id: parseInt(hospital_id),
                                created_at:clock,
                                updated_at:clock,
                                created_by:user_id                        
                            }  
                        }) 
                    }                
            }  



        }else{
            //update by recept
            updateMany = await prisma[`${table_name}`].updateMany({
                where: {
                    receipt:  parseInt(receipt),   
                    hospital_id: null
                },
                data: {...data, updated_at:clock,},
            })            
        }
 
        response.update(updateMany,res)

    }catch(error){
        response.error(error,res,next)
    }
}; 

export const list =  async (req, res, next) => {
    try {   

        let hospital_id=parseInt(req.query.hospital || null)
        let child=parseInt(req.query.child || null)
        const ignore = req.ignore || [];
        let where_con=req.where_con
        let table_name=null

        if(req.return==true){
             table_name=req.table   
        }else{
             table_name=req.params.table  
        }


        let f_columnFilters = req.body?.filter?.f_columnFilters
        let globalFilter = req.body?.filter?.globalFilter
        let f_globalFilters = req.body?.filter?.f_globalFilters

 
/*...child==1?{
    OR: [
        { "hospital_id": null },
        {
            AND: [
                { "hospital_id": hospital_id },
                { "parent_id": null },

                {
                    ...req.return == true ? { ...where_con } : {},
                    ...f_columnFilters ? { ...f_columnFilters } : {},
                    ...globalFilter ? { ...f_globalFilters } : {}
                }
            ]
        }
    ]                    
}:{}
where: {
    ...req.return == true ? { ...where_con } : {},
    ...f_columnFilters ? { ...f_columnFilters } : {},
    ...globalFilter ?{...f_globalFilters} : {}
},*/

        let new_={
            ...response.list_paginate(req),

            where: {
                ...req.return == true ? { ...where_con } : {},
                ...f_columnFilters ? { ...f_columnFilters } : {},
                ...globalFilter ?{...f_globalFilters} : {},
                ...child==1?{"parent_id": null}:{}
                /*...hospital_id>0?{//filter on childs / parent
                    AND: [
                        {
                            childs: {
                                every: {
                                    ...req.return == true ? { ...where_con } : {},
                                    ...f_columnFilters ? { ...f_columnFilters } : {},
                                    ...globalFilter ? { ...f_globalFilters } : {},

                                }
                            },
                        },{
                             ...child==1?{"parent_id": null}:{}
                        }
                    ]


                       
                }:{////filter on parents only
                    ...req.return == true ? { ...where_con } : {},
                    ...f_columnFilters ? { ...f_columnFilters } : {},
                    ...globalFilter ?{...f_globalFilters} : {},
                    ...child==1?{"parent_id": null}:{}
                }*/
            },
            ...hospital_id>0?{
                include: {
                    childs: {
                        where: {
                            "hospital_id": hospital_id
                        }
                    }
                }                
            }:{}
        }
        
        console.log(JSON.stringify(new_))

        const findMany = await prisma[`${table_name}`].findMany(new_)

        

        if(req.return==true){
            return findMany;
        }else{
            response.list(findMany,res)
        }

        
    }catch(error){
        response.error(error,res,next)
    }
}; 

export const count_group =  async (req, res, next) => {
    try {   
        let table_name=req.params.table
        let group=req.params.group
        
        
        let f_columnFilters = req.body?.filter?.f_columnFilters
        let globalFilter = req.body?.filter?.globalFilter
        let f_globalFilters = req.body?.filter?.f_globalFilters
 
        let child=parseInt(req.query.child || null)

        const count = await prisma[`${table_name}`].groupBy({
            by: [group],
            _count: {
              id: true,
            },
   
          })




        /*const count = await prisma[`${table_name}`].aggregate({
            where: {
                ...req.return == true ? { ...where_con } : {},
                ...f_columnFilters ? { ...f_columnFilters } : {},
                ...globalFilter ?{...f_globalFilters} : {},
                ...child==1?{"parent_id": null}:{}
            },
            _count: {
              id: true,
            },
          })*/

 

        response.count(count,res)

    }catch(error){
        response.error(error,res,next)
    }
}; 
 

export const count =  async (req, res, next) => {
    try {   
        let table_name=req.params.table
        
        
        let f_columnFilters = req.body?.filter?.f_columnFilters
        let globalFilter = req.body?.filter?.globalFilter
        let f_globalFilters = req.body?.filter?.f_globalFilters
        let others =req.body?.filter?.others
 
        let child=parseInt(req.query.child || null)

        const count = await prisma[`${table_name}`].aggregate({
            where: {
                ...req.return == true ? { ...where_con } : {},
                ...f_columnFilters ? { ...f_columnFilters } : {},
                ...globalFilter ?{...f_globalFilters} : {},
                ...child==1?{"parent_id": null}:{},
                ...others?{...others}:{}
            },
            _count: {
              id: true,
            },
          })

        response.count(count,res)

    }catch(error){
        response.error(error,res,next)
    }
}; 

   
export const remove =  async (req, res, next) => {
    try {   
        let table_name=req.params.table
        let receipt = req.body.receipt
        let hospital_id=parseInt(req.body.hospital_id || null)

        const delete_ = await prisma[`${table_name}`].deleteMany({
            where: {
               receipt:  parseInt(receipt),
               ...hospital_id>0?{hospital_id: hospital_id}:{}   
            },
          })
        
        response.remove(delete_,res)


    }catch(error){
        response.error(error,res,next)
    }
}; 

 

export const remove_all =  async (req, res, next) => {
    try {   
        let table_name=req.params.table
        let hospital_id=req.body.hospital_id || null
        const delete_ = await prisma[`${table_name}`].deleteMany({
           ...hospital_id>0?{where: { hospital_id: hospital_id}}:{} 
        })
        
        response.remove(delete_,res)

    }catch(error){
        response.error(error,res,next)
    }
}; 

export const test =  async (req, res, next) => {
    try {    


        const post = await prisma.post.create({
            data: {
              title: 'My First Post',
              content: 'This is the content of my first post.',
              comments: {
                create: [
                  { text: 'Great post!' },
                  { text: 'Thanks for sharing.' },
                  { text: 'Very informative.' },
                ],
              },
            },
          });

 /*let clock= created_at ()

console.log(clock)


        var range_start=req.body.filter.range_start
        var range_end=req.body.filter.range_end
        var date_type=req.body.filter.date_type

        let findMany = await prisma.dpc_generate.findMany({
            ...response.list_paginate(req),
            where: {
      
              ...date_type=='admission_date'?{ admission_date: { ...(range_end ? { lte: range_end } : {}),  ...(range_start ? { gte: range_start } : {}),},}:{},
 
            },
            select: {
              id: true,
              "hospital_id": true,
              "patient_code": true,
              "doctor": true,
              "receipt_obj": true,
              "items_obj": true,
              "amount_obj": true,
              "ward": true,
              "icd_code": true,
              "admission_date": true,
              "discharge_date": true,
              "treatment_date": true,
              "date_of_birth": true,
      
 
      
            }
          })

       let hospital_id=req.body.hospital_id
        const findMany = await prisma.test.findMany({
            where: {
                OR: [
                    { "hospital_id": null },
                    {
                        AND: [
                            { "hospital_id": hospital_id },
                            { "parent_id": null }
                        ]
                    }
                ]
            },
            include: {
                test: {
                    where: {
                        "hospital_id": 1
                    }
                }
            }
        })*/

        /*const findMany = await prisma.injuries.findMany({"skip":0,"take":10,"orderBy":{"id":"asc"},
        "where":{
        OR:[
            {"icd":{"contains":"8848425"}},{"name":{"contains":"8848425"}},{"receipt":8848425}            
        ]}

        })*/

        return res.status(200).json({
            success:true,  findMany:post
        }); 

    }catch(error){
        response.error(error,res,next)
    }
}; 