const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enforce foreign key constraints in SQLite
db.pragma('foreign_keys = ON');

// Initialize tables from schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

// Seed initial accounts/data if users table is empty
const seedPath = path.join(__dirname, 'seed.sql');
if (fs.existsSync(seedPath)) {
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (userCount === 0) {
    const seed = fs.readFileSync(seedPath, 'utf8');
    db.exec(seed);
    console.log('Database seeded with initial test accounts.');
  }
}

module.exports = db;