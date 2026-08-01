import mongoose from "mongoose";

const customerPaymentSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    customer_id: { type: Number, required: true, index: true },
    pay_amount: { type: Number, required: true, min: 0 },
    payment_mode: {
        type: String,
        enum: ["cheque", "cash", "mobile banking"],
        default: "cash"
    },
    payers_name: { type: String, default: "self", trim: true },
    payment_date: { type: Date, required: true, index: true }
}, { collection: "customerpayments" });

const CustomerPayment = mongoose.models.CustomerPayment
    || mongoose.model("CustomerPayment", customerPaymentSchema);

export default CustomerPayment;
