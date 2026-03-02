// src/routes/dashboard.js
const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard-controller");

// Each route points to a controller method
router.get("/get-incidents", dashboardController.getIncidents);
router.post("/create-incident", dashboardController.createIncident);

module.exports = router;