"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
// Initialize SQLite database
const db = new better_sqlite3_1.default(path_1.default.join(__dirname, '../todos.db'));
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
    const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
    ['Work', 'Personal', 'Shopping', 'Health'].forEach(category => {
        insertCategory.run(category);
    });
    console.log('Database initialized successfully');
}
exports.default = db;
