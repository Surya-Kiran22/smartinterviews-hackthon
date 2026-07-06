import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { formatPrice } from '../utils/currency'

const CreateItem = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'books',
    condition: 'good',
    originalBuyingPrice: '',
    usageTime: '',
    startingPrice: '',
    startTime: '',
    endTime: '',
    bidIncrementMin: '1',
    antiSnipeWindowSeconds: '30',
    antiSnipeExtensionSeconds: '60',
    images: []
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const itemData = {
        ...formData,
        originalBuyingPrice: formData.originalBuyingPrice ? parseFloat(formData.originalBuyingPrice) : null,
        usageTime: formData.usageTime || null,
        startingPrice: parseFloat(formData.startingPrice),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        bidIncrementMin: parseFloat(formData.bidIncrementMin),
        antiSnipeWindowSeconds: parseInt(formData.antiSnipeWindowSeconds),
        antiSnipeExtensionSeconds: parseInt(formData.antiSnipeExtensionSeconds)
      }

      await axios.post('/api/items', itemData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create item')
    } finally {
      setLoading(false)
    }
  }

  const setDefaultTimes = () => {
    const now = new Date()
    const startTime = new Date(now.getTime() + (5 * 60 * 1000)) // 5 minutes from now
    const endTime = new Date(now.getTime() + (24 * 60 * 60 * 1000)) // 24 hours from now

    setFormData({
      ...formData,
      startTime: startTime.toISOString().slice(0, 16),
      endTime: endTime.toISOString().slice(0, 16)
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Auction Item</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Calculus Textbook 3rd Edition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe your item in detail..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="books">Books</option>
                <option value="calculators">Calculators</option>
                <option value="cycles">Cycles</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                name="condition"
                required
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Buying Price (₹)
              </label>
              <input
                type="number"
                name="originalBuyingPrice"
                min="0"
                step="0.01"
                value={formData.originalBuyingPrice}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Price when you bought it"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Duration
              </label>
              <input
                type="text"
                name="usageTime"
                value={formData.usageTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 6 months, 1 year"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Price - Your Requirement (₹) *
            </label>
            <input
              type="number"
              name="startingPrice"
              required
              min="0"
              step="0.01"
              value={formData.startingPrice}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Minimum price you want"
            />
            <p className="text-xs text-gray-500 mt-1">Buyers will bid starting from this price</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                required
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                required
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={setDefaultTimes}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Set default times (start in 5 min, end in 24 hours)
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Image URL *
            </label>
            <input
              type="url"
              name="image"
              required
              value={formData.images[0] || ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  images: e.target.value ? [e.target.value] : []
                })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/item-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Enter a direct URL to an image of your item</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Bid Increment (₹)
                </label>
                <input
                  type="number"
                  name="bidIncrementMin"
                  min="0"
                  step="0.01"
                  value={formData.bidIncrementMin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anti-Snipe Window (seconds)
                </label>
                <input
                  type="number"
                  name="antiSnipeWindowSeconds"
                  min="0"
                  value={formData.antiSnipeWindowSeconds}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anti-Snipe Extension (seconds)
                </label>
                <input
                  type="number"
                  name="antiSnipeExtensionSeconds"
                  min="0"
                  value={formData.antiSnipeExtensionSeconds}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateItem
