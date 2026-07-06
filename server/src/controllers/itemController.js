const prisma = require('../config/database');

const createItem = async (req, res) => {
  try {
    const { title, description, category, images, condition, startingPrice, startTime, endTime, bidIncrementMin, antiSnipeWindowSeconds, antiSnipeExtensionSeconds } = req.body;

    // Validate input
    if (!title || !description || !category || !startingPrice || !startTime || !endTime) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const item = await prisma.item.create({
      data: {
        title,
        description,
        category,
        images: images || [],
        condition,
        startingPrice,
        currentHighestBid: startingPrice,
        sellerId: req.user.id,
        startTime: start,
        endTime: end,
        bidIncrementMin: bidIncrementMin || 1,
        antiSnipeWindowSeconds: antiSnipeWindowSeconds || 30,
        antiSnipeExtensionSeconds: antiSnipeExtensionSeconds || 60,
        status: 'upcoming'
      },
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Server error creating item' });
  }
};

const getItems = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Server error fetching items' });
  }
};

const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        },
        bids: {
          include: {
            bidder: {
              select: { id: true, name: true }
            }
          },
          orderBy: { timestamp: 'desc' },
          take: 20
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Server error fetching item' });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, images, condition } = req.body;

    // Check if user is the seller
    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (existingItem.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    // Only allow updates if item hasn't started
    if (existingItem.status === 'live' || existingItem.status === 'ended') {
      return res.status(400).json({ error: 'Cannot update item that is live or ended' });
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(images && { images }),
        ...(condition && { condition })
      },
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(item);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Server error updating item' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is the seller
    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (existingItem.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    // Only allow deletion if item hasn't started
    if (existingItem.status === 'live' || existingItem.status === 'ended') {
      return res.status(400).json({ error: 'Cannot delete item that is live or ended' });
    }

    await prisma.item.delete({ where: { id } });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Server error deleting item' });
  }
};

const getSellerItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: { sellerId: req.user.id },
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { bids: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(items);
  } catch (error) {
    console.error('Get seller items error:', error);
    res.status(500).json({ error: 'Server error fetching seller items' });
  }
};

const getItemBids = async (req, res) => {
  try {
    const { id } = req.params;

    const bids = await prisma.bid.findMany({
      where: { itemId: id },
      include: {
        bidder: {
          select: { id: true, name: true, email: true, phone: true, college: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Calculate statistics
    const uniqueBidders = new Set(bids.map(bid => bid.bidderId)).size;
    const priceIncrements = bids.length > 0 ? bids.length - 1 : 0;
    const highestBid = bids.length > 0 ? Math.max(...bids.map(bid => bid.amount)) : 0;
    const lowestBid = bids.length > 0 ? Math.min(...bids.map(bid => bid.amount)) : 0;

    res.json({
      bids,
      statistics: {
        totalBids: bids.length,
        uniqueBidders,
        priceIncrements,
        highestBid,
        lowestBid
      }
    });
  } catch (error) {
    console.error('Get item bids error:', error);
    res.status(500).json({ error: 'Server error fetching item bids' });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getSellerItems,
  getItemBids
};
