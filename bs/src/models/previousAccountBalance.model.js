import mongoose from 'mongoose';

const previousAccountBalanceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  partyType: {
    type: String,
    enum: ['customer', 'supplier', 'staff'],
    required: true,
    index: true
  },
  // Numeric id for customer/staff; Mongo ObjectId string for supplier
  partyId: { type: String, required: true, index: true },
  // From OUR BUSINESS's perspective (see guidelines)
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: Date, required: true, index: true },
  notes: { type: String, trim: true, default: '' }
}, { collection: 'previousaccountbalances', timestamps: true });

previousAccountBalanceSchema.index({ partyType: 1, partyId: 1, date: -1 });

const PreviousAccountBalance = mongoose.models.PreviousAccountBalance
  || mongoose.model('PreviousAccountBalance', previousAccountBalanceSchema);

export default PreviousAccountBalance;
