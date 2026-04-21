import { asyncHandler } from "../utils/asyncHandler.js";
import connectPool from "../db/index.js";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import { options } from "../constants.js";

const findSysUser = async ({phone_number, id}) => {
        if(phone_number === undefined) phone_number = null;
        if(id === undefined) id = null;

    const [result] = await connectPool.execute(
        `SELECT * FROM sys_user WHERE phone_number = ? OR id = ?`, [phone_number, id]
    )

    return result;
}

const findUser

const generateAccessToken = (user) => {
    return jwt.sign(
        //payload
        {
          id : user?.id, 
          phone_number : user?.phone_number, 
          email : user?.email,
          name : user?.name
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

const generateRefreshToken = async (user) => {
    return jwt.sign(
        //payload
        {
          id : user?.id, 

        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY

        }
    )
}

const isPasswordCorrect  = async (loginPassword, dbPassword) => {
        return await bcrypt.compare(loginPassword, dbPassword)
}


const login = asyncHandler(async(req, res) => {

    const {phone_number , password } =  req.body;

    if(!phone_number?.trim() || !password?.trim()){
        throw new ApiError(400, "Phone number or password is empty");
    }

    const sys_user = await findSysUser({phone_number});

    if(sys_user.length == 0) throw new ApiError(400,  "User doesnot exist");

    const isPasswordCorrect = await isPasswordCorrect(password, sys_user?.hashed_password);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Incorrect password");
    }


    const access_token = generateAccessToken(sys_user);
    const refresh_token = generateRefreshToken(sys_user)
    


    return res.status(200)
                .cookie("accessToken", access_token,options )
                .cookie("refreshToken", refresh_token, options)
                .json(
                    new ApiResponse(200, "User Logged in successfully", 
                        {refresh_token, access_token, 
                        user : { 
                        id : user?.id, 
                        phone_number : user?.phone_number, 
                        email : user?.email,
                        name : user?.name
                    }})
                )

})


const logout = asyncHandler(async (req, res) => {
    
})

export {
    login, 
    logout,
    findSysUser
}


