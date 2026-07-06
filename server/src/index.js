require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const prisma = require('./config/database');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const bidRoutes = require('./routes/bids');
const { placeBid, getMyBids } = require('./controllers/bidController');
const watchlistRoutes = require('./routes/watchlist');
const settlementRoutes = require('./routes/settlements');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// Custom bid route with Socket.io
app.post('/api/items/:id/bid', require('./middleware/auth'), require('./utils/rateLimiter').bidLimiter, (req, res) => {
  placeBid(req, res, io);
});

app.get('/api/bids/my', require('./middleware/auth'), getMyBids);

app.use('/api/watchlist', watchlistRoutes);
app.use('/api/settlements', settlementRoutes);

// Server time endpoint for client sync
app.get('/api/time', (req, res) => {
  res.json({ serverTime: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user-specific room for notifications
  socket.on('joinUserRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Join item room for live bidding
  socket.on('joinItemRoom', (itemId) => {
    socket.join(itemId);
    console.log(`User joined item room: ${itemId}`);
  });

  // Leave item room
  socket.on('leaveItemRoom', (itemId) => {
    socket.leave(itemId);
    console.log(`User left item room: ${itemId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Background job to check for ended auctions and update status
const checkAuctionEnds = async () => {
  try {
    const now = new Date();
    
    // Find live auctions that have ended
    const endedAuctions = await prisma.item.findMany({
      where: {
        status: 'live',
        endTime: {
          lte: now
        }
      },
      include: {
        seller: {
          select: { id: true, name: true }
        }
      }
    });

    for (const item of endedAuctions) {
      // Update item status to ended
      await prisma.item.update({
        where: { id: item.id },
        data: { status: 'ended' }
      });

      // Emit auction ended event to item room
      io.to(item.id).emit('auctionEnded', {
        itemId: item.id,
        itemTitle: item.title,
        finalPrice: item.currentHighestBid,
        winningBidderId: item.currentHighestBidderId,
        endedAt: now
      });

      // Notify winning bidder if there is one
      if (item.currentHighestBidderId) {
        io.to(item.currentHighestBidderId).emit('auctionWon', {
          itemId: item.id,
          itemTitle: item.title,
          finalPrice: item.currentHighestBid,
          sellerName: item.seller.name
        });

        // Send buyer details to seller
        const winningBid = await prisma.bid.findFirst({
          where: {
            itemId: item.id,
            bidderId: item.currentHighestBidderId,
            isWinning: true
          },
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                college: true
              }
            }
          }
        });

        if (winningBid) {
          io.to(item.sellerId).emit('auctionSold', {
            itemId: item.id,
            itemTitle: item.title,
            finalPrice: item.currentHighestBid,
            buyerDetails: {
              name: winningBid.bidder.name,
              email: winningBid.bidder.email,
              phone: winningBid.bidder.phone,
              college: winningBid.bidder.college
            },
            endedAt: now
          });
        }
      } else {
        // No bids - notify seller that item was not sold
        io.to(item.sellerId).emit('auctionUnsold', {
          itemId: item.id,
          itemTitle: item.title,
          endedAt: now
        });
      }

      console.log(`Auction ended: ${item.title}`);
    }
  } catch (error) {
    console.error('Error checking auction ends:', error);
  }
};

// Run auction end check every 5 seconds
setInterval(checkAuctionEnds, 5000);

// Background job to start upcoming auctions
const startUpcomingAuctions = async () => {
  try {
    const now = new Date();
    
    // Find upcoming auctions that should start
    const upcomingAuctions = await prisma.item.findMany({
      where: {
        status: 'upcoming',
        startTime: {
          lte: now
        },
        endTime: {
          gt: now
        }
      }
    });

    for (const item of upcomingAuctions) {
      await prisma.item.update({
        where: { id: item.id },
        data: { status: 'live' }
      });

      io.to(item.id).emit('auctionStarted', {
        itemId: item.id,
        itemTitle: item.title,
        startTime: item.startTime,
        endTime: item.endTime
      });

      console.log(`Auction started: ${item.title}`);
    }
  } catch (error) {
    console.error('Error starting auctions:', error);
  }
};

// Run auction start check every 5 seconds
setInterval(startUpcomingAuctions, 5000);

// Background job for watchlist notifications (5 min warning)
const checkWatchlistWarnings = async () => {
  try {
    const now = new Date();
    const warningTime = new Date(now.getTime() + (5 * 60 * 1000)); // 5 minutes from now

    // Find items ending in 5 minutes
    const endingSoon = await prisma.item.findMany({
      where: {
        status: 'live',
        endTime: {
          lte: warningTime,
          gt: now
        }
      },
      include: {
        watchlist: {
          include: {
            user: {
              select: { id: true }
            }
          }
        }
      }
    });

    for (const item of endingSoon) {
      for (const watchlistItem of item.watchlist) {
        io.to(watchlistItem.user.id).emit('auctionEndingSoon', {
          itemId: item.id,
          itemTitle: item.title,
          endTime: item.endTime,
          currentPrice: item.currentHighestBid
        });
      }
    }
  } catch (error) {
    console.error('Error checking watchlist warnings:', error);
  }
};

// Run watchlist warning check every minute
setInterval(checkWatchlistWarnings, 60000);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
