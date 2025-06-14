import pkg from 'pg';
const { Pool } = pkg;

import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'kikixoxo',
  database: process.env.DB_NAME || 'Database',
  port: process.env.DB_PORT || 5433,
  //ssl: process.env.DB_SSL === 'true' // optional for cloud db
});

export default pool;
