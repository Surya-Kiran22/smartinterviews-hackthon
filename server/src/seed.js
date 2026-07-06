require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./config/database');

const seed = async () => {
  try {
    console.log('Starting seed...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const seller1 = await prisma.user.upsert({
      where: { email: 'seller1@campus.edu' },
      update: {},
      create: {
        name: 'Alice Johnson',
        email: 'seller1@campus.edu',
        password: hashedPassword,
        role: 'seller'
      }
    });

    const seller2 = await prisma.user.upsert({
      where: { email: 'seller2@campus.edu' },
      update: {},
      create: {
        name: 'Bob Smith',
        email: 'seller2@campus.edu',
        password: hashedPassword,
        role: 'seller'
      }
    });

    const buyer1 = await prisma.user.upsert({
      where: { email: 'buyer1@campus.edu' },
      update: {},
      create: {
        name: 'Charlie Brown',
        email: 'buyer1@campus.edu',
        password: hashedPassword,
        role: 'buyer'
      }
    });

    const buyer2 = await prisma.user.upsert({
      where: { email: 'buyer2@campus.edu' },
      update: {},
      create: {
        name: 'Diana Prince',
        email: 'buyer2@campus.edu',
        password: hashedPassword,
        role: 'buyer'
      }
    });

    console.log('Users created');

    // Calculate times for auctions
    const now = new Date();
    const liveStart = new Date(now.getTime() - (30 * 60 * 1000)); // Started 30 min ago
    const liveEnd = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // Ends in 2 hours
    
    const upcomingStart = new Date(now.getTime() + (30 * 60 * 1000)); // Starts in 30 min
    const upcomingEnd = new Date(now.getTime() + (25 * 60 * 60 * 1000)); // Ends in 25 hours

    // Create sample items
    const items = await Promise.all([
      // Live auction - Book
      prisma.item.upsert({
        where: { id: 'book-1' },
        update: {},
        create: {
          id: 'book-1',
          title: 'Calculus: Early Transcendentals 8th Edition',
          description: 'Excellent condition calculus textbook. No highlighting or notes. Perfect for engineering students.',
          category: 'books',
          images: [],
          condition: 'like-new',
          sellerId: seller1.id,
          startingPrice: 50,
          currentHighestBid: 65,
          currentHighestBidderId: buyer1.id,
          startTime: liveStart,
          endTime: liveEnd,
          status: 'live',
          bidIncrementMin: 5,
          antiSnipeWindowSeconds: 30,
          antiSnipeExtensionSeconds: 60
        }
      }),

      // Live auction - Calculator
      prisma.item.upsert({
        where: { id: 'calc-1' },
        update: {},
        create: {
          id: 'calc-1',
          title: 'TI-84 Plus Graphing Calculator',
          description: 'Texas Instruments TI-84 Plus in good working condition. Includes original case and USB cable.',
          category: 'calculators',
          images: [],
          condition: 'good',
          sellerId: seller2.id,
          startingPrice: 40,
          currentHighestBid: 45,
          currentHighestBidderId: buyer2.id,
          startTime: liveStart,
          endTime: liveEnd,
          status: 'live',
          bidIncrementMin: 2,
          antiSnipeWindowSeconds: 30,
          antiSnipeExtensionSeconds: 60
        }
      }),

      // Live auction - Cycle
      prisma.item.upsert({
        where: { id: 'cycle-1' },
        update: {},
        create: {
          id: 'cycle-1',
          title: 'Mountain Bike - 26 inch wheels',
          description: 'Reliable mountain bike for campus commuting. Recently tuned up with new brakes. Minor scratches but rides great.',
          category: 'cycles',
          images: [],
          condition: 'good',
          sellerId: seller1.id,
          startingPrice: 80,
          currentHighestBid: 80,
          currentHighestBidderId: null,
          startTime: liveStart,
          endTime: liveEnd,
          status: 'live',
          bidIncrementMin: 5,
          antiSnipeWindowSeconds: 30,
          antiSnipeExtensionSeconds: 60
        }
      }),

      // Upcoming auction - Book
      prisma.item.upsert({
        where: { id: 'book-2' },
        update: {},
        create: {
          id: 'book-2',
          title: 'Introduction to Algorithms (CLRS)',
          description: 'Classic algorithms textbook. Some wear on cover but pages are clean. Great reference book.',
          category: 'books',
          images: [],
          condition: 'good',
          sellerId: seller2.id,
          startingPrice: 35,
          currentHighestBid: 35,
          currentHighestBidderId: null,
          startTime: upcomingStart,
          endTime: upcomingEnd,
          status: 'upcoming',
          bidIncrementMin: 3,
          antiSnipeWindowSeconds: 30,
          antiSnipeExtensionSeconds: 60
        }
      }),

      // Upcoming auction - Calculator
      prisma.item.upsert({
        where: { id: 'calc-2' },
        update: {},
        create: {
          id: 'calc-2',
          title: 'Casio FX-991EX Scientific Calculator',
          description: 'Brand new scientific calculator. Still in original packaging. Perfect for math and science courses.',
          category: 'calculators',
          images: [],
          condition: 'new',
          sellerId: seller1.id,
          startingPrice: 15,
          currentHighestBid: 15,
          currentHighestBidderId: null,
          startTime: upcomingStart,
          endTime: upcomingEnd,
          status: 'upcoming',
          bidIncrementMin: 1,
          antiSnipeWindowSeconds: 30,
          antiSnipeExtensionSeconds: 60
        }
      }),

      // Upcoming auction - Cycle
      prisma.item.upsert({
        where: { id: 'cycle-2' },
        update: {},
        create: {
          id: 'cycle-2',
          title: 'Road Bike - 700c wheels',
          description: 'Lightweight road bike for longer commutes. Carbon fork, aluminum frame. Includes water bottle holder.',
          category: 'cycles',
          images: [],
          condition: 'like-new',
          sellerId: seller2.id,
          startingPrice: 150,
          currentHighestBid: 150,
          currentHighestBidderId: null,
          startTime: upcomingStart,
          endTime: upcomingEnd,
          status: 'upcoming',
          bidIncrementMin: 10,
          antiSnipeWindowSeconds: 30,
          antiSnipeExtensionSeconds: 60
        }
      }),

      // Ended auction - Book
      prisma.item.upsert({
        where: { id: 'book-3' },
        update: {},
        create: {
          id: 'book-3',
          title: 'Physics for Scientists and Engineers',
          description: 'Physics textbook with some highlighting. Still very readable and useful.',
          category: 'books',
          images: [],
          condition: 'fair',
          sellerId: seller1.id,
          startingPrice: 30,
          currentHighestBid: 42,
          currentHighestBidderId: buyer2.id,
          startTime: new Date(now.getTime() - (5 * 60 * 60 * 1000)),
          endTime: new Date(now.getTime() - (30 * 60 * 1000)),
          status: 'ended',
          bidIncrementMin: 2,
          antiSnipeWindowSeconds: 30,
          antiSnipeExtensionSeconds: 60
        }
      })
    ]);

    console.log('Items created');

    // Create sample bids for live items
    await prisma.bid.createMany({
      data: [
        {
          id: 'bid-1',
          itemId: 'book-1',
          bidderId: buyer1.id,
          amount: 55,
          timestamp: new Date(now.getTime() - (25 * 60 * 1000)),
          isWinning: false
        },
        {
          id: 'bid-2',
          itemId: 'book-1',
          bidderId: buyer2.id,
          amount: 60,
          timestamp: new Date(now.getTime() - (20 * 60 * 1000)),
          isWinning: false
        },
        {
          id: 'bid-3',
          itemId: 'book-1',
          bidderId: buyer1.id,
          amount: 65,
          timestamp: new Date(now.getTime() - (15 * 60 * 1000)),
          isWinning: true
        },
        {
          id: 'bid-4',
          itemId: 'calc-1',
          bidderId: buyer2.id,
          amount: 45,
          timestamp: new Date(now.getTime() - (10 * 60 * 1000)),
          isWinning: true
        }
      ],
      skipDuplicates: true
    });

    console.log('Bids created');

    // Create sample watchlist entries
    await prisma.watchlist.createMany({
      data: [
        {
          userId: buyer1.id,
          itemId: 'calc-1'
        },
        {
          userId: buyer2.id,
          itemId: 'book-1'
        },
        {
          userId: buyer1.id,
          itemId: 'cycle-2'
        }
      ],
      skipDuplicates: true
    });

    console.log('Watchlist entries created');

    console.log('Seed completed successfully!');
    console.log('\nSample users:');
    console.log('Seller 1: seller1@campus.edu / password123');
    console.log('Seller 2: seller2@campus.edu / password123');
    console.log('Buyer 1: buyer1@campus.edu / password123');
    console.log('Buyer 2: buyer2@campus.edu / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
