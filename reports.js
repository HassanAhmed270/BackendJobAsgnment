const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync("report.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

function createReport(filePath) {
  const createdAt = new Date().toISOString();

  const result = db
    .prepare(`
      INSERT INTO reports (path, created_at)
      VALUES (?, ?)
    `)
    .run(filePath, createdAt);

  return db
    .prepare(`
      SELECT id, path, created_at
      FROM reports
      WHERE id = ?
    `)
    .get(result.lastInsertRowid);
}

function getReport(id) {
  return db
    .prepare(`
      SELECT id, path, created_at
      FROM reports
      WHERE id = ?
    `)
    .get(id);
}

function deleteReport(id) {
  db.prepare(`
    DELETE FROM reports
    WHERE id = ?
  `).run(id);
}

function getNextReportId() {
  const result = db
    .prepare(`
      SELECT COALESCE(MAX(id), 0) + 1 AS nextId
      FROM reports
    `)
    .get();

  return result.nextId;
}

module.exports = {
  createReport,
  getReport,
  deleteReport,
  getNextReportId
};