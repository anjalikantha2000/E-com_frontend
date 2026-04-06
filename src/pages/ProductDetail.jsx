import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { productsAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { FaSearch, FaHeart, FaRegHeart, FaCheck, FaShoppingCart, FaStar, FaCheckCircle, FaBox, FaTimes } from 'react-icons/fa'
import './ProductDetail.css'

const allProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 2499,
    category: 'Electronics',
    rating: 4.5,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop&auto=format',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for music lovers and professionals alike.',
    features: ['Active Noise Cancellation', '30-hour battery', 'Bluetooth 5.0', 'Foldable design', 'Built-in microphone'],
  },
  {
    id: 2,
    name: 'Running Shoes',
    price: 1899,
    category: 'Footwear',
    rating: 4.3,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop&auto=format',
    description: 'Lightweight and breathable running shoes designed for maximum comfort and performance. Ideal for daily runs and gym workouts.',
    features: ['Breathable mesh upper', 'Cushioned sole', 'Anti-slip grip', 'Lightweight design', 'Available in multiple colors'],
  },
  {
    id: 3,
    name: 'Leather Handbag',
    price: 3299,
    category: 'Fashion',
    rating: 4.7,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=450&fit=crop&auto=format',
    description: 'Elegant genuine leather handbag with multiple compartments. A timeless accessory that complements any outfit.',
    features: ['Genuine leather', 'Multiple compartments', 'Adjustable strap', 'Magnetic closure', 'Dust bag included'],
  },
  {
    id: 4,
    name: 'Smart Watch',
    price: 5999,
    category: 'Electronics',
    rating: 4.6,
    reviews: 175,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop&auto=format',
    description: 'Feature-packed smartwatch with health monitoring, GPS, and a stunning AMOLED display. Stay connected and track your fitness goals.',
    features: ['AMOLED display', 'Heart rate monitor', 'GPS tracking', '7-day battery', 'Water resistant IP68'],
  },
  {
    id: 5,
    name: 'Yoga Mat',
    price: 799,
    category: 'Sports',
    rating: 4.4,
    reviews: 88,
    image: 'https://images.unsplash.com/photo-1601925228008-f5e4c5e5e5e5?w=600&h=450&fit=crop&auto=format',
    description: 'Non-slip premium yoga mat with alignment lines. Perfect for yoga, pilates, and floor exercises.',
    features: ['Non-slip surface', 'Eco-friendly material', '6mm thickness', 'Alignment lines', 'Carrying strap included'],
  },
  {
    id: 6,
    name: 'Coffee Maker',
    price: 2199,
    category: 'Home',
    rating: 4.2,
    reviews: 64,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=450&fit=crop&auto=format',
    description: 'Programmable coffee maker with a 12-cup capacity and built-in grinder. Wake up to freshly brewed coffee every morning.',
    features: ['12-cup capacity', 'Built-in grinder', 'Programmable timer', 'Keep-warm function', 'Easy-clean carafe'],
  },
  {
    id: 7,
    name: 'Sunglasses',
    price: 1299,
    category: 'Fashion',
    rating: 4.1,
    reviews: 52,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=450&fit=crop&auto=format',
    description: 'Stylish UV400 polarized sunglasses with a lightweight frame. Protect your eyes in style.',
    features: ['UV400 protection', 'Polarized lenses', 'Lightweight frame', 'Scratch-resistant', 'Case included'],
  },
  {
    id: 8,
    name: 'Bluetooth Speaker',
    price: 1799,
    category: 'Electronics',
    rating: 4.5,
    reviews: 143,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=450&fit=crop&auto=format',
    description: '360° surround sound portable Bluetooth speaker with 20-hour playtime and waterproof design.',
    features: ['360° surround sound', '20-hour battery', 'IPX7 waterproof', 'Bluetooth 5.0', 'Built-in microphone'],
  },
  {
    id: 9,
    name: 'Backpack',
    price: 1499,
    category: 'Fashion',
    rating: 4.3,
    reviews: 77,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=450&fit=crop&auto=format',
    description: 'Durable 30L backpack with laptop compartment and ergonomic design. Perfect for travel, college, and daily commute.',
    features: ['30L capacity', '15" laptop compartment', 'USB charging port', 'Water-resistant', 'Ergonomic straps'],
  },
  {
    id: 10,
    name: 'Dumbbells Set',
    price: 2999,
    category: 'Sports',
    rating: 4.6,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=450&fit=crop&auto=format',
    description: 'Adjustable dumbbell set with rubber coating for home gym workouts. Suitable for all fitness levels.',
    features: ['Adjustable weight', 'Rubber coating', 'Anti-roll design', 'Ergonomic grip', 'Storage rack included'],
  },
  {
    id: 11,
    name: 'Table Lamp',
    price: 899,
    category: 'Home',
    rating: 4.0,
    reviews: 41,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=450&fit=crop&auto=format',
    description: 'Modern LED table lamp with adjustable brightness and color temperature. Perfect for reading and desk work.',
    features: ['LED technology', 'Adjustable brightness', '3 color temperatures', 'USB charging port', 'Touch control'],
  },
  {
    id: 12,
    name: 'Sneakers',
    price: 2299,
    category: 'Footwear',
    rating: 4.4,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&h=450&fit=crop&auto=format',
    description: 'Trendy casual sneakers with memory foam insole and durable rubber outsole. Style meets comfort.',
    features: ['Memory foam insole', 'Rubber outsole', 'Canvas upper', 'Lace-up closure', 'Available in 6 colors'],
  },
]

function StarRating({ rating, showCount = true }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={star <= Math.floor(rating) ? 'star filled' : star - 0.5 <= rating ? 'star half' : 'star'}>
          <FaStar />
        </span>
      ))}
      <span className="rating-number">{rating}</span>
    </div>
  )
}

// Sample reviews data
const sampleReviews = [
  { id: 1, user: 'Priya S.', rating: 5, date: '2024-01-15', comment: 'Amazing product! Exceeded my expectations. The quality is outstanding and delivery was super fast.', verified: true },
  { id: 2, user: 'Rahul M.', rating: 4, date: '2024-01-10', comment: 'Very good product. Good value for money. Would recommend to others.', verified: true },
  { id: 3, user: 'Anjali K.', rating: 5, date: '2024-01-05', comment: 'Love it! Perfect for my needs. The design is beautiful.', verified: false },
  { id: 4, user: 'Vikram S.', rating: 4, date: '2023-12-28', comment: 'Great quality. Slight delay in delivery but product is worth it.', verified: true },
]

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted, wishlistItems } = useWishlist()
  const { addToast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLightbox, setShowLightbox] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [activeTab, setActiveTab] = useState('description')
  const [isWishlistedProduct, setIsWishlistedProduct] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Fetch product from backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Try to fetch from backend
        const backendProduct = await productsAPI.getById(id)
        if (backendProduct) {
          setProduct({
            id: backendProduct._id,
            name: backendProduct.name,
            price: backendProduct.finalPrice || backendProduct.basePrice || backendProduct.price,
            category: backendProduct.category,
            rating: backendProduct.rating || 4.5,
            reviews: backendProduct.reviews || 0,
            image: backendProduct.image,
            description: backendProduct.description || '',
            features: backendProduct.features || []
          })
          
          // Also fetch all products for related products
          const allProductsData = await productsAPI.getAll()
          setAllProducts(allProductsData.map(p => ({
            id: p._id,
            name: p.name,
            price: p.finalPrice || p.basePrice || p.price,
            image: p.image,
            category: p.category
          })))
        }
      } catch (error) {
        console.log('Product not found in backend, using local data:', error.message)
      } finally {
        setLoading(false)
      }
    }
    
    // Check if it's a backend product ID (MongoDB ObjectId format - 24 char hex)
    // Local products have IDs starting with 'prod_'
    const isBackendId = id && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id)
    const isLocalProduct = id && id.startsWith('prod_')
    
    if (isLocalProduct) {
      // Use local products array from Products.jsx
      const localProducts = [
        { id: 'prod_1', name: 'Air Purifier', price: 5499, category: 'Home', rating: 4.5, reviews: 85, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&h=300', description: 'HEPA air purifier with smart sensors.', features: ['HEPA filter', 'Smart sensors', 'Quiet operation'], stock: 25 },
        { id: 'prod_2', name: 'Blender', price: 1899, category: 'Home', rating: 4.3, reviews: 120, image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=400&h=300', description: 'High-speed blender for smoothies.', features: ['High-speed motor', ' BPA-free', 'Easy clean'], stock: 40 },
        { id: 'prod_3', name: 'AC', price: 28999, category: 'Electronics', rating: 4.7, reviews: 200, image: 'https://images.unsplash.com/photo-1631545806609-35f9b004e3de?auto=format&fit=crop&w=400&h=300', description: 'Split AC with inverter technology.', features: ['Inverter technology', 'Energy efficient', 'Cooling'], stock: 15 },
        { id: 'prod_4', name: 'Laptop', price: 45999, category: 'Electronics', rating: 4.8, reviews: 350, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&h=300', description: 'High-performance laptop for work and gaming.', features: ['16GB RAM', '512GB SSD', 'Intel i7'], stock: 20 },
        { id: 'prod_5', name: 'Phone', price: 19999, category: 'Electronics', rating: 4.6, reviews: 500, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&h=300', description: 'Smartphone with amazing camera.', features: ['48MP camera', '5000mAh battery', '5G ready'], stock: 35 },
        { id: 'prod_6', name: 'Headphones', price: 2999, category: 'Electronics', rating: 4.4, reviews: 180, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=300', description: 'Wireless headphones with noise cancellation.', features: ['ANC', '30-hour battery', 'Bluetooth 5.0'], stock: 50 },
        { id: 'prod_7', name: 'Smart Watch', price: 8999, category: 'Electronics', rating: 4.5, reviews: 250, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300', description: 'Fitness tracker with heart rate monitor.', features: ['Heart rate', 'Step counter', 'Sleep tracking'], stock: 30 },
        { id: 'prod_8', name: 'Tablet', price: 24999, category: 'Electronics', rating: 4.6, reviews: 150, image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=400&h=300', description: '10-inch tablet for work and entertainment.', features: ['10-inch display', '128GB storage', 'Long battery life'], stock: 25 },
        { id: 'prod_9', name: 'Camera', price: 34999, category: 'Electronics', rating: 4.7, reviews: 80, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&h=300', description: 'DSLR camera for professional photography.', features: ['24MP sensor', '4K video', 'WiFi enabled'], stock: 10 },
        { id: 'prod_10', name: 'Printer', price: 8999, category: 'Electronics', rating: 4.3, reviews: 120, image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=400&h=300', description: 'Wireless all-in-one printer.', features: ['Print/Scan/Copy', 'Wireless', 'Auto duplex'], stock: 18 },
        { id: 'prod_11', name: 'Microwave', price: 12999, category: 'Home', rating: 4.4, reviews: 90, image: 'https://images.unsplash.com/photo-1585494156145-1c60a4fe952b?auto=format&fit=crop&w=400&h=300', description: 'Convection microwave oven.', features: ['Convection', 'Grill mode', 'Auto cook'], stock: 22 },
        { id: 'prod_12', name: 'Refrigerator', price: 35999, category: 'Home', rating: 4.6, reviews: 200, image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=400&h=300', description: 'Double door refrigerator.', features: ['Double door', 'No frost', 'Energy rating 5'], stock: 12 }
      ]
      const found = localProducts.find(p => p.id === id)
      if (found) {
        setProduct(found)
        setIsWishlistedProduct(wishlistItems.some(item => item.id === found.id))
        setAllProducts(localProducts)
      } else {
        setProduct(null)
        setAllProducts(localProducts)
      }
      setLoading(false)
    } else if (isBackendId) {
      fetchProduct()
    } else {
      // Use hardcoded products for legacy IDs
      const hardcodedProducts = [
        { id: 1, name: 'Wireless Headphones', price: 2499, category: 'Electronics', rating: 4.5, reviews: 128, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop&auto=format', description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.', features: ['Active Noise Cancellation', '30-hour battery', 'Bluetooth 5.0'] },
        { id: 2, name: 'Running Shoes', price: 1899, category: 'Footwear', rating: 4.3, reviews: 95, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop&auto=format', description: 'Lightweight running shoes for maximum comfort.', features: ['Breathable mesh', 'Cushioned sole'] },
        { id: 3, name: 'Leather Handbag', price: 3299, category: 'Fashion', rating: 4.7, reviews: 210, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=450&fit=crop&auto=format', description: 'Elegant genuine leather handbag.', features: ['Genuine leather', 'Multiple compartments'] },
        { id: 4, name: 'Smart Watch', price: 5999, category: 'Electronics', rating: 4.6, reviews: 175, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop&auto=format', description: 'Feature-packed smartwatch with health monitoring.', features: ['AMOLED display', 'Heart rate monitor'] },
        { id: 5, name: 'Yoga Mat', price: 799, category: 'Sports', rating: 4.4, reviews: 88, image: 'https://images.unsplash.com/photo-1601925268008-f5e4c5e5e5e5?w=600&h=450&fit=crop&auto=format', description: 'Non-slip premium yoga mat.', features: ['Non-slip surface', 'Eco-friendly'] },
        { id: 6, name: 'Coffee Maker', price: 2199, category: 'Home', rating: 4.2, reviews: 64, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=450&fit=crop&auto=format', description: 'Programmable coffee maker.', features: ['12-cup capacity', 'Built-in grinder'] },
        { id: 7, name: 'Sunglasses', price: 1299, category: 'Fashion', rating: 4.1, reviews: 52, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=450&fit=crop&auto=format', description: 'Stylish UV400 polarized sunglasses.', features: ['UV400 protection', 'Polarized lenses'] },
        { id: 8, name: 'Bluetooth Speaker', price: 1799, category: 'Electronics', rating: 4.5, reviews: 143, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=450&fit=crop&auto=format', description: '360° surround sound speaker.', features: ['360° sound', '20-hour battery'] },
        { id: 9, name: 'Backpack', price: 1499, category: 'Fashion', rating: 4.3, reviews: 77, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=450&fit=crop&auto=format', description: 'Durable 30L backpack.', features: ['30L capacity', 'Laptop compartment'] },
        { id: 10, name: 'Dumbbells Set', price: 2999, category: 'Sports', rating: 4.6, reviews: 112, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=450&fit=crop&auto=format', description: 'Adjustable dumbbell set.', features: ['Adjustable weight', 'Rubber coating'] },
        { id: 11, name: 'Table Lamp', price: 899, category: 'Home', rating: 4.0, reviews: 41, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=450&fit=crop&auto=format', description: 'Modern LED table lamp.', features: ['LED technology', 'Touch control'] },
        { id: 12, name: 'Sneakers', price: 2299, category: 'Footwear', rating: 4.4, reviews: 98, image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&h=450&fit=crop&auto=format', description: 'Trendy casual sneakers.', features: ['Memory foam insole', 'Rubber outsole'] }
      ]
      
      const found = hardcodedProducts.find(p => p.id === parseInt(id))
      setProduct(found || null)
      setAllProducts(hardcodedProducts)
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return (
      <div className="product-not-found">
        <h2>Loading...</h2>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <Link to="/products" className="btn btn-primary">Back to Products</Link>
      </div>
    )
  }

  // Get product images (use images array or fallback to single image)
  const productImages = product.images || [product.image]
  const displayImage = productImages[selectedImageIndex] || product.image
  
  // Stock status helper
  const getStockStatus = () => {
    if (!product.stock || product.stock === 0) return { text: 'Out of Stock', class: 'out-of-stock' }
    if (product.stock <= 5) return { text: `Only ${product.stock} left!`, class: 'low-stock' }
    return { text: 'In Stock', class: 'in-stock' }
  }
  const stockStatus = getStockStatus()

  const handleAddToCart = () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true'
    if (!isLoggedIn) {
      addToast('Please login to add items to cart!', 'warning')
      navigate('/login')
      return
    }
    
    // Check if size is required
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      addToast('Please select a size!', 'warning')
      return
    }
    
    const productWithSize = { ...product, selectedSize }
    for (let i = 0; i < quantity; i++) {
      addToCart(productWithSize)
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/products">Products</Link>
        <span>›</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      {/* Product Main */}
      <div className="product-detail-main">
        {/* Image Gallery */}
        <div className="product-image-gallery">
          <div className="main-image-container" onClick={() => setShowLightbox(true)}>
            <img src={displayImage} alt={product.name} className="main-product-image" loading="lazy" />
            <div className="zoom-hint"><FaSearch /> Click to zoom</div>
          </div>
          {productImages.length > 1 && (
            <div className="thumbnail-list">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumbnail ${selectedImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
          <button
            className={`wishlist-btn-detail ${isWishlistedProduct ? 'active' : ''}`}
            onClick={async () => {
              await toggleWishlist(product)
              setIsWishlistedProduct(!isWishlistedProduct)
            }}
            aria-label="Toggle wishlist"
          >
            {isWishlistedProduct ? <FaHeart className="wishlist-icon-filled" /> : <FaRegHeart className="wishlist-icon" />}
          </button>
        </div>

        {/* Info */}
        <div className="product-detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-name">{product.name}</h1>

          <div className="rating-reviews-row">
            <StarRating rating={product.rating} />
            <span className="reviews-link" onClick={() => setActiveTab('reviews')}>
              {product.reviews} customer reviews
            </span>
          </div>

          {/* Stock Status */}
          <div className={`stock-status ${stockStatus.class}`}>
            <span className="stock-indicator"></span>
            {stockStatus.text}
          </div>

          <div className="detail-price">
            <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
            <span className="original-price">₹{Math.floor(product.price * 1.2).toLocaleString('en-IN')}</span>
            <span className="discount-badge">20% OFF</span>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="size-selector">
              <label>Select Size:</label>
              <div className="size-options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="product-tabs">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviews})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-tab">
                <p className="detail-description">{product.description}</p>
              </div>
            )}
            {activeTab === 'features' && (
              <div className="features-tab">
                <div className="detail-features">
                  <h3>Key Features</h3>
                  <ul>
                    {product.features.map((f, i) => (
                      <li key={i}><FaCheck /> {f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                <div className="reviews-summary">
                  <div className="overall-rating">
                    <span className="rating-big">{product.rating}</span>
                    <StarRating rating={product.rating} />
                    <span className="total-reviews">{product.reviews} reviews</span>
                  </div>
                </div>
                <div className="reviews-list">
                  {sampleReviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <span className="review-user">{review.user}</span>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <div className="review-rating">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} className={star <= review.rating ? 'star filled' : 'star'}><FaStar /></span>
                        ))}
                      </div>
                      <p className="review-comment">{review.comment}</p>
                      {review.verified && <span className="verified-badge"><FaCheckCircle /> Verified Purchase</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Shipping Information */}
          {product.shipping && (
            <div className="shipping-info">
              <h4>🚚 Shipping Information</h4>
              <div className="shipping-details">
                <div className="shipping-item">
                  <span className="shipping-icon"><FaBox /></span>
                  <span>Delivery: {product.shipping.deliveryDays}</span>
                </div>
                {product.shipping.free && (
                  <div className="shipping-item free-shipping">
                    <span className="shipping-icon">🎁</span>
                    <span>Free Shipping</span>
                  </div>
                )}
                {product.shipping.expressDelivery && (
                  <div className="shipping-item express">
                    <span className="shipping-icon">⚡</span>
                    <span>Express Delivery Available</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="detail-quantity">
            <label>Quantity:</label>
            <div className="quantity-control">
              <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
              <span className="qty-value">{quantity}</span>
              <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>

          <div className="detail-actions">
            <button
              className={`btn btn-primary btn-lg ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={!product.stock || product.stock === 0}
            >
              {addedToCart ? <><FaCheck /> Added to Cart!</> : <><FaShoppingCart /> Add to Cart</>}
            </button>
            <button
              className={`btn btn-outline btn-lg wishlist-action ${isWishlistedProduct ? 'wishlisted' : ''}`}
              onClick={async () => {
                await toggleWishlist(product)
                setIsWishlistedProduct(!isWishlistedProduct)
              }}
            >
              {isWishlistedProduct ? <><FaHeart /> Wishlisted</> : <><FaRegHeart /> Wishlist</>}
            </button>
          </div>

          <div className="detail-badges">
            <span>🚚 Free delivery on orders ₹499+</span>
            <span>🔄 30-day easy returns</span>
            <span>🔒 Secure payment</span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setShowLightbox(false)}><FaTimes /></button>
            <img src={displayImage} alt={product.name} className="lightbox-image" />
            {productImages.length > 1 && (
              <div className="lightbox-thumbnails">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`lightbox-thumb ${selectedImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Related Products */}
      {allProducts.length > 0 && (
        <section className="related-products">
          <h2>Related Products</h2>
          <div className="related-grid">
            {allProducts.map(p => (
              <div key={p.id} className="related-card" onClick={() => navigate(`/products/${p.id}`)}>
                <img src={p.image} alt={p.name} loading="lazy" />
                <div className="related-info">
                  <h3>{p.name}</h3>
                  <span className="related-price">₹{p.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetail
