import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/currency'

const ItemDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const socket = useSocket()
  const { user } = useAuth()
  
  const [item, setItem] = useState(null)
  const [bids, setBids] = useState([])
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    fetchItem()
    
    return () => {
      if (socket) {
        socket.emit('leaveItemRoom', id)
      }
    }
  }, [id, socket])

  useEffect(() => {
    if (socket && item) {
      socket.emit('joinItemRoom', id)

      socket.on('newBid', (data) => {
        setBids(prev => [data, ...prev].slice(0, 20))
        setItem(prev => ({
          ...prev,
          currentHighestBid: data.amount,
          currentHighestBidderId: data.bidderId
        }))
        setTimeRemaining(data.timeRemaining)
      })

      socket.on('timerExtended', (data) => {
        setNotification(`Timer extended! New end time: ${new Date(data.newEndTime).toLocaleTimeString()}`)
        setTimeout(() => setNotification(null), 5000)
        setTimeRemaining(data.timeRemaining)
        setItem(prev => ({ ...prev, endTime: data.newEndTime }))
      })

      socket.on('auctionEnded', (data) => {
        setNotification(`Auction ended! Final price: $${data.finalPrice}`)
        setTimeout(() => setNotification(null), 5000)
        setItem(prev => ({ ...prev, status: 'ended' }))
        fetchItem()
      })

      socket.on('outbid', (data) => {
        setNotification(`You've been outbid on "${data.itemTitle}"! New bid: $${data.newAmount}`)
        setTimeout(() => setNotification(null), 5000)
      })

      return () => {
        socket.off('newBid')
        socket.off('timerExtended')
        socket.off('auctionEnded')
        socket.off('outbid')
      }
    }
  }, [socket, item, id])

  useEffect(() => {
    const interval = setInterval(() => {
      if (item && item.status === 'live') {
        const now = new Date()
        const end = new Date(item.endTime)
        const diff = end - now
        setTimeRemaining(Math.max(0, diff))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [item])

  const fetchItem = async () => {
    try {
      const response = await axios.get(`/api/items/${id}`)
      setItem(response.data)
      setBids(response.data.bids || [])
      
      const now = new Date()
      const end = new Date(response.data.endTime)
      setTimeRemaining(Math.max(0, end - now))
    } catch (error) {
      console.error('Error fetching item:', error)
      setError('Failed to load item')
    } finally {
      setLoading(false)
    }
  }

  const handleBid = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const amount = parseFloat(bidAmount)
      await axios.post(`/api/items/${id}/bid`, { amount })
      setBidAmount('')
      fetchItem()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place bid')
    }
  }

  const formatTime = (ms) => {
    if (ms <= 0) return 'Ended'
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  const addToWatchlist = async () => {
    try {
      await axios.post(`/api/watchlist/${id}`)
      setNotification('Added to watchlist!')
      setTimeout(() => setNotification(null), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add to watchlist')
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!item) {
    return <div className="flex justify-center items-center h-screen">Item not found</div>
  }

  const minBid = item.currentHighestBid + item.bidIncrementMin
  const isSeller = user?.id === item.sellerId

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {notification && (
        <div className="fixed top-20 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
              <span className={`px-3 py-1 text-sm font-semibold rounded ${
                item.status === 'live' ? 'bg-green-100 text-green-800' :
                item.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{item.description}</p>

            <div className="flex flex-wrap gap-4 mb-4">
              <span className="text-sm text-gray-500">
                <span className="font-semibold">Category:</span> {item.category}
              </span>
              <span className="text-sm text-gray-500">
                <span className="font-semibold">Condition:</span> {item.condition}
              </span>
              <span className="text-sm text-gray-500">
                <span className="font-semibold">Seller:</span> {item.seller.name}
              </span>
            </div>

            {item.images && item.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {item.images.map((image, index) => (
                  <img key={index} src={image} alt={item.title} className="rounded-lg" />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bid History</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {bids.length === 0 ? (
                <p className="text-gray-500">No bids yet</p>
              ) : (
                bids.map((bid, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="font-semibold">{bid.bidder?.name || 'Unknown User'}</span>
                      {bid.isWinning && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Winning</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-indigo-600">{formatPrice(bid.amount)}</span>
                      <p className="text-xs text-gray-500">{new Date(bid.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Current Highest Bid</p>
              <p className="text-4xl font-bold text-indigo-600">{formatPrice(item.currentHighestBid)}</p>
            </div>

            {item.status === 'live' && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Time Remaining</p>
                <p className="text-2xl font-bold text-red-600">{formatTime(timeRemaining)}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Starting Price</p>
              <p className="text-xl font-semibold">{formatPrice(item.startingPrice)}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Minimum Next Bid</p>
              <p className="text-xl font-semibold">{formatPrice(minBid)}</p>
            </div>

            {item.status === 'live' && !isSeller && (
              <form onSubmit={handleBid} className="mb-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Bid
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={minBid}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Minimum ${formatPrice(minBid)}`}
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
                >
                  Place Bid
                </button>
              </form>
            )}

            {!isSeller && (
              <button
                onClick={addToWatchlist}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition mb-4"
              >
                Add to Watchlist
              </button>
            )}

            {isSeller && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                You are the seller of this item
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-2">Auction Details</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Start: {new Date(item.startTime).toLocaleString()}</p>
                <p>End: {new Date(item.endTime).toLocaleString()}</p>
                <p>Bid Increment: ${item.bidIncrementMin}</p>
                <p>Anti-Snipe: {item.antiSnipeWindowSeconds}s window, +{item.antiSnipeExtensionSeconds}s extension</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetail
