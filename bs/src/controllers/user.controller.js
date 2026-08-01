import { asyncHandler } from "../utils/asyncHandler.js";
import connectMongo from "../db/mongo.js";
import SysUser from "../models/sysUser.model.js";
import { getNextSequence } from "../utils/autoIncrement.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import { NETWORK_OPTIONS_CORS} from "../constants.js";

const getSafeUser = (user) => ({
    id : user?.id,
    phone_number : user?.phone_number,
    email : user?.email,
    name : user?.name
})

const verifyMe = asyncHandler((req, res)=>{
   return res.status(200).json(
        new ApiResponse(
            200,
            "User is still logged in", 
            getSafeUser(req?.user)
        )
    )
})

const findSysUser = async ({phone_number, id}) => {
    await connectMongo();

    const filter = {};
    if (phone_number != null) filter.phone_number = phone_number;
    if (id != null) filter.id = Number(id);

    if (!Object.keys(filter).length) return [];

    const user = await SysUser.findOne(filter).lean();
    return user ? [user] : [];
}

const generateAccessToken = async (user) => {
    return jwt.sign(
        {
          id : user?.id, 
          phone_number : user?.phone_number, 
          name : user?.name
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn : process.env.ACCESS_TOKEN_EXPIRY }
    )
}

const generateRefreshToken = async (user) => {
    return jwt.sign(
        { id : user?.id }, 
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn : process.env.REFRESH_TOKEN_EXPIRY }
    )
}

const isPasswordCorrect = async (loginPassword, dbPassword) => {
    return bcrypt.compare(loginPassword, dbPassword)
}

const login = asyncHandler(async(req, res) => {
    const {phone_number , password } =  req.body;

    if(!phone_number?.trim() || !password?.trim()){
        throw new ApiError(404, "Phone number or password is empty");
    }

    const sys_user = await findSysUser({phone_number});

    if(sys_user.length == 0) throw new ApiError(404,  "User not found");

    const isPwdCorrect = await isPasswordCorrect(password, sys_user[0]?.hashed_password);

    if(!isPwdCorrect){
        throw new ApiError(404, "Incorrect password");
    }

    const access_token = await generateAccessToken(sys_user?.[0]);
    const refresh_token = await generateRefreshToken(sys_user?.[0]);
    const loggedUser = getSafeUser(sys_user?.[0])

    return res.status(200)
                .cookie("accessToken", access_token, NETWORK_OPTIONS_CORS)
                .cookie("refreshToken", refresh_token, NETWORK_OPTIONS_CORS)
                .json(
                    new ApiResponse(200, "User Logged in successfully", 
                        {
                        refresh_token, 
                        access_token, 
                        user : loggedUser
                        })
                )
})

const logout = asyncHandler(async (req, res) => {
    const user = req?.user;

   try {
     const sys_user = await findSysUser({id : user?.id})

        if(sys_user.length == 0) throw new ApiError(404, "Unauthorized Request");

        res.status(200)
                .clearCookie("accessToken", NETWORK_OPTIONS_CORS)
                .clearCookie("refreshToken", NETWORK_OPTIONS_CORS)
                .json(
                    new ApiResponse(
                        200, 
                        "User logout successfully", 
                        {}
                    )
                )

   } catch (error) {
        throw new ApiError(500, error?.message || "Invalid request");
   } 
})

export {
    login, 
    logout,
    findSysUser, 
    verifyMe
}
