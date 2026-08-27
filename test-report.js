const { getReportData } = require("./report");

const report = getReportData();

console.log(JSON.stringify(report, null, 2));