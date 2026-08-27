const { DatabaseSync } = require("node:sqlite");

function getReportData() {
  const db = new DatabaseSync("report.db");

  const totalOrders = db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM orders
    `)
    .get();

  const totalRevenue = db
    .prepare(`
      SELECT SUM(amount) AS total
      FROM orders
    `)
    .get();

  const topProducts = db
    .prepare(`
      SELECT
        product,
        SUM(amount) AS revenue
      FROM orders
      GROUP BY product
      ORDER BY revenue DESC
      LIMIT 5
    `)
    .all();

  const ordersPerDay = db
    .prepare(`
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS orders
      FROM orders
      WHERE DATE(created_at) >= DATE('now', '-6 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `)
    .all();

  const allOrders = db
    .prepare(`
      SELECT id, customer, product, amount, created_at
      FROM orders
      ORDER BY created_at ASC
    `)
    .all();

  db.close();

  return {
    totalOrders: totalOrders.total,
    totalRevenue: totalRevenue.total,
    topProducts,
    ordersPerDay,
    allOrders
  };
}

module.exports = { getReportData };