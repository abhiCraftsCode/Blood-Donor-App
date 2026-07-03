import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
});

pool.on("connect", () => {
  console.log("Connected to the database pool successfully.");
});
pool.on("error", (err) => {
  console.error("Unexpected error in database pool: ", err);
  process.exit(-1);
});

export default pool;
