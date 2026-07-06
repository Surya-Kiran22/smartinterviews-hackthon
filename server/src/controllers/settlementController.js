const prisma = require('../config/database');

const createSettlement = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Check if item exists and has ended
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.status !== 'ended') {
      return res.status(400).json({ error: 'Item must be ended to create settlement' });
    }

    // Check if settlement already exists
    const existingSettlement = await prisma.settlement.findUnique({
      where: { itemId }
    });

    if (existingSettlement) {
      return res.status(400).json({ error: 'Settlement already exists for this item' });
    }

    // Check if there are any bids
    if (!item.currentHighestBidderId || item.currentHighestBid === item.startingPrice) {
      // No winning bid - mark item as unsold
      await prisma.item.update({
        where: { id: itemId },
        data: { status: 'unsold' }
      });
      return res.json({ message: 'Item marked as unsold (no winning bids)' });
    }

    // Create settlement
    const settlement = await prisma.settlement.create({
      data: {
        itemId,
        sellerId: item.sellerId,
        buyerId: item.currentHighestBidderId,
        finalPrice: item.currentHighestBid,
        status: 'pending_pickup'
      },
      include: {
        item: {
          include: {
            seller: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        buyer: {
          select: { id: true, name: true, email: true }
        },
        seller: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Update item status
    await prisma.item.update({
      where: { id: itemId },
      data: { status: 'settled' }
    });

    res.status(201).json(settlement);
  } catch (error) {
    console.error('Create settlement error:', error);
    res.status(500).json({ error: 'Server error creating settlement' });
  }
};

const updateSettlementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending_pickup', 'paid', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user is the seller
    const settlement = await prisma.settlement.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true }
        }
      }
    });

    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    if (settlement.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Only seller can update settlement status' });
    }

    const updatedSettlement = await prisma.settlement.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes })
      },
      include: {
        item: true,
        buyer: {
          select: { id: true, name: true, email: true }
        },
        seller: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(updatedSettlement);
  } catch (error) {
    console.error('Update settlement error:', error);
    res.status(500).json({ error: 'Server error updating settlement' });
  }
};

const getSettlements = async (req, res) => {
  try {
    const settlements = await prisma.settlement.findMany({
      where: {
        OR: [
          { sellerId: req.user.id },
          { buyerId: req.user.id }
        ]
      },
      include: {
        item: {
          include: {
            seller: {
              select: { id: true, name: true }
            }
          }
        },
        buyer: {
          select: { id: true, name: true, email: true }
        },
        seller: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(settlements);
  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({ error: 'Server error fetching settlements' });
  }
};

const getSettlementById = async (req, res) => {
  try {
    const { id } = req.params;

    const settlement = await prisma.settlement.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            seller: {
              select: { id: true, name: true }
            }
          }
        },
        buyer: {
          select: { id: true, name: true, email: true }
        },
        seller: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    // Check if user is involved in this settlement
    if (settlement.sellerId !== req.user.id && settlement.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this settlement' });
    }

    res.json(settlement);
  } catch (error) {
    console.error('Get settlement error:', error);
    res.status(500).json({ error: 'Server error fetching settlement' });
  }
};

module.exports = {
  createSettlement,
  updateSettlementStatus,
  getSettlements,
  getSettlementById
};
