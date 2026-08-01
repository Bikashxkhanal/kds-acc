import mongoose from "mongoose";

const staffRemunerationSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    staff_id: { type: Number, required: true, index: true },
    title: { type: String, enum: ["salary", "bhatta"], required: true },
    discription: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, index: true }
}, { collection: "staffremunerations" });

const StaffRemuneration = mongoose.models.StaffRemuneration
    || mongoose.model("StaffRemuneration", staffRemunerationSchema);

export default StaffRemuneration;
