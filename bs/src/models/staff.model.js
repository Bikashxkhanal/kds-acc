import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    phone_number: { type: String, required: true, trim: true },
    address: { type: String, trim: true, default: "" },
    dob: { type: Date, required: true },
    salary: { type: Number, required: true, min: 0 },
    noSalary: { type: Boolean, default: false, index: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    role: { type: String, enum: ["Tractor Driver", "JCB Operator", "Tipper Driver", "Helper", "Accountant", "Manager", "Other"], default: "Other", index: true },
    assignedVehicle: { type: String, enum: ["Tractor", "JCB", "Tipper", "None"], default: "None" },
    dateOfJoining: { type: Date },
    paymentType: { type: String, enum: ["Monthly", "Daily"], default: "Monthly" },
    idProofType: { type: String, trim: true, default: "" },
    idProofNumber: { type: String, trim: true, default: "" },
    emergencyContactName: { type: String, trim: true, default: "" },
    emergencyContactPhone: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
    statusChangedBy: { type: String, trim: true, default: "" },
    statusChangedAt: { type: Date, default: null },
    notes: { type: String, trim: true, default: "" },
    deletedAt: { type: Date, default: undefined, index: true },
    isDummy: { type: Boolean, default: false, index: true }
}, { collection: "staffs" });

staffSchema.index({ phone_number: 1 }, { unique: true, name: "uniq_staff_phone_number" });

const Staff = mongoose.models.Staff || mongoose.model("Staff", staffSchema);

export default Staff;
