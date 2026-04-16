import mysql from "mysql2/promise";

const connectPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Bikash07",
  database: "kds_db",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default connectPool;