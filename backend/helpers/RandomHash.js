 
import md5 from 'md5';

//@AAM -V1
export const rand = () => {
    try {   
   
      	return md5((Math.random() + 1).toString(36).substring(2))
      
       }catch(error){
         return false
       }
  };
  
//@AAM -V1
export const randParam = (para1) => {
    try {   
   
      	return md5(para1) 
      
       }catch(error){
         return false
       }
  };
  
  
  
 