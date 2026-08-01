/**
 * @deprecated MySQL is no longer used by the application runtime.
 * Kept only for the one-time migration script (testing/migrateMysqlToMongo.js).
 */
import mysql from "mysql2/promise";

const connectPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default connectPool;
