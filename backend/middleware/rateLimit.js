const rateLimit = require('express-rate-limit');

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 AI requests per minute
  message: {
    success: false,
    error: 'Too many AI requests, please wait before trying again.'
  }
});

// Speech processing rate limiting
const speechLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit speech processing requests
  message: {
    success: false,
    error: 'Too many speech processing requests, please wait.'
  }
});

module.exports = {
  apiLimiter,
  aiLimiter,
  speechLimiter
};