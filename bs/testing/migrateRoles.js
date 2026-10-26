import connectMongo from '../src/db/mongo.js';
import SysUser from '../src/models/sysUser.model.js';

await connectMongo();
const users = await SysUser.find().sort({ id: 1 });
if (!users.length) { console.log('No users found; no roles changed.'); process.exit(0); }
const identifier = String(process.env.ADMIN_USER_IDENTIFIER || '').trim().toLowerCase();
let admin = identifier ? users.find((user) => user.email?.toLowerCase() === identifier || user.phone_number === identifier) : users.find((user) => user.role === 'admin');
if (identifier && !admin) throw new Error(`ADMIN_USER_IDENTIFIER ${identifier} did not match an existing account`);
if (!admin) admin = users[0]; // Placeholder account was not provided; preserve at least one Admin.
await SysUser.updateMany({}, { $set: { role: 'operator' } });
await SysUser.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } });
await SysUser.updateMany({ forcePasswordChange: { $exists: false } }, { $set: { forcePasswordChange: false } });
await SysUser.updateOne({ _id: admin._id }, { $set: { role: 'admin', isActive: true } });
await SysUser.createIndexes();
console.log(`Assigned Admin to existing user ID ${admin.id}; assigned Operator to other users.`);
process.exit(0);
