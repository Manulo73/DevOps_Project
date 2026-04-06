// src/routes/dashboard.js
const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard-controller");

// Each route points to a controller method
router.get("/get-top-incidents", dashboardController.getTopIncidents);
router.get("/get-top-unassigned-incidents", dashboardController.getUnassignedIncidents);
router.get("/get-recent-done-incidents", dashboardController.getRecentlyResolvedIncidents);

module.exports = router;