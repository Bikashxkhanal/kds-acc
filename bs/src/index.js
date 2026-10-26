import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

// Ensure env is loaded before app.js reads CORS settings during setup.
const [{ app }, { default: connectMongo }] = await Promise.all([
    import('./app.js'),
    import('./db/mongo.js')
]);

connectMongo()
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.warn("MongoDB connection failed:", err.message));

const port = Number(process.env.PORT) || 8000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening on port ${port}`)
})
