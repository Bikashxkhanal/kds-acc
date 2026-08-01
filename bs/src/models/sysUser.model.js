import mongoose from "mongoose";

const sysUserSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone_number: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true },
    hashed_password: { type: String, required: true }
}, { collection: "sysusers" });

const SysUser = mongoose.models.SysUser || mongoose.model("SysUser", sysUserSchema);

export default SysUser;
