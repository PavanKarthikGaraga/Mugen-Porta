import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  multipleStatements: true,
  idleTimeout: 300000, // 5 minutes
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const getConnection = () => pool.getConnection();
export default pool;