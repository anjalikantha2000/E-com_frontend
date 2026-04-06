import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { productsAPI } from '../services/api'
import { FaShoppingBag, FaTimes, FaCheck, FaTruck, FaSyncAlt, FaLock, FaHeadphones, FaShoppingCart } from 'react-icons/fa'
import './Home.css'


function Home() {
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [addedIds, setAddedIds] = useState([])
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [pendingProduct, setPendingProduct] = useState(null)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterError, setNewsletterError] = useState('')
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  
  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    setNewsletterError('')
    
    if (!newsletterEmail.trim()) {
      setNewsletterError('Please enter your email address')
      return
    }
    if (!validateEmail(newsletterEmail)) {
      setNewsletterError('Please enter a valid email address')
      return
    }
    
    // Success - show success message
    setNewsletterSuccess(true)
    setNewsletterEmail('')
    setTimeout(() => setNewsletterSuccess(false), 3000)
  }
  
  // Fetch featured products from backend
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await productsAPI.getAll()
        if (products && products.length > 0) {
          // Get first 4 products as featured
          const featured = products.slice(0, 4).map(p => ({
            id: p._id,
            name: p.name,
            price: p.finalPrice || p.basePrice || p.price,
            image: p.image,
            category: p.category
          }))
          setFeaturedProducts(featured)
        }
      } catch (error) {
        console.log('Using default featured products:', error.message)
        // Use default products if backend fails
        setFeaturedProducts([
          { id: 1, name: 'Wireless Headphones', price: 2499, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=280&fit=crop&auto=format', category: 'Electronics' },
          { id: 2, name: 'Running Shoes', price: 1899, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=280&fit=crop&auto=format', category: 'Footwear' },
          { id: 3, name: 'Leather Handbag', price: 3299, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=280&fit=crop&auto=format', category: 'Fashion' },
          { id: 4, name: 'Smart Watch', price: 5999, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=280&fit=crop&auto=format', category: 'Electronics' }
        ])
      }
    }
    fetchFeaturedProducts()
  }, [])
  
  const isLoggedIn = () => localStorage.getItem('userLoggedIn') === 'true'

  const handleAddToCart = (e, product) => {
    e.stopPropagation()
    
    // Check if user is logged in
    if (!isLoggedIn()) {
      setPendingProduct(product)
      setShowAuthPrompt(true)
      return
    }
    
    addToCart(product)
    setAddedIds(prev => [...prev, product.id])
    setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 1500)
  }
  
  const handleAuthPromptLogin = () => {
    // Auto login the user
    localStorage.setItem('userLoggedIn', 'true')
    // Add the pending product to cart
    if (pendingProduct) {
      addToCart(pendingProduct)
      setAddedIds(prev => [...prev, pendingProduct.id])
      setTimeout(() => setAddedIds(prev => prev.filter(id => id !== pendingProduct.id)), 1500)
      setPendingProduct(null)
    }
    setShowAuthPrompt(false)
  }
  
  const handleAuthPromptSignup = () => {
    // Auto login the user (simulate registration + login)
    localStorage.setItem('userLoggedIn', 'true')
    // Add the pending product to cart
    if (pendingProduct) {
      addToCart(pendingProduct)
      setAddedIds(prev => [...prev, pendingProduct.id])
      setTimeout(() => setAddedIds(prev => prev.filter(id => id !== pendingProduct.id)), 1500)
      setPendingProduct(null)
    }
    setShowAuthPrompt(false)
  }

  return (
    <div className="home">
      {showAuthPrompt && (
        <div className="auth-prompt-overlay">
          <div className="auth-prompt-modal">
            <div className="auth-prompt-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2>Login Required</h2>
            </div>
            <p className="auth-prompt-message">
              Please login or create an account to add items to your cart and enjoy a seamless shopping experience.
            </p>
            <div className="auth-prompt-actions">
              <button className="btn btn-primary" onClick={handleAuthPromptSignup}>
                Continue & Add to Cart
              </button>
              <button className="btn btn-outline" onClick={handleAuthPromptLogin}>
                Login & Add to Cart
              </button>
            </div>
            <button className="auth-prompt-close" onClick={() => setShowAuthPrompt(false)}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to <span className="brand">AnJaliCart</span></h1>
          <p>Discover amazing products at unbeatable prices. Shop the latest trends in fashion, electronics, and more.</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
            <Link to="/about" className="btn btn-outline">Learn More</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-badge"><FaShoppingBag /></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <span className="feature-icon"><FaTruck /></span>
          <h3>Free Delivery</h3>
          <p>On purchases above ₹499</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon"><FaSyncAlt /></span>
          <h3>Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon"><FaLock /></span>
          <h3>Secure Payment</h3>
          <p>100% secure transactions</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon"><FaHeadphones /></span>
          <h3>24/7 Support</h3>
          <p>Always here to help</p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/products" className="view-all">View All →</Link>
        </div>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/products/${product.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-image">
                <img src={product.image} alt={product.name} loading="lazy" />
                <span className="product-category">{product.category}</span>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
                <button
                  className={`btn btn-primary btn-sm ${addedIds.includes(product.id) ? 'btn-added-home' : ''}`}
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  {addedIds.includes(product.id) ? <><FaCheck /> Added!</> : <><FaShoppingCart /> Add to Cart</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <h2>Stay Updated</h2>
        <p>Subscribe to our newsletter for the latest deals and offers</p>
        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
          <input 
            type="email" 
            placeholder="Enter your email address"
            value={newsletterEmail}
            onChange={(e) => {
              setNewsletterEmail(e.target.value)
              setNewsletterError('')
            }}
            className={newsletterError ? 'input-error' : ''}
          />
          <button type="submit" className="btn btn-primary">Subscribe</button>
        </form>
        {newsletterError && <p className="newsletter-error">{newsletterError}</p>}
        {newsletterSuccess && <p className="newsletter-success"><FaCheck /> Thanks for subscribing!</p>}
      </section>
    </div>
  )
}

export default Home
