import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import connectPool from "../db/index.js";


const verifyJWT = asyncHandler(async(req, _, next) => {
    
})


export {verifyJWT}