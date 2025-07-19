export const create = (result,res) => {
  try {   
      let success='success'
      let message="Created Successful"
      if(result.count==0){
          success='error'
          message="Unable to create"
      }
      const gg=1
      //gg=8
      return res.status(200).json({
        success:success, message:message, result:result
      });
    
     }catch(error){
       return error
     }
};

export const update = (result,res) => {
  try {   
      let success='success'
      let message="Update Successful"
      if(result.count==0){
          success='error'
          message="Unable to Update"
      }
      return res.status(200).json({
        success:success, message:message, result:result
      });

     }catch(error){
       return false
     }
};

export const list = (data,res) => {
  try {   
      let success='success'
      let message="Data Fetch Successful"
      if(data.count==0){
          success='error'
          message="Unable to Fetch"
      }
      return res.status(200).json({
        success:success, message:message, data:data,
      });

     }catch(error){
      console.log(error)
       return false
     }
};

export const count = (data,res) => {
  try {   
      let success='success'
      let message="Data Count Successful"
      if(data.count==0){
          success='error'
          message="Unable to Count"
      }
      return res.status(200).json({
        success:success, message:message, count:data,
      });

     }catch(error){
       return false
     }
};


export const remove = (data,res) => {
  try {   
      let success='success'
      let message="Data Delete Successful"
      if(data.count==0){
          success='error'
          message="Unable to Delete"
      }
      return res.status(200).json({
        success:success, message:message, data:data,
      });

     }catch(error){
       return false
     }
};

export const error = (error,res,next) => {
  try {  
    let str= error.toString()
      console.log(str,'error')
      next(error)
      let message="Something Went Wrong"
      //log_report(error)
      return res.status(404).json({
        success:'error', message:str 
      });
     }catch(error){
       return false
     }
};


export const list_paginate =(req,res) => {
  let order =req.query?.order  || ""

  return {
  ...(req.query.skip ? { skip: parseInt(req.query.skip) } : {}),
  ...(req.query.take ? { take: parseInt(req.query.take) } : {}),

  ...order.length>0?{
    orderBy: {  
      [`${order}`]: 'asc',  
    },
  }:{
      orderBy: {  
      id: 'asc',  
    },
  }  
  }

}

export const log_report = (error,res) => {
  try {   

      //write exception
      
      return true
    
     }catch(error){
       return false
     }
};


export const notFound = (message, res) => {
  return res.status(404).json({
    success: 'error',
    message: message || 'Resource not found'
  });
};


export const invalid = (message = 'Invalid request', res, status = 400) => {
  return res.status(status).json({
    success: false,
    message
  });
};

 
export function badRequest(message, res) {
  return res.status(400).json({
    success: false,
    error: message || 'Bad Request',
  });
}
