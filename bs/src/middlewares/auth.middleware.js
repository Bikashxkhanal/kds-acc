import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import connectPool from "../db/index.js";
import jwt from 'jsonwebtoken'
import { findSysUser } from "../controllers/user.controller.js";


const verifyJWT = asyncHandler(async(req, _, next) => {

 try {
       const token = req?.cookies?.accessToken || req?.header("Authorization")?.replace("Bearer ", "");
   
       if(!token) throw new ApiError(401, "Unauthorized request");
   
       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
   
       if(!decodedToken) throw new ApiError(401, "Token Expired");
       
       const user = await findSysUser({id : decodedToken?.id});
   
       if(user.length == 0) throw new ApiError(401, "Invalid Access Token");
   
   
       req.user = user;
       next();
 } catch (error) {
    throw new ApiError(401, error?.message || "Invalid reequest");
  
 }})


export {verifyJWT}