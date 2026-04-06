// src/controllers/incident-controller.js

const { getConnection, sql } = require("../db");

// INCIDENT VIEW

// Get all incidents with client and technician names
async function getIncidents(req, res, next) {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        i.public_id,
        i.title,
        i.description,
        i.category,
        i.priority,
        i.status,
        i.created_at,
        i.resolved_at,

        -- Client info
        i.client_id,
        c.full_name AS client_name,

        -- Technician info (can be NULL)
        i.technician_id,
        t.full_name AS technician_name

      FROM incidents i
      INNER JOIN users c 
        ON i.client_id = c.id

      LEFT JOIN users t 
        ON i.technician_id = t.id

      ORDER BY i.created_at DESC
    `);

    res.json(result.recordset);

  } catch (err) {
    next(err);
  }
}

// Create a new incident
async function createIncident(req, res, next) {
  try {
    const pool = await getConnection();

    const {
      title,
      description,
      category,
      priority,
      client_id,      // this is public_id
      technician_id   // this is public_id (optional)
    } = req.body;

    /* =========================
       1️⃣ Get real CLIENT id
    ========================== */
    const clientResult = await pool.request()
      .input("public_id", sql.UniqueIdentifier, client_id)
      .query(`
        SELECT id
        FROM users
        WHERE public_id = @public_id
      `);

    if (clientResult.recordset.length === 0) {
      return res.status(400).json({ message: "Client not found" });
    }

    const realClientId = clientResult.recordset[0].id;

    /* =========================
       2️⃣ Get real TECH id (optional)
    ========================== */
    let realTechnicianId = null;

    if (technician_id) {
      const techResult = await pool.request()
        .input("public_id", sql.UniqueIdentifier, technician_id)
        .query(`
          SELECT id
          FROM users
          WHERE public_id = @public_id
        `);

      if (techResult.recordset.length === 0) {
        return res.status(400).json({ message: "Technician not found" });
      }

      realTechnicianId = techResult.recordset[0].id;
    }

    /* =========================
       3️⃣ Insert incident
    ========================== */
    const result = await pool.request()
      .input("title", sql.NVarChar(150), title)
      .input("description", sql.NVarChar(sql.MAX), description)
      .input("category", sql.NVarChar(50), category)
      .input("priority", sql.NVarChar(20), priority)
      .input("client_id", sql.Int, realClientId)
      .input("technician_id", sql.Int, realTechnicianId)
      .query(`
        INSERT INTO incidents (
          title,
          description,
          category,
          priority,
          client_id,
          technician_id
        )
        OUTPUT INSERTED.*
        VALUES (
          @title,
          @description,
          @category,
          @priority,
          @client_id,
          @technician_id
        )
      `);

    res.status(201).json(result.recordset[0]);

  } catch (err) {
    next(err);
  }
}

// Get data for form selects (clients & technicians)
async function getFormSelectData(req, res, next) {
  try {
    const pool = await getConnection();

    const clients = await pool.request().query(`
      SELECT 
        public_id,
        full_name AS name
      FROM users
      WHERE role = 'cliente'
      ORDER BY full_name
    `);

    const technicians = await pool.request().query(`
      SELECT 
        public_id,
        full_name AS name
      FROM users
      WHERE role = 'tecnico'
      ORDER BY full_name
    `);

    res.json({
      clients: clients.recordset,
      technicians: technicians.recordset
    });

  } catch (err) {
    next(err);
  }
}

// Get one incident by PUBLIC ID
async function getIncidentData(req, res, next) {
  try {
    const pool = await getConnection();
    const { incident_id } = req.params;

    const result = await pool.request()
      .input("public_id", sql.UniqueIdentifier, incident_id)
      .query(`
        SELECT
          i.public_id,
          i.title,
          i.description,
          i.category,
          i.priority,
          i.status,
          i.created_at,
          i.resolved_at,

          -- return PUBLIC IDs instead of internal IDs
          c.public_id AS client_id,
          c.full_name AS client_name,

          t.public_id AS technician_id,
          t.full_name AS technician_name

        FROM incidents i
        INNER JOIN users c 
          ON i.client_id = c.id

        LEFT JOIN users t 
          ON i.technician_id = t.id

        WHERE i.public_id = @public_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json(result.recordset[0]);

  } catch (err) {
    next(err);
  }
}

// Edit incident by PUBLIC ID
async function editIncident(req, res, next) {
  try {
    const pool = await getConnection();
    const { incident_id } = req.params;

    const {
      title,
      description,
      category,
      priority,
      technician_id
    } = req.body;

    let technicianDbId = null;

    // Convert technician public_id → internal id
    if (technician_id) {
      const techResult = await pool.request()
        .input("public_id", sql.UniqueIdentifier, technician_id)
        .query(`
          SELECT id
          FROM users
          WHERE public_id = @public_id
        `);

      if (techResult.recordset.length > 0) {
        technicianDbId = techResult.recordset[0].id;
      }
    }

    const result = await pool.request()
      .input("public_id", sql.UniqueIdentifier, incident_id)
      .input("title", sql.NVarChar(150), title)
      .input("description", sql.NVarChar(sql.MAX), description)
      .input("category", sql.NVarChar(50), category)
      .input("priority", sql.NVarChar(20), priority)
      .input("technician_id", sql.Int, technicianDbId)
      .query(`
        UPDATE incidents
        SET
          title = @title,
          description = @description,
          category = @category,
          priority = @priority,
          technician_id = @technician_id
        OUTPUT INSERTED.*
        WHERE public_id = @public_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json(result.recordset[0]);

  } catch (err) {
    next(err);
  }
}

module.exports = {
    getIncidents,
    createIncident,
    getFormSelectData,
    getIncidentData,
    editIncident
};