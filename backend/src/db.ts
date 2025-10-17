import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Use persistent volume path in production (Fly.io), local path in development
const dbPath =
  process.env.DATABASE_PATH || path.join(__dirname, "..", "todos.db");
const dbDir = path.dirname(dbPath);

// Ensure directory exists (only if not using production path)
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (err) {
    console.error(`Failed to create database directory: ${dbDir}`, err);
    // In production, the volume should already exist
  }
}

// Initialize SQLite database
const db = new Database(dbPath);

console.log(`Database location: ${dbPath}`);

// Create tables if they don't exist
export function initializeDatabase() {
  // Create categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      name TEXT PRIMARY KEY
    )
  `);

  // Create todos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      category TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (category) REFERENCES categories(name)
    )
  `);

  // Insert default categories if they don't exist
  const insertCategory = db.prepare(
    "INSERT OR IGNORE INTO categories (name) VALUES (?)"
  );
  ["Work", "Personal", "Shopping", "Health"].forEach((category) => {
    insertCategory.run(category);
  });

  console.log("Database initialized successfully");
}

export default db;
