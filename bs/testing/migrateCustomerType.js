import connectMongo from '../src/db/mongo.js';
import Customer from '../src/models/customer.model.js';

await connectMongo();
const result = await Customer.updateMany({ customer_type: { $exists: false } }, { $set: { customer_type: 'Private' } });
console.log(`Set Private on ${result.modifiedCount} existing customers.`);
process.exit(0);
