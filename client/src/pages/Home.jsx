import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { formatPrice } from '../utils/currency'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [myBids, setMyBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ category: '', status: '', search: '' })

  useEffect(() => {
    fetchItems()
    if (user) {
      fetchMyBids()
    }
  }, [filter, user])

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.category) params.append('category', filter.category)
      if (filter.status) params.append('status', filter.status)
      if (filter.search) params.append('search', filter.search)

      const response = await axios.get(`/api/items?${params}`)
      setItems(response.data)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBids = async () => {
    try {
      const response = await axios.get('/api/bids/my')
      // Filter only live auctions
      const liveBids = response.data.filter(bid => bid.item.status === 'live')
      setMyBids(liveBids)
    } catch (error) {
      console.error('Error fetching my bids:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ended': return 'bg-gray-100 text-gray-800'
      case 'settled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }


  const formatTimeRemaining = (endTime) => {
    const end = new Date(endTime)
    const now = new Date()
    const diff = end - now
    
    if (diff <= 0) return 'Ended'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-10 mb-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">💎 Online Bid System</h1>
          <p className="text-xl text-blue-100 mb-6 leading-relaxed">Buy & sell items with real-time bidding. Get the best price for your products!</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/30 shadow-lg">⚡ Real-time Bidding</div>
            <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/30 shadow-lg">🔒 Secure Transactions</div>
            <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/30 shadow-lg">✅ Verified Users</div>
          </div>
        </div>
      </div>

      {/* Ongoing Bids Section */}
      {myBids.length > 0 && (
        <div className="mb-10 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-300 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">🔥</span> Your Ongoing Bids
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBids.map((bid) => (
              <Link key={bid.id} to={`/item/${bid.item.id}`} className="block">
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-amber-200">
                  <h3 className="font-bold text-gray-900 mb-3 truncate text-lg">{bid.item.title}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600 font-medium">Your Bid:</span>
                    <span className="font-bold text-indigo-600 text-lg">{formatPrice(bid.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600 font-medium">Current Highest:</span>
                    <span className="font-semibold text-gray-900 text-lg">{formatPrice(bid.item.currentHighestBid)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Status:</span>
                    {bid.isWinning ? (
                      <span className="px-3 py-1.5 text-sm font-bold rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md flex items-center">
                        <span className="mr-2">✓</span> Winning
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 text-sm font-bold rounded-xl bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md flex items-center">
                        <span className="mr-2">!</span> Outbid
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3 text-4xl">🛍️</span> Browse Items
        </h2>

        
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search items..."
            className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="books">Books</option>
            <option value="calculators">Calculators</option>
            <option value="cycles">Cycles</option>
            <option value="other">Other</option>
          </select>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="live">Live</option>
            <option value="upcoming">Upcoming</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/item/${item.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-sm text-gray-500">Current Bid</p>
                    <p className="text-2xl font-bold text-indigo-600">{formatPrice(item.currentHighestBid)}</p>
                  </div>
                  {item.status === 'live' && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Time Left</p>
                      <p className="text-lg font-semibold text-red-600">{formatTimeRemaining(item.endTime)}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Seller: {item.seller.name}</span>
                  <span>{item.condition}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
