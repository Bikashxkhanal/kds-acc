import mongoose from "mongoose";

const customerWorkSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    customer_id: { type: Number, required: true, index: true },
    vehicle_id: { type: Number, required: true, index: true },
    title: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true },
    quantity_unit_notation: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    work_date: { type: Date, required: true, index: true },
    entry_date: { type: Date, default: Date.now }
}, { collection: "customerworks" });

const CustomerWork = mongoose.models.CustomerWork
    || mongoose.model("CustomerWork", customerWorkSchema);

export default CustomerWork;
