import { asyncHandler } from "../utils/asyncHandler.js";
import connectPool from "../db/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
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


const generateAccessToken =async (user) => {
    // console.log("Acc" , user);
    
    return await jwt.sign(
        //payload
        {
          id : user?.id, 
          phone_number : user?.phone_number, 
          name : user?.name
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

const generateRefreshToken = async (user) => {
    return await jwt.sign(
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
        throw new ApiError(404, "Phone number or password is empty");
    }

    const sys_user = await findSysUser({phone_number});

    if(sys_user.length == 0) throw new ApiError(404,  "User not found");
    // console.log("here");
    

    const isPwdCorrect = await isPasswordCorrect(password, sys_user[0]?.hashed_password);

    // console.log(isPwdCorrect);
    
    if(!isPwdCorrect){
        throw new ApiError(404, "Incorrect password");
    }


    const access_token = await generateAccessToken(sys_user?.[0]);
    const refresh_token = await generateRefreshToken(sys_user?.[0]);
    // console.log(refresh_token);
    

    const [response] = await connectPool.execute(
        `UPDATE sys_user 
        SET refresh_token = ? WHERE id = ? `, [refresh_token, sys_user?.[0].id]
    )

    // console.log(response);

    const loggedUser = { 
                        id : sys_user[0]?.id, 
                        phone_number : sys_user[0]?.phone_number, 
                        email : sys_user[0]?.email,
                        name : sys_user[0]?.name
                    }
    


    return res.status(200)
                .cookie("accessToken", access_token,options )
                .cookie("refreshToken", refresh_token, options)
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

        if(sys_user.length == 0) throw new ApiError(401, "Unauthorized Access 2");

        const [response] = await connectPool.execute(
         `UPDATE sys_user 
         SET refresh_token = ? WHERE id = ? `, [null, sys_user?.[0].id]
        )

        res.status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
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
    findSysUser
}


