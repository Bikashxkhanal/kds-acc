/**
 * Migration script: Account Status for Customers, Suppliers, and Staff.
 * Sets status: 'Active' on all accounts where status is missing or undefined.
 * Preserves all existing data.
 * Safe to run multiple times.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import connectMongo from '../src/db/mongo.js';
import Customer from '../src/models/customer.model.js';
import Supplier from '../src/models/supplier.model.js';
import Staff from '../src/models/staff.model.js';

await connectMongo();

const custResult = await Customer.updateMany(
  { status: { $exists: false } },
  { $set: { status: 'Active', statusChangedBy: 'migration', statusChangedAt: new Date() } }
);

const suppResult = await Supplier.updateMany(
  { status: { $exists: false } },
  { $set: { status: 'Active', statusChangedBy: 'migration', statusChangedAt: new Date() } }
);

const staffResult = await Staff.updateMany(
  { status: { $exists: false } },
  { $set: { status: 'Active', statusChangedBy: 'migration', statusChangedAt: new Date() } }
);

await Customer.syncIndexes();
await Supplier.syncIndexes();
await Staff.syncIndexes();

console.log(`Migration completed:`);
console.log(`- Customers updated to Active: ${custResult.modifiedCount}`);
console.log(`- Suppliers updated to Active: ${suppResult.modifiedCount}`);
console.log(`- Staff updated to Active: ${staffResult.modifiedCount}`);

await mongoose.disconnect();
process.exit(0);
