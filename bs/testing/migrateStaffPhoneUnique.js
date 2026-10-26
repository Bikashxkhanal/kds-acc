import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import connectMongo from '../src/db/mongo.js';
import Staff from '../src/models/staff.model.js';
import mongoose from 'mongoose';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
mongoose.set('autoIndex', false);
await connectMongo();
const duplicates = await Staff.aggregate([{ $group: { _id: '$phone_number', ids: { $push: '$id' }, count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } }]);
if (duplicates.length) {
  console.error('Cannot enforce unique staff phones; resolve these duplicate phone numbers first:', duplicates.map(({ _id, ids }) => ({ phone_number: _id, staff_ids: ids })));
  process.exitCode = 1;
} else {
  const indexes = await Staff.collection.indexes();
  const oldIndexes = indexes.filter((index) => index.key?.phone_number === 1 && !index.unique);
  for (const oldIndex of oldIndexes) await Staff.collection.dropIndex(oldIndex.name);
  await Staff.collection.createIndex({ phone_number: 1 }, { unique: true, name: 'uniq_staff_phone_number' });
  console.log('Created the unique staff phone index.');
}
await Staff.db.close();
