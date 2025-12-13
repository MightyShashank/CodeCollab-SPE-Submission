// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit'; // ratelimiter to prevent user from abusing multiple login attempts

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 attempts per IP
  message: {
    status: 429,
    message: "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
});
