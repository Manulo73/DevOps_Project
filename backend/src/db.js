// Import Microsoft SQL Server client for Node.js
const sql = require("mssql");

// Load environment variables from .env file into process.env
require("dotenv").config();

// Database configuration object built from environment variables
const config = {
  // DB credentials
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // DB server host (defaults to localhost if not provided)
  server: process.env.DB_SERVER || "localhost",

  // Target database name
  database: process.env.DB_DATABASE,

  // Port number (convert from string to integer)
  port: parseInt(process.env.DB_PORT, 10) || 1433,

  options: {
    // Disable encryption (often false for local dev, true in production/Azure)
    encrypt: false,

    // Accept self-signed certificates (useful for local/dev environments)
    trustServerCertificate: true,

    // Ensures proper SQL Server arithmetic error handling
    enableArithAbort: true,

    // Time allowed to establish connection (ms)
    connectTimeout: 60000,

    // Time allowed per request (ms)
    requestTimeout: 60000,

    // Character encoding for data transmission
    charset: "UTF-8"
  },

  // Connection pool settings (reuse connections efficiently)
  pool: {
    max: 10,                // Maximum simultaneous connections
    min: 0,                 // Minimum maintained connections
    idleTimeoutMillis: 30000 // Close idle connections after 30s
  },

  // Global timeouts (fallbacks)
  connectionTimeout: 60000,
  requestTimeout: 60000
};

// Variable to store the active connection pool (singleton)
let pool;

// Function to get or create a DB connection pool
async function getConnection() {
  try {
    // Only create pool if it doesn't exist (reuse pattern)
    if (!pool) {
      pool = await sql.connect(config);
      console.log("Database connected with UTF-8 encoding");
    }

    // Return existing or newly created pool
    return pool;
  } catch (err) {
    // Log error and rethrow so caller can handle it
    console.error("DB connection failed:", err);
    throw err;
  }
}

// Export connection getter and sql library for queries elsewhere
module.exports = { getConnection, sql };