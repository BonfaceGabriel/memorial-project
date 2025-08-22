require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env.production") });
const { pool } = require("../db");

async function run() {
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
      ALTER TABLE photos
      ADD COLUMN IF NOT EXISTS memorial_id UUID REFERENCES memorials(id) ON DELETE CASCADE;
    `);

    await pool.query(`
      ALTER TABLE tributes
      ADD COLUMN IF NOT EXISTS memorial_id UUID REFERENCES memorials(id) ON DELETE CASCADE;
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS memorial_id UUID REFERENCES memorials(id);
    `);

    await pool.query(`
      ALTER TABLE eulogy_content
      ADD COLUMN IF NOT EXISTS memorial_id UUID UNIQUE REFERENCES memorials(id) ON DELETE CASCADE;
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

    console.log("Migration 005: memorial infrastructure applied.");
  } catch (err) {
    console.error("Migration 005 failed:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  run().finally(() => pool.end());
}

module.exports = run;
