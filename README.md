# CampusBid - Real-Time Student Auction Marketplace

A full-stack real-time auction platform where students can sell used books, calculators, and cycles at semester end, with live bidding functionality.

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Socket.io** for real-time communication
- **Prisma ORM** with MongoDB
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React.js** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.io-client** for real-time updates
- **Axios** for API calls

## Features

### Core Features
- **User Authentication**: JWT-based auth with email/password
- **Live Bidding**: Real-time bidding with Socket.io rooms
- **Server-Authoritative Timer**: Countdown synced with server time
- **Anti-Sniping**: Automatic timer extension for last-minute bids
- **Watchlist**: Save items and get notifications
- **Seller Dashboard**: Manage items, view bids, handle settlements
- **Settlement Flow**: Track payment and pickup status

### Real-Time Features
- Instant bid propagation to all viewers
- Outbid notifications
- Auction end notifications
- Watchlist ending soon alerts
- Timer extension broadcasts

## Project Structure

```
campusbid/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Prisma client
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── itemController.js
│   │   │   ├── bidController.js
│   │   │   ├── watchlistController.js
│   │   │   └── settlementController.js
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── items.js
│   │   │   ├── bids.js
│   │   │   ├── watchlist.js
│   │   │   └── settlements.js
│   │   ├── utils/
│   │   │   └── rateLimiter.js    # Rate limiting
│   │   ├── index.js              # Server entry point
│   │   └── seed.js               # Database seed script
│   ├── prisma/
│   │   └── schema.prisma         # Prisma schema
│   ├── .env                      # Environment variables
│   └── package.json
└── client/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── SocketContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Home.jsx
    │   │   ├── ItemDetail.jsx
    │   │   ├── Watchlist.jsx
    │   │   ├── SellerDashboard.jsx
    │   │   └── CreateItem.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd campusbid
```

### 2. Backend Setup

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Configure environment variables in `.env`:
```env
DATABASE_URL="mongodb+srv://your-username:your-password@cluster0.vyreenm.mongodb.net/surya?"
JWT_SECRET="your_jwt_secret_key_change_this_in_production"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

Generate Prisma client:
```bash
npx prisma generate
```

Push schema to database:
```bash
npx prisma db push
```

Run seed script (optional, creates sample data):
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup

Navigate to the client directory:
```bash
cd ../client
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Sample Users (after running seed)

The seed script creates the following test users (password: `password123`):

**Sellers:**
- seller1@campus.edu (Alice Johnson)
- seller2@campus.edu (Bob Smith)

**Buyers:**
- buyer1@campus.edu (Charlie Brown)
- buyer2@campus.edu (Diana Prince)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item (auth required)
- `PUT /api/items/:id` - Update item (auth required)
- `DELETE /api/items/:id` - Delete item (auth required)
- `GET /api/items/seller` - Get seller's items (auth required)
- `GET /api/items/:id/bids` - Get item bid history

### Bids
- `POST /api/items/:id/bid` - Place a bid (auth required)
- `GET /api/bids/my` - Get user's bids (auth required)

### Watchlist
- `GET /api/watchlist` - Get user's watchlist (auth required)
- `POST /api/watchlist/:itemId` - Add to watchlist (auth required)
- `DELETE /api/watchlist/:itemId` - Remove from watchlist (auth required)

### Settlements
- `GET /api/settlements` - Get user's settlements (auth required)
- `GET /api/settlements/:id` - Get settlement by ID (auth required)
- `POST /api/settlements/item/:itemId` - Create settlement (auth required)
- `PUT /api/settlements/:id` - Update settlement status (auth required)

### Server Time
- `GET /api/time` - Get server time for client sync

## Socket.io Events

### Client → Server
- `joinUserRoom` - Join user-specific notification room
- `joinItemRoom` - Join item bidding room
- `leaveItemRoom` - Leave item bidding room

### Server → Client
- `newBid` - New bid placed (amount, bidderName, timestamp, timeRemaining)
- `timerExtended` - Auction timer extended due to anti-sniping
- `auctionEnded` - Auction has ended
- `auctionWon` - User won an auction
- `outbid` - User has been outbid
- `auctionEndingSoon` - Watched item ending in 5 minutes
- `auctionStarted` - Auction has started (upcoming → live)

## Anti-Sniping Feature

The anti-sniping feature prevents last-second bidding by extending the auction timer when a bid is placed within the anti-snipe window.

**How it works:**
1. Default anti-snipe window: 30 seconds before end time
2. Default extension: 60 seconds
3. If a bid is placed within 30 seconds of end time, timer extends by 60 seconds
4. This can happen multiple times if bids continue in the extension window

**Testing anti-sniping:**
1. Create an item with end time in the near future
2. Place a bid within 30 seconds of the end time
3. Observe the timer extending by 60 seconds
4. The extension is broadcast to all viewers via Socket.io

## Data Models

### User
- id, name, email, password (hashed), role, createdAt

### Item
- id, title, description, category, images[], condition
- sellerId, startingPrice, currentHighestBid, currentHighestBidderId
- startTime, endTime, status
- bidIncrementMin, antiSnipeWindowSeconds, antiSnipeExtensionSeconds

### Bid
- id, itemId, bidderId, amount, timestamp, isWinning

### Watchlist
- id, userId, itemId, addedAt

### Settlement
- id, itemId, sellerId, buyerId, finalPrice, status, notes

## Security Features

- JWT authentication for protected routes
- Password hashing with bcryptjs
- Rate limiting on authentication endpoints
- Rate limiting on bid endpoints (10 bids per minute per item)
- Server-side bid validation
- Race condition handling with database transactions
- Input sanitization

## Development

### Running in Development Mode

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
```

**Backend:**
```bash
cd server
npm start
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure your MongoDB Atlas IP whitelist includes your IP address
- Verify the DATABASE_URL in `.env` is correct
- Check that the database name in the connection string matches

### Socket.io Connection Issues
- Ensure both server and client are running
- Check that CORS is properly configured in server
- Verify the socket URL in SocketContext.jsx

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync schema with database
- Check that Prisma schema provider is set to "mongodb"

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
