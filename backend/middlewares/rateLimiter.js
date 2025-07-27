const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // max 1000 requests per 15 minutes per IP
  message: "Too many requests from this IP, please try again later.",
});

module.exports = limiter;
