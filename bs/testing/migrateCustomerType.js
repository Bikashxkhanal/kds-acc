import connectMongo from '../src/db/mongo.js';
import Customer from '../src/models/customer.model.js';

await connectMongo();
const legacyValues = await Customer.updateMany({ customer_type: 'Private' }, { $set: { customer_type: 'private' } });
const governmental = await Customer.updateMany({ customer_type: 'Governmental' }, { $set: { customer_type: 'governmental' } });
const ngos = await Customer.updateMany({ customer_type: 'NGO' }, { $set: { customer_type: 'ngo' } });
const missing = await Customer.updateMany({ $or: [{ customer_type: { $exists: false } }, { customer_type: null }, { customer_type: '' }] }, { $set: { customer_type: 'private' } });
console.log(`Normalized ${legacyValues.modifiedCount + governmental.modifiedCount + ngos.modifiedCount} legacy customer types and defaulted ${missing.modifiedCount} missing types to private.`);
process.exit(0);
