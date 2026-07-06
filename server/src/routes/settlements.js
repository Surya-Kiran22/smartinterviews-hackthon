const express = require('express');
const router = express.Router();
const { createSettlement, updateSettlementStatus, getSettlements, getSettlementById } = require('../controllers/settlementController');
const auth = require('../middleware/auth');

router.post('/item/:itemId', auth, createSettlement);
router.get('/', auth, getSettlements);
router.get('/:id', auth, getSettlementById);
router.put('/:id', auth, updateSettlementStatus);

module.exports = router;
