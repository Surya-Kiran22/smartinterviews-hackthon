import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { formatPrice } from '../utils/currency'

const BiddingHistory = () => {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBiddingHistory()
  }, [])

  const fetchBiddingHistory = async () => {
    try {
      const response = await axios.get('/api/bids/my')
      setBids(response.data)
    } catch (error) {
      console.error('Error fetching bidding history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ended': return 'bg-gray-100 text-gray-800'
      case 'settled': return 'bg-purple-100 text-purple-800'
      case 'unsold': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (date) => new Date(date).toLocaleString()

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bidding History</h1>

      {bids.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">You haven't placed any bids yet</p>
          <Link to="/" className="text-indigo-600 hover:text-indigo-500">
            Browse items to start bidding
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Bid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Highest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bid Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Winning
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bids.map((bid) => (
                <tr key={bid.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/item/${bid.item.id}`} className="text-indigo-600 hover:text-indigo-500">
                      {bid.item.title}
                    </Link>
                    <p className="text-sm text-gray-500">{bid.item.category}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-indigo-600">{formatPrice(bid.amount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold">{formatPrice(bid.item.currentHighestBid)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(bid.item.status)}`}>
                      {bid.item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(bid.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bid.isWinning ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                        No
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default BiddingHistory
