import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useSocket } from '../context/SocketContext'
import { formatPrice } from '../utils/currency'

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const socket = useSocket()

  useEffect(() => {
    fetchWatchlist()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('auctionEndingSoon', (data) => {
        setNotification(`"${data.itemTitle}" is ending in 5 minutes! Current bid: $${data.currentPrice}`)
        setTimeout(() => setNotification(null), 5000)
      })

      socket.on('auctionEnded', (data) => {
        setNotification(`"${data.itemTitle}" auction has ended!`)
        setTimeout(() => setNotification(null), 5000)
        fetchWatchlist()
      })

      return () => {
        socket.off('auctionEndingSoon')
        socket.off('auctionEnded')
      }
    }
  }, [socket])

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/watchlist')
      setWatchlist(response.data)
    } catch (error) {
      console.error('Error fetching watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (itemId) => {
    try {
      await axios.delete(`/api/watchlist/${itemId}`)
      fetchWatchlist()
    } catch (error) {
      console.error('Error removing from watchlist:', error)
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ended': return 'bg-gray-100 text-gray-800'
      case 'settled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {notification && (
        <div className="fixed top-20 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Watchlist</h1>

      {watchlist.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items in your watchlist</p>
          <Link to="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
            Browse items to add to your watchlist
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((watchlistItem) => (
            <div
              key={watchlistItem.id}
              className="bg-white rounded-lg shadow-md overflow-hidden relative"
            >
              <button
                onClick={() => removeFromWatchlist(watchlistItem.itemId)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition z-10"
                title="Remove from watchlist"
              >
                ×
              </button>
              
              <Link to={`/item/${watchlistItem.itemId}`} className="block">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(watchlistItem.item.status)}`}>
                      {watchlistItem.item.status.charAt(0).toUpperCase() + watchlistItem.item.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{watchlistItem.item.category}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{watchlistItem.item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{watchlistItem.item.description}</p>
                  
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm text-gray-500">Current Bid</p>
                      <p className="text-2xl font-bold text-indigo-600">{formatPrice(watchlistItem.item.currentHighestBid)}</p>
                    </div>
                    {watchlistItem.item.status === 'live' && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Time Left</p>
                        <p className="text-lg font-semibold text-red-600">
                          {formatTimeRemaining(watchlistItem.item.endTime)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Seller: {watchlistItem.item.seller.name}</span>
                    <span>Added: {new Date(watchlistItem.addedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Watchlist
