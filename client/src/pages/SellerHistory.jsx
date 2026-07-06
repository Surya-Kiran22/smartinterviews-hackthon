import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { formatPrice } from '../utils/currency'

const SellerHistory = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, live, ended, unsold, settled

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items/seller')
      setItems(response.data)
    } catch (error) {
      console.error('Error fetching seller items:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ended': return 'bg-yellow-100 text-yellow-800'
      case 'settled': return 'bg-purple-100 text-purple-800'
      case 'unsold': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (date) => new Date(date).toLocaleString()

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })

  // Calculate statistics
  const totalItems = items.length
  const soldItems = items.filter(i => i.status === 'settled').length
  const unsoldItems = items.filter(i => i.status === 'unsold').length
  const liveItems = items.filter(i => i.status === 'live').length
  const totalRevenue = items
    .filter(i => i.status === 'settled' && i.currentHighestBid > 0)
    .reduce((sum, i) => sum + i.currentHighestBid, 0)

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Seller Product History</h1>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-3xl font-bold text-indigo-600">{totalItems}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Sold Items</p>
          <p className="text-3xl font-bold text-green-600">{soldItems}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Unsold Items</p>
          <p className="text-3xl font-bold text-red-600">{unsoldItems}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Live Auctions</p>
          <p className="text-3xl font-bold text-blue-600">{liveItems}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-purple-600">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md transition ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('live')}
            className={`px-4 py-2 rounded-md transition ${filter === 'live' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Live
          </button>
          <button
            onClick={() => setFilter('ended')}
            className={`px-4 py-2 rounded-md transition ${filter === 'ended' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Ended
          </button>
          <button
            onClick={() => setFilter('settled')}
            className={`px-4 py-2 rounded-md transition ${filter === 'settled' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Sold
          </button>
          <button
            onClick={() => setFilter('unsold')}
            className={`px-4 py-2 rounded-md transition ${filter === 'unsold' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Unsold
          </button>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No items found</p>
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Starting Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bids
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/item/${item.id}`} className="text-indigo-600 hover:text-indigo-500 font-medium">
                      {item.title}
                    </Link>
                    {item.usageTime && (
                      <p className="text-xs text-gray-500">Used: {item.usageTime}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.originalBuyingPrice ? formatPrice(item.originalBuyingPrice) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    {formatPrice(item.startingPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                    {item.currentHighestBid > 0 ? formatPrice(item.currentHighestBid) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item._count?.bids || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(item.createdAt)}
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

export default SellerHistory
