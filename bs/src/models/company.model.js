import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        address: { type: String, required: true, trim: true },
        phone: { type: String, trim: true, default: "" },
        email: { type: String, trim: true, lowercase: true, default: "" },
        pan: { type: String, required: true, trim: true, unique: true },
        logoUrl: { type: String, trim: true, default: "" },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const Company = mongoose.models.Company || mongoose.model("Company", companySchema);

export default Company;
