import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({ amount: { type: Number, required: true, min: 0.01 }, date: { type: Date, required: true }, note: { type: String, trim: true, default: '' } }, { timestamps: true });
const purchaseSchema = new mongoose.Schema({
  billNo: { type: String, trim: true, default: '', index: true }, description: { type: String, required: true, trim: true },
  totalValue: { type: Number, required: true, min: 0.01 }, supplier: { type: String, required: true, trim: true, index: true },
  date: { type: Date, required: true, index: true }, usedBy: { type: String, required: true, enum: ['Tractor', 'JCB', 'Tipper'] },
  payments: { type: [paymentSchema], default: [] },
  isDummy: { type: Boolean, default: false, index: true }
}, { timestamps: true });
purchaseSchema.virtual('paidAmount').get(function () { return this.payments.reduce((sum, payment) => sum + payment.amount, 0); });
const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
export default Purchase;
