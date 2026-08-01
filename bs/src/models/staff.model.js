import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    phone_number: { type: String, required: true, trim: true, index: true },
    address: { type: String, trim: true, default: "" },
    dob: { type: Date, required: true },
    salary: { type: Number, required: true, min: 0 }
}, { collection: "staffs" });

const Staff = mongoose.models.Staff || mongoose.model("Staff", staffSchema);

export default Staff;
