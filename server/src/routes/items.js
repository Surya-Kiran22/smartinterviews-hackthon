const express = require('express');
const router = express.Router();
const { createItem, getItems, getItemById, updateItem, deleteItem, getSellerItems, getItemBids } = require('../controllers/itemController');
const auth = require('../middleware/auth');

router.post('/', auth, createItem);
router.get('/', getItems);
router.get('/seller', auth, getSellerItems);
router.get('/:id', getItemById);
router.get('/:id/bids', getItemBids);
router.put('/:id', auth, updateItem);
router.delete('/:id', auth, deleteItem);

module.exports = router;
