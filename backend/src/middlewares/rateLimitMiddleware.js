import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication requests per window
  message: {
    message: 'Too many authentication requests, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 API requests per minute
  message: {
    message: 'Too many requests, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
