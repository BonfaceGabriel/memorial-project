require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.production") });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id VARCHAR(255) PRIMARY KEY,
        src VARCHAR(255) NOT NULL,
        alt VARCHAR(255),
        caption TEXT,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tributes (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        relationship VARCHAR(255),
        message TEXT,
        type VARCHAR(255),
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS eulogy_content (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL DEFAULT ''
      );
    `);
    console.log("eulogy_content table created or already exists.");

    // Insert an initial row if it doesn't exist
    const res = await pool.query("SELECT COUNT(*) FROM eulogy_content");
    if (parseInt(res.rows[0].count) === 0) {
      await pool.query("INSERT INTO eulogy_content (content) VALUES ($1)", [
        "",
      ]);
      console.log("Initial empty row inserted into eulogy_content.");
    } else {
      console.log("eulogy_content already contains data.");
    }

    console.log("Database tables checked/created successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

module.exports = {
  pool,
  initDb,
};
