import mongoose from "mongoose";

const moneyField = {
    type: Number,
    default: 0,
    min: 0
};

const invoiceItemSchema = new mongoose.Schema(
    {
        productName: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: "" },
        quantity: { type: Number, required: true, min: 0 },
        unit: { type: String, required: true, trim: true, enum: ["Cubic Meter", "Hours", "Kilograms (Kgs)", "Trips"] },
        rate: { type: Number, required: true, min: 0 },
        discount: moneyField,
        total: moneyField,
        sortOrder: { type: Number, default: 0 }
    },
    { _id: true }
);

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: { type: String, required: true, unique: true, index: true },
        billNumber: { type: String, required: true, unique: true, index: true },
        company: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
            name: { type: String, required: true, trim: true },
            address: { type: String, trim: true, default: "" },
            phone: { type: String, trim: true, default: "" },
            email: { type: String, trim: true, default: "" },
            pan: { type: String, trim: true, default: "" },
            logoUrl: { type: String, trim: true, default: "" }
        },
        customer: {
            name: { type: String, required: true, trim: true, index: true },
            address: { type: String, required: true, trim: true },
            phone: { type: String, trim: true, index: true, default: "" },
            pan: { type: String, trim: true, default: "" }
        },
        billDate: { type: Date, required: true, index: true },
        dueDate: { type: Date },
        remarks: { type: String, trim: true, default: "" },
        items: { type: [invoiceItemSchema], validate: v => Array.isArray(v) && v.length > 0 },
        totals: {
            subtotal: moneyField,
            discount: moneyField,
            taxableAmount: moneyField,
            taxRate: { type: Number, default: 0, enum: [0, 5, 10, 13, 15] },
            tax: moneyField,
            grandTotal: moneyField,
            paidAmount: moneyField,
            remainingAmount: moneyField
        },
        paymentStatus: {
            type: String,
            enum: ["unpaid", "partial", "paid"],
            default: "unpaid",
            index: true
        },
        signatureStatus: {
            customerSigned: { type: Boolean, default: false },
            ownerSigned: { type: Boolean, default: false },
            stamped: { type: Boolean, default: false }
        },
        creator: {
            id: { type: Number },
            name: { type: String, trim: true, default: "" }
        },
        lastUpdatedBy: {
            id: { type: Number },
            name: { type: String, trim: true, default: "" }
        },
        timeline: [
            {
                action: { type: String, required: true },
                by: { type: String, trim: true, default: "" },
                at: { type: Date, default: Date.now },
                note: { type: String, trim: true, default: "" }
            }
        ]
    },
    { timestamps: true }
);

invoiceSchema.index({
    invoiceNumber: "text",
    billNumber: "text",
    "customer.name": "text",
    "customer.phone": "text",
    "company.name": "text"
});

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default Invoice;
