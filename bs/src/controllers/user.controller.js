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
    name : user?.name,
    role: user?.role || 'operator', forcePasswordChange: Boolean(user?.forcePasswordChange), isActive: user?.isActive !== false
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
          name : user?.name,
          role: user?.role || 'operator'
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

const strongPassword = (password) => typeof password === 'string' && password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);

const listUsers = asyncHandler(async (_req, res) => {
    await connectMongo();
    const users = await SysUser.find().select('-hashed_password').sort({ id: 1 }).lean();
    res.json(new ApiResponse(200, 'Users loaded', users));
});

const createUser = asyncHandler(async (req, res) => {
    const { name, phone_number, email, address = '', password, role = 'operator', forcePasswordChange = true } = req.body;
    if (String(name || '').trim().length < 2 || !/^\d{10}$/.test(String(phone_number || '')) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '')) || !strongPassword(password) || !['admin', 'operator'].includes(role)) throw new ApiError(400, 'Enter valid user details and a strong password (12+ characters with upper, lower, number and symbol)');
    await connectMongo();
    if (await SysUser.exists({ $or: [{ phone_number }, { email: email.trim().toLowerCase() }] })) throw new ApiError(409, 'Phone number or email is already registered');
    const id = await getNextSequence('sysUser');
    const hashed_password = await bcrypt.hash(password, 12);
    const user = await SysUser.create({ id, name: name.trim(), phone_number, email: email.trim().toLowerCase(), address: String(address).trim() || '-', hashed_password, role, forcePasswordChange: Boolean(forcePasswordChange), isActive: true });
    res.status(201).json(new ApiResponse(201, 'User created', getSafeUser(user)));
});

const updateUserRoleStatus = asyncHandler(async (req, res) => {
    const targetId = Number(req.params.id);
    const { role, isActive } = req.body;
    if (!Number.isInteger(targetId) || (role !== undefined && !['admin', 'operator'].includes(role)) || (isActive !== undefined && typeof isActive !== 'boolean')) throw new ApiError(400, 'Invalid user role or status');
    await connectMongo();
    const target = await SysUser.findOne({ id: targetId });
    if (!target) throw new ApiError(404, 'User not found');
    const before = { role: target.role || 'operator', isActive: target.isActive !== false };
    const losingAdmin = target.role === 'admin' && (role === 'operator' || isActive === false);
    if (losingAdmin) {
        const activeAdmins = await SysUser.countDocuments({ role: 'admin', isActive: { $ne: false } });
        if (activeAdmins <= 1) throw new ApiError(400, 'At least one active Admin must remain');
    }
    if (targetId === req.user.id && (role === 'operator' || isActive === false)) {
        const activeAdmins = await SysUser.countDocuments({ role: 'admin', isActive: { $ne: false } });
        if (activeAdmins <= 1) throw new ApiError(400, 'You cannot demote or deactivate the last active Admin');
    }
    if (role !== undefined) target.role = role;
    if (isActive !== undefined) target.isActive = isActive;
    await target.save();
    req.activityDetails = { entityId: String(target.id), entityName: target.name, diff: { role: { before: before.role, after: target.role }, isActive: { before: before.isActive, after: target.isActive !== false } } };
    res.json(new ApiResponse(200, 'User updated', getSafeUser(target)));
});

const resetUserPassword = asyncHandler(async (req, res) => {
    const targetId = Number(req.params.id); const { password, forcePasswordChange = true } = req.body;
    if (!Number.isInteger(targetId) || !strongPassword(password)) throw new ApiError(400, 'Password must have 12+ characters with upper, lower, number and symbol');
    await connectMongo();
    const user = await SysUser.findOne({ id: targetId });
    if (!user) throw new ApiError(404, 'User not found');
    user.hashed_password = await bcrypt.hash(password, 12); user.forcePasswordChange = Boolean(forcePasswordChange);
    await user.save();
    res.json(new ApiResponse(200, 'Password reset', { id: user.id, forcePasswordChange: user.forcePasswordChange }));
});

const changeOwnPassword = asyncHandler(async (req, res) => {
    const { currentPassword, password } = req.body;
    if (!strongPassword(password)) throw new ApiError(400, 'Password must have 12+ characters with upper, lower, number and symbol');
    const matches = await bcrypt.compare(String(currentPassword || ''), req.user.hashed_password);
    if (!matches) throw new ApiError(400, 'Current password is incorrect');
    await SysUser.updateOne({ id: req.user.id }, { $set: { hashed_password: await bcrypt.hash(password, 12), forcePasswordChange: false } });
    res.json(new ApiResponse(200, 'Password changed'));
});

const login = asyncHandler(async(req, res) => {
    const {phone_number , password } =  req.body;

    if(!phone_number?.trim() || !password?.trim()){
        throw new ApiError(404, "Phone number or password is empty");
    }

    const sys_user = await findSysUser({phone_number});

    if(sys_user.length == 0 || sys_user[0].isActive === false) throw new ApiError(404,  "User not found or inactive");
    req.activityActor = sys_user[0];

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
    verifyMe,
    listUsers,
    createUser,
    updateUserRoleStatus,
    resetUserPassword,
    changeOwnPassword
}
