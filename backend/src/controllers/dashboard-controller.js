// src/controllers/dashboard-controller.js

const { getConnection, sql } = require("../db");

// DASHBOARD VIEW

// Get all incidents with client and technician names
async function getIncidents(req, res, next) {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        i.id,
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
      client_id,
      technician_id // optional
    } = req.body;

    const result = await pool.request()
      .input("title", sql.NVarChar(150), title)
      .input("description", sql.NVarChar(sql.MAX), description)
      .input("category", sql.NVarChar(50), category)
      .input("priority", sql.NVarChar(20), priority)
      .input("client_id", sql.Int, client_id)
      .input("technician_id", sql.Int, technician_id || null)
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

module.exports = {
    getIncidents,
    createIncident
};