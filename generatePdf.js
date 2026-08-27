const { chromium } = require("playwright");
const { getReportData } = require("./report");
const fs = require("fs");

function buildReportHTML(report) {
  const today = new Date().toLocaleDateString("en-GB");

  const topProductsRows = report.topProducts
    .map(
      (item) => `
        <tr>
          <td>${item.product}</td>
          <td>Rs ${Number(item.revenue).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const ordersRows = report.allOrders
    .map(
      (order) => `
        <tr>
          <td>${order.id}</td>
          <td>${order.customer}</td>
          <td>${order.product}</td>
          <td>Rs ${Number(order.amount).toFixed(2)}</td>
          <td>${new Date(order.created_at).toLocaleDateString("en-GB")}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">

      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #222;
        }

        h1 {
          margin-bottom: 5px;
        }

        .date {
          color: #666;
          margin-bottom: 30px;
        }

        .summary {
          display: flex;
          gap: 40px;
          margin-bottom: 30px;
        }

        .summary-box {
          border: 1px solid #ddd;
          padding: 15px 25px;
        }

        .summary-label {
          font-size: 12px;
          color: #666;
        }

        .summary-value {
          font-size: 24px;
          font-weight: bold;
        }

        h2 {
          margin-top: 30px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th,
        td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: left;
        }

        th {
          background: #eee;
        }

        tr {
          break-inside: avoid;
        }

        thead {
          display: table-header-group;
        }
      </style>
    </head>

    <body>
      <h1>Shop Sales Report</h1>
      <div class="date">Report Date: ${today}</div>

      <div class="summary">
        <div class="summary-box">
          <div class="summary-label">Total Orders</div>
          <div class="summary-value">${report.totalOrders}</div>
        </div>

        <div class="summary-box">
          <div class="summary-label">Total Revenue</div>
          <div class="summary-value">
            Rs ${Number(report.totalRevenue).toFixed(2)}
          </div>
        </div>
      </div>

      <h2>Top 5 Products by Revenue</h2>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Revenue</th>
          </tr>
        </thead>

        <tbody>
          ${topProductsRows}
        </tbody>
      </table>

      <h2>All Orders</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          ${ordersRows}
        </tbody>
      </table>
    </body>
    </html>
  `;
}

async function generatePDF(outputPath) {
  const report = getReportData();

  const browser = await chromium.launch({
    headless: true
  });

  try {
    const page = await browser.newPage();

    const html = buildReportHTML(report);

    await page.setContent(html);

    fs.mkdirSync("reports", { recursive: true });

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true
    });
  } finally {
    await browser.close();
  }
}

module.exports = {
  buildReportHTML,
  generatePDF
};