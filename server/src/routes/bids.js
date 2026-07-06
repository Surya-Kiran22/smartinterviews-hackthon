const express = require('express');
const router = express.Router();
const { placeBid, getMyBids } = require('../controllers/bidController');
const auth = require('../middleware/auth');
const { bidLimiter } = require('../utils/rateLimiter');

// This route will be wrapped with io in the main server file
router.post('/:id/bid', auth, bidLimiter, (req, res) => {
  // This is a placeholder - the actual handler will be set in index.js
  res.status(500).json({ error: 'Socket.io not initialized' });
});

router.get('/my', auth, getMyBids);

module.exports = router;
