import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const ACCOUNTS_KEY = 'campusbid_accounts'
const ACTIVE_ACCOUNT_KEY = 'campusbid_active_account'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = () => {
    try {
      const storedAccounts = localStorage.getItem(ACCOUNTS_KEY)
      const activeAccountId = localStorage.getItem(ACTIVE_ACCOUNT_KEY)
      
      if (storedAccounts) {
        const parsedAccounts = JSON.parse(storedAccounts)
        setAccounts(parsedAccounts)
        
        if (activeAccountId && parsedAccounts.length > 0) {
          const activeAccount = parsedAccounts.find(acc => acc.user.id === activeAccountId)
          if (activeAccount) {
            switchAccount(activeAccount)
          } else if (parsedAccounts.length > 0) {
            switchAccount(parsedAccounts[0])
          }
        } else if (parsedAccounts.length > 0) {
          switchAccount(parsedAccounts[0])
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error loading accounts:', error)
      setLoading(false)
    }
  }

  const saveAccounts = (updatedAccounts) => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
    setAccounts(updatedAccounts)
  }

  const switchAccount = (account) => {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, account.user.id)
    localStorage.setItem('token', account.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${account.token}`
    setUser(account.user)
  }

  const login = async (email, password, addToExisting = false) => {
    const response = await axios.post('/api/auth/login', { email, password })
    const newAccount = {
      token: response.data.token,
      user: response.data.user
    }

    if (addToExisting && accounts.length > 0) {
      const updatedAccounts = [...accounts, newAccount]
      saveAccounts(updatedAccounts)
    } else {
      saveAccounts([newAccount])
    }

    switchAccount(newAccount)
    return response.data
  }

  const register = async (name, email, password, role, rollNumber, phone, college, profilePicture, addToExisting = false) => {
    const response = await axios.post('/api/auth/register', { name, email, password, role, rollNumber, phone, college, profilePicture })
    const newAccount = {
      token: response.data.token,
      user: response.data.user
    }

    if (addToExisting && accounts.length > 0) {
      const updatedAccounts = [...accounts, newAccount]
      saveAccounts(updatedAccounts)
    } else {
      saveAccounts([newAccount])
    }

    switchAccount(newAccount)
    return response.data
  }

  const logout = (accountId = null) => {
    if (accountId) {
      const updatedAccounts = accounts.filter(acc => acc.user.id !== accountId)
      saveAccounts(updatedAccounts)

      if (updatedAccounts.length > 0) {
        switchAccount(updatedAccounts[0])
      } else {
        localStorage.removeItem(ACTIVE_ACCOUNT_KEY)
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        setUser(null)
      }
    } else {
      localStorage.removeItem(ACCOUNTS_KEY)
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
      setAccounts([])
    }
  }

  const switchToAccount = (accountId) => {
    const account = accounts.find(acc => acc.user.id === accountId)
    if (account) {
      switchAccount(account)
    }
  }

  return (
    <AuthContext.Provider value={{ user, accounts, loading, login, register, logout, switchToAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
