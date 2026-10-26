import 'dotenv/config';
import mongoose from 'mongoose';
import connectMongo from '../src/db/mongo.js';
import Purchase from '../src/models/purchase.model.js';
import Supplier from '../src/models/supplier.model.js';
import Staff from '../src/models/staff.model.js';
import CustomerPayment from '../src/models/customerPayment.model.js';
import StaffPayment from '../src/models/staffPayment.model.js';

await connectMongo();
const purchases = await Purchase.find({}).select('supplier supplierId title customTitle description').lean();
const names = [...new Set(purchases.map(p => String(p.supplier || '').trim()).filter(Boolean))];
for (const name of names) await Supplier.updateOne({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }, { $setOnInsert: { name } }, { upsert: true });
for (const purchase of purchases) {
  const supplier = await Supplier.findOne({ name: purchase.supplier }).select('_id').lean();
  await Purchase.updateOne({ _id: purchase._id }, { $set: { supplierId: supplier?._id || null, title: purchase.title || 'Others', customTitle: purchase.customTitle || (purchase.title ? '' : purchase.description || '') } });
}
await Staff.updateMany({ noSalary: { $exists: false } }, { $set: { noSalary: false } });
const customerPayments = await CustomerPayment.find({ receiptNo: { $in: ['', null] } }).select('id').lean();
for (const payment of customerPayments) await CustomerPayment.updateOne({ _id: payment._id }, { $set: { receiptNo: `CUST-${String(payment.id).padStart(6, '0')}` } });
const staffPayments = await StaffPayment.find({ receiptNo: { $in: ['', null] } }).select('id').lean();
for (const payment of staffPayments) await StaffPayment.updateOne({ _id: payment._id }, { $set: { receiptNo: `STAFF-${String(payment.id).padStart(6, '0')}` } });
await mongoose.disconnect();
console.log(`Migrated ${purchases.length} purchase supplier links, ${customerPayments.length} customer receipts, ${staffPayments.length} staff receipts, and staff compensation flags.`);
