const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const saltRounds = 10;

async function migrate(pool) {
  const adminUsername = "admin";
  const adminEmail = "admin@example.com";
  const adminPassword = "password"; // Temporary password

  try {
    // Check if the admin user already exists
    const res = await pool.query("SELECT * FROM users WHERE username = $1", [
      adminUsername,
    ]);
    if (res.rows.length > 0) {
      console.log("Admin user already exists.");
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Insert the admin user
    await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)",
      [adminUsername, adminEmail, passwordHash, "admin"],
    );
    console.log("Admin user created successfully.");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

module.exports = migrate;
