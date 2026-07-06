const prisma = require('../config/database');

const placeBid = async (req, res, io) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const bidderId = req.user.id;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Please provide a valid bid amount' });
    }

    // Get item with current state
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, name: true }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if item is live
    if (item.status !== 'live') {
      return res.status(400).json({ error: 'Item is not currently live for bidding' });
    }

    // Check if bidder is the seller
    if (item.sellerId === bidderId) {
      return res.status(403).json({ error: 'Sellers cannot bid on their own items' });
    }

    // Check if bid meets minimum increment
    const minBid = item.currentHighestBid + item.bidIncrementMin;
    if (amount < minBid) {
      return res.status(400).json({ 
        error: `Bid must be at least ${minBid} (current highest: ${item.currentHighestBid} + increment: ${item.bidIncrementMin})` 
      });
    }

    // Check if auction has ended (server time)
    const now = new Date();
    if (now >= new Date(item.endTime)) {
      return res.status(400).json({ error: 'Auction has ended' });
    }

    // Anti-sniping check
    const timeRemaining = new Date(item.endTime) - now;
    const isSnipe = timeRemaining <= (item.antiSnipeWindowSeconds * 1000);
    let newEndTime = item.endTime;

    if (isSnipe) {
      // Extend the auction
      newEndTime = new Date(now.getTime() + (item.antiSnipeExtensionSeconds * 1000));
    }

    // Use atomic update to handle race conditions
    // Update item and create bid in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Re-check item state in transaction
      const freshItem = await tx.item.findUnique({
        where: { id }
      });

      if (freshItem.currentHighestBid !== item.currentHighestBid) {
        throw new Error('Bid race condition: item was updated');
      }

      // Update previous winning bid
      if (freshItem.currentHighestBidderId) {
        await tx.bid.updateMany({
          where: {
            itemId: id,
            bidderId: freshItem.currentHighestBidderId,
            isWinning: true
          },
          data: { isWinning: false }
        });
      }

      // Create new bid
      const bid = await tx.bid.create({
        data: {
          itemId: id,
          bidderId,
          amount,
          isWinning: true
        },
        include: {
          bidder: {
            select: { id: true, name: true }
          }
        }
      });

      // Update item
      const updatedItem = await tx.item.update({
        where: { id },
        data: {
          currentHighestBid: amount,
          currentHighestBidderId: bidderId,
          endTime: newEndTime
        },
        include: {
          seller: {
            select: { id: true, name: true }
          }
        }
      });

      return { bid, updatedItem };
    });

    // Emit socket events
    const timeRemainingMs = new Date(result.updatedItem.endTime) - now;
    
    // Broadcast new bid to item room
    io.to(id).emit('newBid', {
      amount: result.bid.amount,
      bidderName: result.bid.bidder.name,
      timestamp: result.bid.timestamp,
      timeRemaining: Math.max(0, timeRemainingMs)
    });

    // Notify outbid user if there was a previous highest bidder
    if (item.currentHighestBidderId && item.currentHighestBidderId !== bidderId) {
      io.to(item.currentHighestBidderId).emit('outbid', {
        itemTitle: item.title,
        newAmount: result.bid.amount,
        itemId: id
      });
    }

    // If anti-sniping triggered, broadcast timer extension
    if (isSnipe) {
      io.to(id).emit('timerExtended', {
        newEndTime: result.updatedItem.endTime,
        timeRemaining: Math.max(0, timeRemainingMs)
      });
    }

    res.json({
      bid: result.bid,
      item: result.updatedItem,
      wasExtended: isSnipe
    });
  } catch (error) {
    console.error('Place bid error:', error);
    if (error.message === 'Bid race condition: item was updated') {
      return res.status(409).json({ error: 'Another bid was placed simultaneously. Please try again.' });
    }
    res.status(500).json({ error: 'Server error placing bid' });
  }
};

const getMyBids = async (req, res) => {
  try {
    const bids = await prisma.bid.findMany({
      where: { bidderId: req.user.id },
      include: {
        item: {
          include: {
            seller: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json(bids);
  } catch (error) {
    console.error('Get my bids error:', error);
    res.status(500).json({ error: 'Server error fetching bids' });
  }
};

module.exports = { placeBid, getMyBids };
