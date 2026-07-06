const express = require('express');
const router = express.Router();
const { addToWatchlist, removeFromWatchlist, getWatchlist } = require('../controllers/watchlistController');
const auth = require('../middleware/auth');

router.post('/:itemId', auth, addToWatchlist);
router.delete('/:itemId', auth, removeFromWatchlist);
router.get('/', auth, getWatchlist);

module.exports = router;
