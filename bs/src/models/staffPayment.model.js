import mongoose from "mongoose";

const staffPaymentSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    staff_id: { type: Number, required: true, index: true },
    discription: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now, index: true }
}, { collection: "staffpayments" });

const StaffPayment = mongoose.models.StaffPayment
    || mongoose.model("StaffPayment", staffPaymentSchema);

export default StaffPayment;
