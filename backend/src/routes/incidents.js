// src/routes/dashboard.js
const express = require("express");
const router = express.Router();

const incidentController = require("../controllers/incident-controller");

// Each route points to a controller method
router.get("/get-table", incidentController.getIncidents);
router.get("/get-form-prep-data", incidentController.getFormSelectData);
router.post("/create-incident", incidentController.createIncident);
router.get("/:incident_id", incidentController.getIncidentData);
router.put("/:incident_id", incidentController.editIncident);

module.exports = router;