import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ItemDetail from './pages/ItemDetail'
import Watchlist from './pages/Watchlist'
import SellerDashboard from './pages/SellerDashboard'
import CreateItem from './pages/CreateItem'
import BiddingHistory from './pages/BiddingHistory'
import SellerHistory from './pages/SellerHistory'
import Profile from './pages/Profile'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }
  
  if (user) {
    return <Navigate to="/" />
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/item/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
              <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
              <Route path="/create-item" element={<ProtectedRoute><CreateItem /></ProtectedRoute>} />
              <Route path="/bidding-history" element={<ProtectedRoute><BiddingHistory /></ProtectedRoute>} />
              <Route path="/seller-history" element={<ProtectedRoute><SellerHistory /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
