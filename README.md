# PDF Report Generator

A Node.js reporting service that reads shop orders from SQLite, creates an
aggregated report, converts it to PDF using Playwright/Chromium, and serves
the PDF through an Express API.

## Dataset

Option A — Little Shop.

The project uses 200 randomly generated shop orders containing:

- customer
- product
- amount
- created_at

## Requirements

- Node.js 22+
- npm
- Playwright
- Chromium

## Run

Install dependencies:

    npm install

Install Chromium:

    npx playwright install chromium

Seed the database:

    node seed.js

Start the API:

    node server.js

Generate a report:

    curl.exe -i -X POST http://localhost:3000/reports

Download the generated report:

    curl.exe -o my-report.pdf http://localhost:3000/reports/1/file

Replace `1` with the returned report ID.

## Aggregation SQL

Total orders:

    SELECT COUNT(*) AS total
    FROM orders;

Total revenue:

    SELECT SUM(amount) AS total
    FROM orders;

Top 5 products by revenue:

    SELECT product, SUM(amount) AS revenue
    FROM orders
    GROUP BY product
    ORDER BY revenue DESC
    LIMIT 5;

Orders per day for the last 7 days:

    SELECT DATE(created_at) AS date, COUNT(*) AS orders
    FROM orders
    WHERE DATE(created_at) >= DATE('now', '-6 days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC;

## API

    GET  /health
    POST /reports
    GET  /reports/:id
    GET  /reports/:id/file

## POST → Download Proof

Generate:

    POST /reports

Example response:

    {
      "id": 4,
      "file": "/reports/4/file"
    }

Download:

    curl.exe -o my-report.pdf http://localhost:3000/reports/4/file

The downloaded file is a generated multi-page PDF report.

## Stage 4

Report generation is performed inside the HTTP request. For large reports or
many users, this work should be moved to a background job or queue so the
request does not remain open while the PDF is generated.

## Stage 5

The duplicate-report check protects against repeated requests, such as a user
double-clicking the Generate Report button, creating unnecessary duplicate
reports and files.

A missing idempotency check could cause real-world duplicate costs, such as
charging a customer twice or sending the same customer the same email twice.

Normal repeated requests return the existing report, while:

    {
      "force": true
    }

generates a new report.

## Screenshot

Add a screenshot of page 1 of a generated PDF here.

## Repository

Generated PDFs and the SQLite database are ignored by Git. `seed.js` is the
recipe for recreating the database.

Stage 0–6 complete.