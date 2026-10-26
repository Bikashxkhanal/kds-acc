import 'dotenv/config';
import connectMongo from '../src/db/mongo.js';
import CustomerWork from '../src/models/customerWork.model.js';

const titleMap = {
  'Cultivation Rotavator': 'cultivation_rotavator', 'Cultivation Cultivator': 'cultivation_cultivator',
  Boulders: 'boulders', Gravel: 'gravel', Soil: 'soil', Sand: 'sand', Puddling: 'puddling',
  Excavation: 'excavation', Paral: 'paral', Dhan: 'dhan', Others: 'others'
};

await connectMongo();
for (const [legacy, code] of Object.entries(titleMap)) {
  await CustomerWork.updateMany({ title: legacy }, { $set: { title: code } });
}
console.log('Legacy sales titles migrated to stable codes.');
process.exit(0);
