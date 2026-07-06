import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { formatPrice } from '../utils/currency'

const SellerDashboard = () => {
  const [items, setItems] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showBids, setShowBids] = useState(false)
  const [bids, setBids] = useState([])
  const [bidStats, setBidStats] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, settlementsRes] = await Promise.all([
        axios.get('/api/items/seller'),
        axios.get('/api/settlements')
      ])
      setItems(itemsRes.data)
      setSettlements(settlementsRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewBids = async (itemId) => {
    try {
      const response = await axios.get(`/api/items/${itemId}/bids`)
      setBids(response.data.bids)
      setBidStats(response.data.statistics)
      setSelectedItem(itemId)
      setShowBids(true)
    } catch (error) {
      console.error('Error fetching bids:', error)
    }
  }

  const createSettlement = async (itemId) => {
    try {
      await axios.post(`/api/settlements/item/${itemId}`)
      fetchData()
    } catch (error) {
      console.error('Error creating settlement:', error)
    }
  }

  const updateSettlementStatus = async (settlementId, status, notes) => {
    try {
      await axios.put(`/api/settlements/${settlementId}`, { status, notes })
      fetchData()
    } catch (error) {
      console.error('Error updating settlement:', error)
    }
  }

  const formatTime = (date) => new Date(date).toLocaleString()

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

  const getSettlementStatusColor = (status) => {
    switch (status) {
      case 'pending_pickup': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <Link
          to="/create-item"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Create New Item
        </Link>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Items</h2>
        {items.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No items listed yet</p>
            <Link to="/create-item" className="text-indigo-600 hover:text-indigo-500">
              Create your first item
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Bid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ends</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(item.currentHighestBid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item._count?.bids || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(item.endTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => viewBids(item.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Bids
                      </button>
                      {item.status === 'ended' && !item.settlement && (
                        <button
                          onClick={() => createSettlement(item.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Create Settlement
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Settlements</h2>
        {settlements.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No settlements yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {settlements.map((settlement) => (
              <div key={settlement.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{settlement.item.title}</h3>
                    <p className="text-sm text-gray-500">Buyer: {settlement.buyer.name} ({settlement.buyer.email})</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getSettlementStatusColor(settlement.status)}`}>
                    {settlement.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Final Price</p>
                  <p className="text-xl font-bold text-indigo-600">{formatPrice(settlement.finalPrice)}</p>
                </div>

                {settlement.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm text-gray-700">{settlement.notes}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  {settlement.status === 'pending_pickup' && (
                    <>
                      <button
                        onClick={() => updateSettlementStatus(settlement.id, 'paid')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      >
                        Mark as Paid
                      </button>
                      <input
                        type="text"
                        placeholder="Add notes..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded"
                        onChange={(e) => updateSettlementStatus(settlement.id, 'pending_pickup', e.target.value)}
                      />
                    </>
                  )}
                  {settlement.status === 'paid' && (
                    <button
                      onClick={() => updateSettlementStatus(settlement.id, 'completed')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBids && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold">Bid History</h3>
              <button
                onClick={() => setShowBids(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {bidStats && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Bidding Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Bids</p>
                      <p className="text-xl font-bold text-indigo-600">{bidStats.totalBids}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Unique Bidders</p>
                      <p className="text-xl font-bold text-green-600">{bidStats.uniqueBidders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price Increments</p>
                      <p className="text-xl font-bold text-blue-600">{bidStats.priceIncrements}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Highest Bid</p>
                      <p className="text-xl font-bold text-purple-600">{formatPrice(bidStats.highestBid)}</p>
                    </div>
                  </div>
                </div>
              )}
              {bids.length === 0 ? (
                <p className="text-gray-500">No bids yet</p>
              ) : (
                <div className="space-y-2">
                  {bids.map((bid, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <span className="font-semibold">{bid.bidder.name}</span>
                        {bid.bidder.email && (
                          <span className="ml-2 text-sm text-gray-500">{bid.bidder.email}</span>
                        )}
                        {bid.bidder.phone && (
                          <span className="ml-2 text-sm text-gray-500">{bid.bidder.phone}</span>
                        )}
                        {bid.isWinning && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Winning</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-indigo-600">{formatPrice(bid.amount)}</span>
                        <p className="text-xs text-gray-500">{formatTime(bid.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerDashboard
