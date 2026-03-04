require('dotenv').config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,       // 你的使用者
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,     // 你的資料庫
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;