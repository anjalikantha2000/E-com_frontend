import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { FaHeart, FaShoppingCart, FaUser, FaBox, FaCog, FaSearch, FaShoppingBag } from 'react-icons/fa'
import { productsAPI } from '../services/api'
import './Navbar.css'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userAccess, setUserAccess] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('userLoggedIn') === 'true'
      const userData = localStorage.getItem('userData')
      let user = null
      try {
        user = userData ? JSON.parse(userData) : null
      } catch (e) {
        console.error('Error parsing userData:', e)
      }
      
      setIsLoggedIn(loggedIn)
      // Check if user is admin
      const adminStatus = user?.role === 'admin' || user?.email === 'admin@anjalicart.com'
      setIsAdmin(adminStatus)
      // Get user access pages
      const userAccessList = user?.access
      if (!userAccessList || !Array.isArray(userAccessList) || userAccessList.length === 0) {
        setUserAccess(['home', 'products', 'contact', 'about', 'blog', 'cart', 'wishlist', 'profile', 'orders'])
      } else {
        setUserAccess(userAccessList)
      }
    }
    
    checkAuth()
    // Listen for storage changes
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  // Search functionality
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }
      setSearchLoading(true)
      try {
        const results = await productsAPI.search(searchQuery)
        setSearchResults(results.slice(0, 8)) // Limit to 8 results
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }

    const debounce = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  // Define all available nav links
  const allNavLinks = [
    { to: '/', label: 'Home', accessKey: 'home' },
    { to: '/products', label: 'Products', accessKey: 'products' },
    { to: '/about', label: 'About', accessKey: 'about' },
    { to: '/blog', label: 'Blog', accessKey: 'blog' },
    { to: '/contact', label: 'Contact', accessKey: 'contact' },
  ]

  // For admin, show only Home and Products
  // For users, show all pages based on access (default to showing all if no access defined)
  const navLinks = isAdmin 
    ? allNavLinks.filter(link => link.accessKey === 'home' || link.accessKey === 'products')
    : allNavLinks.filter(link => 
        !isLoggedIn || link.accessKey === 'home' || isAdmin || userAccess.length === 0 || userAccess.includes(link.accessKey)
      )

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <FaShoppingBag className="brand-icon" />
          <span className="brand-name">AnJali<span className="brand-accent">Cart</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

         {/* Actions */}
        <div className="navbar-actions">
          {/* Search Icon */}
          <div className="search-container" ref={searchRef}>
            <button 
              className="search-toggle-btn" 
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <FaSearch className="search-icon" />
            </button>
            {searchOpen && (
              <div className="search-dropdown">
                <form onSubmit={handleSearchSubmit} className="search-form">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    autoFocus
                  />
                  <button type="submit" className="search-submit">
                    <FaSearch />
                  </button>
                </form>
                {searchQuery.length >= 2 && (
                  <div className="search-results">
                    {searchLoading ? (
                      <div className="search-loading">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(product => (
                        <div 
                          key={product._id} 
                          className="search-result-item"
                          onClick={() => handleProductClick(product._id)}
                        >
                          <img 
                            src={product.image || '/placeholder.jpg'} 
                            alt={product.name}
                            className="search-result-img"
                          />
                          <div className="search-result-info">
                            <span className="search-result-name">{product.name}</span>
                            <span className="search-result-price">${product.price}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="search-no-results">No products found</div>
                    )}
                    {searchResults.length > 0 && (
                      <div 
                        className="search-view-all"
                        onClick={() => {
                          navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
                          setSearchOpen(false)
                          setSearchQuery('')
                        }}
                      >
                        View all results
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
           {/* Wishlist Icon - Only for non-admin users */}
          {!isAdmin && isLoggedIn && userAccess.includes('wishlist') ? (
            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
              <FaHeart className="icon-btn-icon" />
              {wishlistCount > 0 && (
                <span className="icon-badge">{wishlistCount}</span>
              )}
            </Link>
          ) : null}

          {/* Cart Icon - Only for non-admin users */}
          {!isAdmin && isLoggedIn && userAccess.includes('cart') ? (
            <Link to="/cart" className="icon-btn" aria-label="Cart">
              <FaShoppingCart className="icon-btn-icon" />
              {cartCount > 0 && (
                <span className="icon-badge">{cartCount}</span>
              )}
            </Link>
          ) : null}

          {isLoggedIn ? (
            <>
              {/* Orders - Only for non-admin users */}
              {!isAdmin && userAccess.includes('orders') ? (
                <Link to="/orders" className="btn btn-outline btn-sm">
                  <FaBox className="btn-icon" /> Orders
                </Link>
              ) : null}
              {/* Profile - Only for non-admin users */}
              {!isAdmin && userAccess.includes('profile') ? (
                <Link to="/profile" className="btn btn-outline btn-sm">
                  <FaUser className="btn-icon" /> Profile
                </Link>
              ) : null}
              {/* Admin Link - Only for admin */}
              {isAdmin && (
                <Link to="/admin" className="btn btn-admin btn-sm">
                  <FaCog className="btn-icon" /> Admin
                </Link>
              )}
              {/* Logout - For all logged in users (admin and regular users) */}
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => {
                  localStorage.removeItem('userLoggedIn')
                  localStorage.removeItem('userData')
                  window.location.href = '/'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => isActive ? 'mobile-link active' : 'mobile-link'}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mobile-icon-row">
            {isLoggedIn && (isAdmin || userAccess.includes('wishlist')) ? (
              <Link to="/wishlist" className="mobile-icon-btn" onClick={() => setMenuOpen(false)}>
                <FaHeart className="mobile-icon" /> Wishlist {wishlistCount > 0 && <span className="mobile-badge">{wishlistCount}</span>}
              </Link>
            ) : null}
            {isLoggedIn && (isAdmin || userAccess.includes('cart')) ? (
              <Link to="/cart" className="mobile-icon-btn" onClick={() => setMenuOpen(false)}>
                <FaShoppingCart className="mobile-icon" /> Cart {cartCount > 0 && <span className="mobile-badge">{cartCount}</span>}
              </Link>
            ) : null}
          </div>
          <div className="mobile-auth">
            {isLoggedIn ? (
              <>
                {isAdmin || userAccess.includes('orders') ? (
                  <Link to="/orders" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>
                    <FaBox className="btn-icon" /> Orders
                  </Link>
                ) : null}
                {isAdmin || userAccess.includes('profile') ? (
                  <Link to="/profile" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                    <FaUser className="btn-icon" /> Profile
                  </Link>
                ) : null}
                {isAdmin && (
                  <Link to="/admin" className="btn btn-admin btn-sm" onClick={() => setMenuOpen(false)}>
                    <FaCog className="btn-icon" /> Admin
                  </Link>
                )}
                {/* Logout - For all logged in users (admin and regular users) */}
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => {
                    localStorage.removeItem('userLoggedIn')
                    localStorage.removeItem('userData')
                    setMenuOpen(false)
                    window.location.href = '/'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
