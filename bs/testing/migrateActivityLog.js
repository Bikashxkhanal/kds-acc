import 'dotenv/config';
import connectMongo from '../src/db/mongo.js';
import ActivityLog from '../src/models/activityLog.model.js';

await connectMongo();
await ActivityLog.createCollection().catch((error) => {
  if (error.codeName !== 'NamespaceExists') throw error;
});
await ActivityLog.createIndexes();
console.log('Activity log collection and indexes are ready.');
await ActivityLog.db.close();
