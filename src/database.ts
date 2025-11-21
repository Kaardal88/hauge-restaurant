import mysql, { Pool } from "mysql2/promise";

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "vpn2ccfd33887adtnu",
  database: process.env.DB_NAME || "haugerestaurant",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export { pool };
// Fetch menu items from the database
