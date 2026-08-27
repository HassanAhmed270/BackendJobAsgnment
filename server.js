const express = require("express");
const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const { generatePDF } = require("./generatePdf");
const {
  createReport,
  getReport,
  getTodaysReport,
  deleteReport
} = require("./reports");

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

app.use(express.json());

app.post("/reports", async (req, res) => {
  let reportId = null;

  try {
    const force = req.body?.force === true;

    // If force is not requested, check whether today's report already exists.
    if (!force) {
      const existingReport = getTodaysReport();

      if (existingReport) {
        const existingFilePath = path.join(
          __dirname,
          existingReport.path
        );

        // Only reuse the report if its PDF still exists.
        if (fs.existsSync(existingFilePath)) {
          return res.status(200).json({
            id: existingReport.id,
            file: `/reports/${existingReport.id}/file`
          });
        }
      }
    }

    fs.mkdirSync(path.join(__dirname, "reports"), {
      recursive: true
    });

    // Create database row first so SQLite gives us the ID.
    const report = createReport("pending");

    reportId = report.id;

    const filePath = path.join(
      __dirname,
      "reports",
      `${reportId}.pdf`
    );

    const relativePath = `reports/${reportId}.pdf`;

    // Generate the PDF.
    await generatePDF(filePath);

    // Store the real PDF path.
    const db = new DatabaseSync("report.db");

    db.prepare(`
      UPDATE reports
      SET path = ?
      WHERE id = ?
    `).run(relativePath, reportId);

    db.close();

    return res.status(201).json({
      id: reportId,
      file: `/reports/${reportId}/file`
    });
  } catch (error) {
    console.error("Report generation failed:", error);

    if (reportId !== null) {
      deleteReport(reportId);
    }

    return res.status(500).json({
      error: "Failed to generate report"
    });
  }
});

app.get("/reports/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      error: "Report not found"
    });
  }

  const report = getReport(id);

  if (!report || report.path === "pending") {
    return res.status(404).json({
      error: "Report not found"
    });
  }

  res.json({
    id: report.id,
    path: report.path,
    created_at: report.created_at,
    file: `/reports/${report.id}/file`
  });
});

app.get("/reports/:id/file", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      error: "Report not found"
    });
  }

  const report = getReport(id);

  if (!report || report.path === "pending") {
    return res.status(404).json({
      error: "Report not found"
    });
  }

  const filePath = path.join(__dirname, report.path);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: "Report file not found"
    });
  }

  res.sendFile(filePath);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});