import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

// User Roles
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
}

// Available pages
export const AVAILABLE_PAGES = [
  { id: 'home', name: 'Home', path: '/' },
  { id: 'products', name: 'Products', path: '/products' },
  { id: 'cart', name: 'Cart', path: '/cart' },
  { id: 'wishlist', name: 'Wishlist', path: '/wishlist' },
  { id: 'orders', name: 'Orders', path: '/orders' },
  { id: 'profile', name: 'Profile', path: '/profile' },
  { id: 'contact', name: 'Contact', path: '/contact' },
  { id: 'about', name: 'About', path: '/about' },
  { id: 'blog', name: 'Blog', path: '/blog' },
  { id: 'admin', name: 'Admin Dashboard', path: '/admin' }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userAccess, setUserAccess] = useState([])

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('userData')
    const userLoggedIn = localStorage.getItem('userLoggedIn')
    const token = localStorage.getItem('token')
    
    if (storedUser && userLoggedIn === 'true') {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsAuthenticated(true)
      setIsAdmin(userData.role === UserRole.ADMIN || userData.email === 'admin@anjalicart.com')
      setUserAccess(userData.access || [])
    }
    setLoading(false)
  }, [])

  // Login function
  const login = useCallback((userData, remember = true) => {
    const updatedUser = {
      ...userData,
      role: userData.role || UserRole.USER,
      lastLogin: new Date().toISOString()
    }
    
    setUser(updatedUser)
    setIsAuthenticated(true)
    setIsAdmin(updatedUser.role === UserRole.ADMIN || updatedUser.email === 'admin@anjalicart.com')
    setUserAccess(updatedUser.access || [])
    
    if (remember) {
      localStorage.setItem('userData', JSON.stringify(updatedUser))
      localStorage.setItem('userLoggedIn', 'true')
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
    setUserAccess([])
    localStorage.removeItem('userData')
    localStorage.removeItem('userLoggedIn')
    localStorage.removeItem('token')
  }, [])

  // Update user profile
  const updateProfile = useCallback((updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('userData', JSON.stringify(updatedUser))
  }, [user])

  // Update user access (called from admin)
  const updateAccess = useCallback((newAccess) => {
    const updatedUser = { ...user, access: newAccess }
    setUser(updatedUser)
    setUserAccess(newAccess)
    localStorage.setItem('userData', JSON.stringify(updatedUser))
  }, [user])

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!user) return false
    return user.role === role
  }, [user])

  // Check if user has access to a specific page
  const hasPageAccess = useCallback((pageId) => {
    if (!user) return false
    
    // Admin has all access
    if (user.role === UserRole.ADMIN) return true
    
    // Check if page is in user's access array
    return userAccess.includes(pageId)
  }, [user, userAccess])

  // Get allowed pages for the user
  const getAllowedPages = useCallback(() => {
    if (!user) return []
    
    // Admin sees all pages
    if (user.role === UserRole.ADMIN) return AVAILABLE_PAGES
    
    // Filter pages based on access
    return AVAILABLE_PAGES.filter(page => userAccess.includes(page.id))
  }, [user, userAccess])

  // Check permission
  const hasPermission = useCallback((permission) => {
    if (!user) return false
    
    // Admin has all permissions
    if (user.role === UserRole.ADMIN) return true
    
    // Define user permissions
    const userPermissions = [
      'view_products',
      'add_to_cart',
      'place_order',
      'view_orders',
      'manage_profile'
    ]
    
    return userPermissions.includes(permission)
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      loading,
      userAccess,
      login,
      logout,
      updateProfile,
      updateAccess,
      hasRole,
      hasPageAccess,
      getAllowedPages,
      hasPermission,
      UserRole,
      AVAILABLE_PAGES
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
