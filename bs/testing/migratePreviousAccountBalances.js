/**
 * Ensures the previousaccountbalances collection and counter exist.
 * Safe to re-run — does not modify existing ledger data.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import connectMongo from '../src/db/mongo.js';
import PreviousAccountBalance from '../src/models/previousAccountBalance.model.js';
import { setSequence } from '../src/utils/autoIncrement.js';

await connectMongo();
await PreviousAccountBalance.createCollection().catch(() => {});
await PreviousAccountBalance.syncIndexes();
const max = await PreviousAccountBalance.findOne().sort({ id: -1 }).select('id').lean();
if (max?.id) await setSequence('previousAccountBalance', max.id);
else await setSequence('previousAccountBalance', 0);
console.log(`previousaccountbalances ready (max id=${max?.id || 0})`);
await mongoose.disconnect();
