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
      CREATE TABLE IF NOT EXISTS memorials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        template_id VARCHAR(255) NOT NULL DEFAULT 'default',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id VARCHAR(255) PRIMARY KEY,
        src VARCHAR(255) NOT NULL,
        alt VARCHAR(255),
        caption TEXT,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        memorial_id UUID REFERENCES memorials(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tributes (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        relationship VARCHAR(255),
        message TEXT,
        type VARCHAR(255),
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        memorial_id UUID REFERENCES memorials(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        memorial_id UUID REFERENCES memorials(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS eulogy_content (
        id SERIAL PRIMARY KEY,
        memorial_id UUID UNIQUE REFERENCES memorials(id) ON DELETE CASCADE,
        content TEXT NOT NULL DEFAULT ''
      );
    `);

    await pool.query(`
      INSERT INTO memorials (slug, display_name, template_id)
      VALUES ('demo', 'Demo Memorial', 'default')
      ON CONFLICT (slug) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO eulogy_content (memorial_id, content)
      SELECT id, '' FROM memorials WHERE slug='demo'
      ON CONFLICT (memorial_id) DO NOTHING;
    `);

    console.log("Database tables checked/created successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

module.exports = {
  pool,
  initDb,
};
