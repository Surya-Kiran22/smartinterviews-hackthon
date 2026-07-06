const prisma = require('../config/database');

const addToWatchlist = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    // Check if item exists
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if already in watchlist
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Item already in watchlist' });
    }

    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId,
        itemId
      },
      include: {
        item: {
          include: {
            seller: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    res.status(201).json(watchlistItem);
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Server error adding to watchlist' });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const watchlistItem = await prisma.watchlist.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId
        }
      }
    });

    if (!watchlistItem) {
      return res.status(404).json({ error: 'Item not in watchlist' });
    }

    await prisma.watchlist.delete({
      where: {
        userId_itemId: {
          userId,
          itemId
        }
      }
    });

    res.json({ message: 'Item removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Server error removing from watchlist' });
  }
};

const getWatchlist = async (req, res) => {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: {
        item: {
          include: {
            seller: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { addedAt: 'desc' }
    });

    res.json(watchlist);
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Server error fetching watchlist' });
  }
};

module.exports = { addToWatchlist, removeFromWatchlist, getWatchlist };
