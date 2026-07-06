import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Profile = () => {
  const { user } = useAuth()
  const [userBids, setUserBids] = useState([])
  const [userItems, setUserItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const [bidsRes, itemsRes] = await Promise.all([
        axios.get('/api/bids/my'),
        axios.get('/api/items/my')
      ])
      setUserBids(bidsRes.data)
      setUserItems(itemsRes.data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-10 mb-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 flex items-center space-x-8">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-36 h-36 rounded-full border-4 border-white/40 object-cover shadow-2xl"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150?text=No+Image'
              }}
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-5xl font-bold shadow-2xl border-4 border-white/40">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">{user.name}</h1>
            <p className="text-blue-100 mb-2 text-lg">{user.email}</p>
            {user.rollNumber && (
              <p className="text-blue-100 mb-2 text-lg">🎓 Roll Number: <span className="font-semibold">{user.rollNumber.toUpperCase()}</span></p>
            )}
            {user.college && (
              <p className="text-blue-100 mb-2 text-lg">🏫 {user.college}</p>
            )}
            {user.phone && (
              <p className="text-blue-100 mb-2 text-lg">📱 {user.phone}</p>
            )}
            <div className="mt-4">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold border border-white/30 shadow-lg">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">📊</span> Your Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <span className="text-gray-700 font-medium">Total Bids Placed:</span>
              <span className="font-bold text-indigo-600 text-2xl">{userBids.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <span className="text-gray-700 font-medium">Items Listed:</span>
              <span className="font-bold text-purple-600 text-2xl">{userItems.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <span className="text-gray-700 font-medium">Winning Bids:</span>
              <span className="font-bold text-green-600 text-2xl">
                {userBids.filter(bid => bid.isWinning).length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
              <span className="text-gray-700 font-medium">Member Since:</span>
              <span className="font-bold text-gray-900 text-lg">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">🔗</span> Quick Links
          </h2>
          <div className="space-y-3">
            <a href="/bidding-history" className="block px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-300 text-indigo-700 font-semibold text-lg border border-blue-200">
              → View Bidding History
            </a>
            <a href="/seller-history" className="block px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-300 text-purple-700 font-semibold text-lg border border-purple-200">
              → View Seller History
            </a>
            <a href="/dashboard" className="block px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-300 text-green-700 font-semibold text-lg border border-green-200">
              → Go to Dashboard
            </a>
            <a href="/create-item" className="block px-5 py-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 rounded-xl transition-all duration-300 text-pink-700 font-semibold text-lg border border-pink-200">
              → Create New Item
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-3xl mr-3">📝</span> Account Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name</label>
            <p className="text-gray-900 font-bold text-lg">{user.name}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
            <p className="text-gray-900 font-bold text-lg">{user.email}</p>
          </div>
          {user.rollNumber && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Roll Number</label>
              <p className="text-gray-900 font-bold text-lg">{user.rollNumber.toUpperCase()}</p>
            </div>
          )}
          {user.phone && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Phone</label>
              <p className="text-gray-900 font-bold text-lg">{user.phone}</p>
            </div>
          )}
          {user.college && (
            <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl">
              <label className="block text-sm font-semibold text-gray-600 mb-2">College</label>
              <p className="text-gray-900 font-bold text-lg">{user.college}</p>
            </div>
          )}
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
            <label className="block text-sm font-semibold text-gray-600 mb-2">Role</label>
            <p className="text-gray-900 font-bold text-lg capitalize">{user.role}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl">
            <label className="block text-sm font-semibold text-gray-600 mb-2">Member Since</label>
            <p className="text-gray-900 font-bold text-lg">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
