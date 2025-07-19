 
import jwt from "jsonwebtoken";
import {PrismaClient} from "@prisma/client";
  
const prisma = new PrismaClient();

export var user_id = null;



export const auth = async (req, res, next) => {
    try {

        user_id = null;

        let token=req.headers.authorization

        if(token){
            token=token.split(" ")[1]; 
            let user = jwt.verify(token,process.env.JWT_SECRET);       
            req.user=user;  //
            user_id=user.id;  //  
        }else{
            res.status(401).json({message:"Unauthorized user"});
  
        }
        next();

 
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized user" });
    }
};
 
