const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet = require("helmet");
const rateLimiter = require("./middlewares/rateLimiter");
const securityHeaders = require("./middlewares/securityHeaders");
const csp = require("./middlewares/csp");

const userRoutes = require("./routes/userRoutes");
const terminRoutes = require("./routes/terminRoutes");

require("dotenv").config();

const app = express();

// -------- JSON Body Parser --------
app.use(express.json());

// -------- CORS Setup --------
const allowedOrigins = [
  "https://oasischalet.fly.dev",
  "https://oasis-chalet.onrender.com",
  "https://oasischalet.vercel.app",
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`❌ CORS blocked request from: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Auth-Token",
    ],
    optionsSuccessStatus: 204,
  })
);

// -------- Security and Compression --------
app.use(cookieParser());
app.use(rateLimiter);
app.use(helmet());
app.use(compression());
app.use(csp);
app.use(securityHeaders);

// -------- Routes --------
app.use("/api/v1", userRoutes);
app.use("/api/v1", terminRoutes);

// -------- Welcome Route --------
app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 OasisChalet API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// -------- Global Error Handler --------
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:");
  console.error("URL:", req.originalUrl);
  console.error("Method:", req.method);
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

module.exports = app;
