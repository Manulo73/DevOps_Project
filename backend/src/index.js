const cors = require("cors");
const express = require("express");

const dashboardRoutes = require("./routes/dashboard");
const incidentRoutes = require("./routes/incidents")

const app = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────
// Body parsers
// ─────────────────────────────────────────
app.use(express.json({ 
  limit: "10mb",
  type: "application/json"
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: "10mb",
  type: "application/x-www-form-urlencoded"
}));

// ─────────────────────────────────────────
// CORS configuration
// ─────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ─────────────────────────────────────────
// Preflight handler (fixes OPTIONS requests)
// ─────────────────────────────────────────
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(200);
  }
  next();
});

// ─────────────────────────────────────────
// Charset middleware
// ─────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// ─────────────────────────────────────────
// Routes
// ─────────────────────────────────────────
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/incidents", incidentRoutes);

// ─────────────────────────────────────────
// Start server
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});