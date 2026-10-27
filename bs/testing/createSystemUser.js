import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import bcrypt from 'bcrypt';
import connectMongo from '../src/db/mongo.js';
import SysUser from '../src/models/sysUser.model.js';
import Counter from '../src/models/counter.model.js';
import { getNextSequence } from '../src/utils/autoIncrement.js';

const args = {};
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (!arg.startsWith('--')) continue;
  const key = arg.slice(2);
  const next = process.argv[index + 1];
  args[key] = next && !next.startsWith('--') ? next : '';
  if (args[key]) index += 1;
}
const rl = readline.createInterface({ input: stdin, output: stdout });
const ask = async (key, label) => String(args[key] || await rl.question(label)).trim();
const askSecret = async () => {
  stdout.write('Password (input hidden): ');
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') throw new Error('Run this command in an interactive terminal to enter the password safely.');
  return new Promise((resolve, reject) => {
    let value = '';
    const onData = (chunk) => {
      for (const char of String(chunk)) {
        if (char === '\u0003') { stdin.setRawMode(false); stdin.off('data', onData); reject(new Error('Cancelled')); return; }
        if (char === '\r' || char === '\n') { stdin.setRawMode(false); stdin.off('data', onData); stdout.write('\n'); resolve(value); return; }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else value += char;
      }
    };
    stdin.setRawMode(true); stdin.resume(); stdin.on('data', onData);
  });
};

try {
  const name = await ask('name', 'Full name: ');
  const phone_number = await ask('phone', 'Phone number (10 digits): ');
  const role = String(await ask('role', 'Role (admin/operator): ')).toLowerCase();
  rl.close();
  const password = await askSecret();

  if (name.length < 2 || name.length > 120) throw new Error('Name must be between 2 and 120 characters.');
  if (!/^\d{10}$/.test(phone_number)) throw new Error('Phone number must contain exactly 10 digits.');
  if (!['admin', 'operator'].includes(role)) throw new Error('Role must be admin or operator.');
  if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) throw new Error('Password requires 12+ characters with upper, lower, numeric, and symbol characters.');

  await connectMongo();
  if (await SysUser.exists({ phone_number })) throw new Error('A system user already uses that phone number.');
  // const email = `${phone_number}@local.invalid`;
  if (await SysUser.exists({ email })) throw new Error('Generated placeholder email is already in use.');
  if (role === 'operator' && !(await SysUser.exists({ role: 'admin', isActive: { $ne: false } }))) throw new Error('Create an Admin first; the system must always have an active Admin.');

  const latest = await SysUser.findOne().sort({ id: -1 }).select('id').lean();
  await Counter.findOneAndUpdate({ name: 'sysUser' }, { $max: { seq: Number(latest?.id || 0) } }, { upsert: true });
  const id = await getNextSequence('sysUser');
  const hashed_password = await bcrypt.hash(password, 12);
  await SysUser.create({ id, name, phone_number, email, address: '-', hashed_password, role, isActive: true, forcePasswordChange: true });
  console.log(`Created ${role} system user ${name} (ID ${id}). Password change is required at first login.`);
} catch (error) {
  rl.close();
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (SysUser.db.readyState === 1) await SysUser.db.close();
}
