import mongoose from "mongoose";

let mongoConnectionPromise;

const connectMongo = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI is required for MongoDB-backed modules");
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!mongoConnectionPromise) {
        mongoConnectionPromise = mongoose.connect(uri, {
            dbName: process.env.MONGODB_DB_NAME || undefined
        });
    }

    await mongoConnectionPromise;
    return mongoose.connection;
};

export default connectMongo;
