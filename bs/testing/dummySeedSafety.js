import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const envFile = fileURLToPath(new URL('../.env', import.meta.url));
const demoFile = fileURLToPath(new URL('../.env.demo', import.meta.url));
dotenv.config({ path: envFile });
try {
  const demo = dotenv.parse(readFileSync(demoFile));
  for (const [key, value] of Object.entries(demo)) if (key.startsWith('DUMMY_')) process.env[key] = value;
} catch { /* Demo configuration is supplied through the shell or .env.demo. */ }

export const ensureDummySeedEnvironment = () => {
  const production = [process.env.NODE_ENV, process.env.APP_ENV, process.env.VERCEL_ENV].some((value) => String(value || '').toLowerCase() === 'production')
    || ['true', 'production'].includes(String(process.env.RENDER || '').toLowerCase())
    || ['RENDER_SERVICE_ID', 'VERCEL', 'DYNO', 'FLY_APP_NAME', 'K_SERVICE'].some((key) => Boolean(process.env[key]));
  if (production) throw new Error('Dummy seed commands are disabled in production environments.');
  if (process.env.DUMMY_SEED_ENABLED !== 'true') throw new Error('Set DUMMY_SEED_ENABLED=true in bs/.env.demo before running a dummy data command.');
  if (!process.env.DUMMY_MONGODB_URI || !process.env.DUMMY_DB_NAME) throw new Error('Set DUMMY_MONGODB_URI and DUMMY_DB_NAME in bs/.env.demo.');
  if (!/(dummy|demo|sandbox)/i.test(process.env.DUMMY_DB_NAME)) throw new Error('DUMMY_DB_NAME must include dummy, demo, or sandbox; production database names are refused.');
  process.env.MONGODB_URI = process.env.DUMMY_MONGODB_URI;
  process.env.MONGO_DB_NAME = process.env.DUMMY_DB_NAME;
  process.env.MONGODB_DB_NAME = process.env.DUMMY_DB_NAME;
};
