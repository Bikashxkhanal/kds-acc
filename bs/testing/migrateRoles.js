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
await SysUser.updateOne({ _id: admin._id }, { $set: { role: 'admin', isActive: true } });
console.log(`Assigned Admin to ${admin.email || admin.phone_number}; assigned Operator to other users.`);
process.exit(0);
