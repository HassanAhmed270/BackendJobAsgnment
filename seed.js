const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync("report.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer TEXT NOT NULL,
    product TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at TEXT NOT NULL
  )
`);

db.exec("DELETE FROM orders");

const products = [
  "T-Shirt",
  "Jeans",
  "Jacket",
  "Sneakers",
  "Shirt",
  "Cap"
];

const customers = [
  "Ahmed",
  "Hassan",
  "Ali",
  "Usman",
  "Bilal",
  "Hamza",
  "Omar",
  "Zain",
  "Ayesha",
  "Fatima"
];

const insert = db.prepare(`
  INSERT INTO orders (customer, product, amount, created_at)
  VALUES (?, ?, ?, ?)
`);

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomAmount() {
  return Number((Math.random() * (200 - 5) + 5).toFixed(2));
}

function randomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);

  now.setDate(now.getDate() - daysAgo);

  return now.toISOString();
}

for (let i = 1; i <= 200; i++) {
  insert.run(
    randomItem(customers),
    randomItem(products),
    randomAmount(),
    randomDate()
  );
}

const result = db.prepare("SELECT COUNT(*) AS count FROM orders").get();

console.log(`Seed complete: ${result.count} orders`);

db.close();