import { ensureDummySeedEnvironment } from './dummySeedSafety.js';
import connectMongo from '../src/db/mongo.js';
import Customer from '../src/models/customer.model.js';
import CustomerWork from '../src/models/customerWork.model.js';
import CustomerPayment from '../src/models/customerPayment.model.js';
import Staff from '../src/models/staff.model.js';
import StaffRemuneration from '../src/models/staffRemuneration.model.js';
import StaffPayment from '../src/models/staffPayment.model.js';
import Purchase from '../src/models/purchase.model.js';
import Invoice from '../src/models/invoice.model.js';
import SysUser from '../src/models/sysUser.model.js';
import ActivityLog from '../src/models/activityLog.model.js';

ensureDummySeedEnvironment();
await connectMongo();
const models = [ActivityLog, Customer, CustomerWork, CustomerPayment, Staff, StaffRemuneration, StaffPayment, Purchase, Invoice, SysUser];
const counts = await Promise.all(models.map(async (Model) => {
  const result = await Model.deleteMany({ isDummy: true });
  return { collection: Model.collection.collectionName, removed: result.deletedCount };
}));
console.log(JSON.stringify({ database: process.env.DUMMY_DB_NAME, cleared: counts }, null, 2));
await Customer.db.close();
