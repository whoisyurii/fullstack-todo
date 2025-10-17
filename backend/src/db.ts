import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use persistent volume path if available (for Fly.io), otherwise use local path
const dbPath = process.env.DATABASE_PATH || '/data/todos.db';
const dbDir = path.dirname(dbPath);

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
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
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  ['Work', 'Personal', 'Shopping', 'Health'].forEach(category => {
    insertCategory.run(category);
  });

  console.log('Database initialized successfully');
}

export default db;
