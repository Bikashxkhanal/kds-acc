import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    phone_number: { type: String, required: true, trim: true, index: true },
    address: { type: String, trim: true, default: "" },
    customer_type: { type: String, enum: ["Private", "Governmental", "NGO"], default: "Private", index: true },
    isDummy: { type: Boolean, default: false, index: true }
}, { collection: "customers" });

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default Customer;
