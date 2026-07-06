const rateLimit = require('express-rate-limit');

const bidLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each user to 10 bids per minute per item
  message: { error: 'Too many bids, please try again later' },
  keyGenerator: (req) => {
    return req.user.id + '-' + req.params.id; // Unique per user per item
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased limit for development/testing
  message: { error: 'Too many authentication attempts, please try again later' }
});

module.exports = { bidLimiter, authLimiter };
