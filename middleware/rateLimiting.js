const rateLimit = require("express-rate-limit");

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// LinkedIn API rate limiting
const linkedinLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 50,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "LinkedIn API rate limit exceeded",
    },
  },
});

// Post publishing rate limiting
const publishLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message:
        "Publishing rate limit exceeded. Maximum 10 posts per hour per profile",
    },
  },
});

// Viral post generation rate limiting
const viralPostLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 5, // Allow 5 viral post generations per minute
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Viral post generation rate limit exceeded. Maximum 5 requests per minute.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  linkedinLimiter,
  publishLimiter,
  viralPostLimiter,
};
