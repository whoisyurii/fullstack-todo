"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Use persistent volume path in production (Fly.io), local path in development
const dbPath = process.env.DATABASE_PATH || path_1.default.join(__dirname, "..", "todos.db");
const dbDir = path_1.default.dirname(dbPath);
// Ensure directory exists (only if not using production path)
if (!fs_1.default.existsSync(dbDir)) {
    try {
        fs_1.default.mkdirSync(dbDir, { recursive: true });
    }
    catch (err) {
        console.error(`Failed to create database directory: ${dbDir}`, err);
        // In production, the volume should already exist
    }
}
// Initialize SQLite database
const db = new better_sqlite3_1.default(dbPath);
console.log(`Database location: ${dbPath}`);
// Create tables if they don't exist
function initializeDatabase() {
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
    const insertCategory = db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)");
    ["Work", "Personal", "Shopping", "Health"].forEach((category) => {
        insertCategory.run(category);
    });
    console.log("Database initialized successfully");
}
exports.default = db;
