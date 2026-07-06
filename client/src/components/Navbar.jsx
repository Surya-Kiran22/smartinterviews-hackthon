import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const Navbar = () => {
  const { user, accounts, logout, switchToAccount } = useAuth()
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <Link to="/" className="text-3xl font-bold flex items-center tracking-tight">
              <span className="text-4xl mr-2">💎</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Online Bid System
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link to="/" className="px-4 py-2.5 rounded-xl hover:bg-white/15 transition-all duration-300 text-sm font-medium backdrop-blur-sm">
                  🏠 Browse
                </Link>
                <Link to="/watchlist" className="px-4 py-2.5 rounded-xl hover:bg-white/15 transition-all duration-300 text-sm font-medium backdrop-blur-sm">
                  ⭐ Watchlist
                </Link>
                <Link to="/bidding-history" className="px-4 py-2.5 rounded-xl hover:bg-white/15 transition-all duration-300 text-sm font-medium backdrop-blur-sm">
                  📊 My Bids
                </Link>
                <Link to="/seller-history" className="px-4 py-2.5 rounded-xl hover:bg-white/15 transition-all duration-300 text-sm font-medium backdrop-blur-sm">
                  💰 My Sales
                </Link>
                <Link to="/dashboard" className="px-4 py-2.5 rounded-xl hover:bg-white/15 transition-all duration-300 text-sm font-medium backdrop-blur-sm">
                  📋 Dashboard
                </Link>
                <Link to="/create-item" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-5 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  ➕ Sell Item
                </Link>
                <div className="w-px h-8 bg-white/30 mx-3"></div>
                
                {/* Account Switcher */}
                <div className="relative">
                  <Link
                    to="/profile"
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                  >
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full border-3 border-white/40 shadow-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-lg font-bold shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold">{user.name}</span>
                    {accounts.length > 1 && (
                      <span className="text-xs bg-pink-500 px-2.5 py-1 rounded-full font-bold shadow-md">{accounts.length}</span>
                    )}
                  </Link>

                  {showAccountMenu && (
                    <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-3 z-50 border border-white/20">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Switch Account</p>
                      </div>
                      {accounts.map((account) => (
                        <button
                          key={account.user.id}
                          onClick={() => {
                            switchToAccount(account.user.id)
                            setShowAccountMenu(false)
                          }}
                          className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 ${
                            account.user.id === user.id ? 'bg-gradient-to-r from-blue-50 to-purple-50' : ''
                          }`}
                        >
                          {account.user.profilePicture ? (
                            <img src={account.user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-md" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-lg font-bold text-white shadow-md">
                              {account.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="text-left flex-1">
                            <p className="text-sm font-semibold text-gray-900">{account.user.name}</p>
                            <p className="text-xs text-gray-500">{account.user.email}</p>
                          </div>
                          {account.user.id === user.id && (
                            <span className="text-green-500 text-lg">✓</span>
                          )}
                        </button>
                      ))}
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <Link
                          to="/login"
                          onClick={() => setShowAccountMenu(false)}
                          className="block px-4 py-3 text-sm text-indigo-600 hover:bg-indigo-50 transition-all duration-300 font-medium"
                        >
                          + Add Account
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setShowAccountMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-all duration-300 font-medium"
                        >
                          Log Out All Accounts
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2.5 rounded-xl hover:bg-white/15 transition-all duration-300 text-sm font-medium backdrop-blur-sm">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-5 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Register Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
