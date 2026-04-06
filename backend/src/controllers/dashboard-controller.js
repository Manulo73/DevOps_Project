// src/controllers/dashboard-controller.js

const { getConnection, sql } = require("../db");

// DASHBOARD VIEW

// Get top 10 incidents with client and technician names
async function getTopIncidents(req, res, next) {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 10
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

// Get top 10 unassigned incidents
async function getUnassignedIncidents(req, res, next) {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 10
        i.public_id,
        i.title,
        i.description,
        i.category,
        i.priority,
        i.status,
        i.created_at,

        -- Client info
        i.client_id,
        c.full_name AS client_name

      FROM incidents i
      INNER JOIN users c
        ON i.client_id = c.id

      WHERE i.technician_id IS NULL

      ORDER BY
        CASE
          WHEN i.priority = 'critical' THEN 1
          WHEN i.priority = 'high' THEN 2
          WHEN i.priority = 'medium' THEN 3
          WHEN i.priority = 'low' THEN 4
        END,
        i.created_at ASC
    `);

    res.json(result.recordset);

  } catch (err) {
    next(err);
  }
}

// Get top 10 recently resolved incidents
async function getRecentlyResolvedIncidents(req, res, next) {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 10
        i.public_id,
        i.title,
        i.description,
        i.category,
        i.priority,
        i.status,
        i.created_at,
        i.resolved_at,

        -- Client info
        c.full_name AS client_name,

        -- Technician info
        t.full_name AS technician_name

      FROM incidents i
      INNER JOIN users c
        ON i.client_id = c.id

      LEFT JOIN users t
        ON i.technician_id = t.id

      WHERE i.status = 'resolved'

      ORDER BY i.resolved_at DESC
    `);

    res.json(result.recordset);

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTopIncidents,
  getRecentlyResolvedIncidents,
  getUnassignedIncidents
};