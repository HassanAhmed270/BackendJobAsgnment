\# Backend Job Assignment — Reporting Pipeline



A small Node.js reporting service that demonstrates the complete flow from

database data to a generated PDF and an API endpoint that serves the report.



\## Project Overview



This project builds a simple reporting pipeline for a small shop.



The pipeline is:



SQLite database

&#x20;   ↓

SQL aggregation

&#x20;   ↓

Report data

&#x20;   ↓

HTML report

&#x20;   ↓

Playwright + Chromium

&#x20;   ↓

PDF file

&#x20;   ↓

Express API

&#x20;   ↓

Report download



The project uses invented shop order data for development and testing.



\## Technologies



\- Node.js

\- Express

\- SQLite

\- Playwright

\- Chromium

\- HTML/CSS

\- PDF generation through Chromium

\- REST API



\## Requirements



\- Node.js 22+

\- npm

\- Playwright

\- Chromium installed through Playwright



Node.js 22 is used because the project uses Node's built-in SQLite

implementation through `node:sqlite`.



\## Installation



Install the project dependencies:



&#x20;   npm install



Install the Playwright Chromium browser:



&#x20;   npx playwright install chromium



\## Project Structure



&#x20;   Assignment 9/

&#x20;   │

&#x20;   ├── server.js

&#x20;   ├── seed.js

&#x20;   ├── report.js

&#x20;   ├── reports.js

&#x20;   ├── generatePdf.js

&#x20;   ├── report.db

&#x20;   ├── README.md

&#x20;   │

&#x20;   └── reports/

&#x20;       └── test.pdf



\### Main Files



`server.js`

Express API containing the health check and report endpoints.



`seed.js`

Creates approximately 200 random shop orders in SQLite.



`report.js`

Runs the SQL queries and produces the report data.



`generatePdf.js`

Builds the HTML report and uses Playwright/Chromium to generate the PDF.



`reports.js`

Handles report records stored in the SQLite `reports` table.



`report.db`

SQLite database containing the shop orders and report bookkeeping.



`reports/`

Directory where generated PDF reports are stored.



\## Stage 0 — Setup



The project starts with a minimal Express server.



Health endpoint:



&#x20;   GET /health



Response:



&#x20;   {

&#x20;     "status": "ok"

&#x20;   }



Playwright and Chromium were installed for PDF generation.



Test:



&#x20;   curl.exe -i http://localhost:3000/health



Expected response:



&#x20;   HTTP/1.1 200 OK



\## Stage 1 — Seeded Report Database



The project uses SQLite with an `orders` table containing:



\- id

\- customer

\- product

\- amount

\- created\_at



The seed script generates approximately 200 random orders using several

different products, random amounts, and dates from the last 30 days.



Run:



&#x20;   node seed.js



Expected result:



&#x20;   Seed complete: 200 orders



The seed operation clears existing orders before inserting new data, making

it safe to run repeatedly without accumulating duplicate seed data.



\## Stage 2 — SQL Report Data



The report queries use standard SQL aggregation:



\- COUNT

\- SUM

\- GROUP BY

\- ORDER BY

\- LIMIT



The report contains:



\- Total number of orders

\- Total revenue

\- Top 5 products by revenue

\- Orders per day for the last 7 days

\- All orders for the detailed report



The main reporting function is:



&#x20;   getReportData()



It returns all report information as one JavaScript object.



\## Stage 3 — HTML to PDF



The report data is converted into an HTML document.



The generated report contains:



\- Report title

\- Report date

\- Total orders

\- Total revenue

\- Top 5 products by revenue

\- All orders



Playwright launches headless Chromium and prints the HTML page to PDF.



The PDF uses A4 format and print backgrounds.



Example:



&#x20;   reports/test.pdf



The report also uses print CSS to prevent table rows from being split between

pages:



&#x20;   tr {

&#x20;     break-inside: avoid;

&#x20;   }



The table headers are placed inside `<thead>` so that they can repeat when

the table continues onto another page.



\## Stage 4 — Generate and Serve by Link



The reporting pipeline was exposed through the Express API.



\### Generate a report



&#x20;   POST /reports



The endpoint:



1\. Gets the report data.

2\. Generates the HTML.

3\. Generates the PDF using Playwright.

4\. Saves the PDF in the `reports/` directory.

5\. Stores the report information in SQLite.

6\. Returns the report ID and file link.



Successful response:



&#x20;   HTTP/1.1 201 Created



Example:



&#x20;   {

&#x20;     "id": 1,

&#x20;     "file": "/reports/1/file"

&#x20;   }



\### Get report information



&#x20;   GET /reports/:id



Example:



&#x20;   GET /reports/1



Response:



&#x20;   {

&#x20;     "id": 1,

&#x20;     "path": "reports/1.pdf",

&#x20;     "created\_at": "2026-08-27T05:21:40.167Z",

&#x20;     "file": "/reports/1/file"

&#x20;   }



An unknown report ID returns:



&#x20;   404 Report not found



\### Download the PDF



&#x20;   GET /reports/:id/file



This endpoint serves the generated PDF from disk.



Example:



&#x20;   curl.exe -o my-report.pdf http://localhost:3000/reports/1/file



\## Report Bookkeeping



The SQLite database contains a `reports` table:



&#x20;   reports

&#x20;   ├── id

&#x20;   ├── path

&#x20;   └── created\_at



This keeps the report metadata next to the reporting data while the actual

PDF remains stored on disk.



\## Stage 5 — Duplicate Report Protection



Stage 5 adds business-level idempotency to the report-generation endpoint.



When a normal `POST /reports` request is received, the server first checks

whether a completed report has already been generated today.



If today's report exists and its PDF is still available, the existing report

is returned instead of generating another PDF.



The first request returns:



&#x20;   HTTP/1.1 201 Created



A repeated request for the same day's report returns:



&#x20;   HTTP/1.1 200 OK



Both responses contain the same report ID and file link.



This protects against duplicate requests, such as a user double-clicking the

Generate Report button, creating unnecessary duplicate reports and files.



In a real-world system, a missing idempotency check could cause money or

customer-impacting duplicates, such as charging a customer twice or emailing

the same customer twice.



\### Force a New Report



A new report can be requested by sending:



&#x20;   {

&#x20;     "force": true

&#x20;   }



Example:



&#x20;   curl.exe -i -X POST http://localhost:3000/reports -H "Content-Type: application/json" -d "{\\"force\\":true}"



With `force: true`, the daily duplicate check is skipped and a new report is

generated.



The forced request returns:



&#x20;   HTTP/1.1 201 Created



with a new report ID.



\## API Summary



| Method | Endpoint | Purpose |

|--------|----------|---------|

| GET | `/health` | Check whether the server is running |

| POST | `/reports` | Generate or reuse today's report |

| GET | `/reports/:id` | Get report metadata |

| GET | `/reports/:id/file` | Download the PDF |



\## Running the Application



Start the server:



&#x20;   node server.js



The server runs at:



&#x20;   http://localhost:3000



Check the server:



&#x20;   curl.exe -i http://localhost:3000/health



Generate today's report:



&#x20;   curl.exe -i -X POST http://localhost:3000/reports



Request the same report again:



&#x20;   curl.exe -i -X POST http://localhost:3000/reports



Force a new report:



&#x20;   curl.exe -i -X POST http://localhost:3000/reports -H "Content-Type: application/json" -d "{\\"force\\":true}"



Get report information:



&#x20;   curl.exe -i http://localhost:3000/reports/1



Download a report:



&#x20;   curl.exe -o my-report.pdf http://localhost:3000/reports/1/file



\## Background Jobs



Report generation is intentionally performed inside the HTTP request for this

assignment.



For a small report and a small number of users, this is acceptable.



For large reports or many simultaneous users, the PDF generation should be

moved to a background job or queue so that the HTTP request does not remain

open while the report is being generated.



\## Development Notes



The SQLite `node:sqlite` API is currently marked experimental in the Node.js

version used by this project. The warning does not prevent the application

from working.



Generated PDF files are runtime artifacts. The database stores their paths so

that the API can locate and serve them.



\## Assignment Progress



\- Stage 0 — Setup ready

\- Stage 1 — Seeded report database

\- Stage 2 — SQL report aggregation

\- Stage 3 — HTML to PDF

\- Stage 4 — Generate and serve by link

\- Stage 5 — Duplicate requests make one report



\## Current Status



Stages 0–5 are implemented and tested.



The application can seed shop data, aggregate it with SQL, generate a

multi-page PDF report, store report metadata, serve reports through an API,

and prevent duplicate report generation for the same day unless explicitly

forced.

