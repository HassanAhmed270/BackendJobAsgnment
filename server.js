const express = require("express");

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});