import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { productsAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { FaTimes, FaUser, FaPlus, FaEdit, FaTrash, FaSearch, FaHeart, FaRegHeart, FaStar, FaCheck, FaShoppingCart, FaFilter, FaMinus } from 'react-icons/fa'
import './Products.css'

const GST_RATE = 18 // 18% GST

const defaultProducts = [
  { id: 'prod_1', name: 'Air Purifier', price: 5499, category: 'Home', rating: 4.5, reviews: 85, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&h=300', brand: 'PureAir', description: 'HEPA air purifier with smart sensors.', stock: 25 },
  { id: 'prod_2', name: 'Blender', price: 1899, category: 'Home', rating: 4.3, reviews: 120, image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=400&h=300', brand: 'KitchenPro', description: 'High-speed blender for smoothies.', stock: 40 },
  { id: 'prod_3', name: 'Camera', price: 15999, category: 'Electronics', rating: 4.7, reviews: 65, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&h=300', brand: 'PhotoMax', description: 'DSLR camera with 24MP sensor.', stock: 15 },
  { id: 'prod_4', name: 'Desk Lamp', price: 999, category: 'Home', rating: 4.2, reviews: 95, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&h=300', brand: 'BrightLight', description: 'LED desk lamp with adjustable brightness.', stock: 50 },
  { id: 'prod_5', name: 'Earbuds', price: 2999, category: 'Electronics', rating: 4.4, reviews: 180, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&h=300', brand: 'SoundMax', description: 'True wireless earbuds with noise cancellation.', stock: 60 },
  { id: 'prod_6', name: 'Face Cream', price: 450, category: 'Fashion', rating: 4.1, reviews: 250, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&h=300', brand: 'GlowCare', description: 'Anti-aging face cream with vitamin C.', stock: 100 },
  { id: 'prod_7', name: 'Gaming Mouse', price: 1299, category: 'Electronics', rating: 4.6, reviews: 145, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&h=300', brand: 'GamePro', description: 'RGB gaming mouse with programmable buttons.', stock: 35 },
  { id: 'prod_8', name: 'Hair Dryer', price: 1599, category: 'Fashion', rating: 4.3, reviews: 88, image: 'https://images.unsplash.com/photo-1583835493098-c5c13d9f8cc6?auto=format&fit=crop&w=400&h=300', brand: 'StyleTech', description: 'Professional hair dryer with ionic technology.', stock: 30 },
  { id: 'prod_9', name: 'Iron Box', price: 899, category: 'Home', rating: 4.2, reviews: 110, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&h=300', brand: 'PressMaster', description: 'Steam iron with non-stick soleplate.', stock: 45 },
  { id: 'prod_10', name: 'Jeans', price: 1799, category: 'Fashion', rating: 4.4, reviews: 200, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&h=300', brand: 'DenimCo', description: 'Classic fit denim jeans.', stock: 55 },
  { id: 'prod_11', name: 'Keyboard', price: 2499, category: 'Electronics', rating: 4.5, reviews: 165, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=400&h=300', brand: 'TypeMaster', description: 'Mechanical keyboard with RGB lighting.', stock: 28 },
  { id: 'prod_12', name: 'Laptop', price: 45999, category: 'Electronics', rating: 4.8, reviews: 320, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&h=300', brand: 'TechPro', description: '15.6 inch laptop with 16GB RAM.', stock: 20 },
  { id: 'prod_13', name: 'Microwave', price: 8999, category: 'Home', rating: 4.4, reviews: 75, image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=400&h=300', brand: 'QuickHeat', description: '20L microwave oven with grill.', stock: 18 },
  { id: 'prod_14', name: 'Necklace', price: 2499, category: 'Fashion', rating: 4.6, reviews: 90, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&h=300', brand: 'Elegance', description: 'Gold-plated fashion necklace.', stock: 22 },
  { id: 'prod_15', name: 'Oven', price: 12999, category: 'Home', rating: 4.5, reviews: 55, image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=400&h=300', brand: 'BakeMaster', description: 'Electric oven with convection.', stock: 12 },
  { id: 'prod_16', name: 'Power Bank', price: 1199, category: 'Electronics', rating: 4.3, reviews: 210, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&h=300', brand: 'ChargeMax', description: '20000mAh power bank with fast charging.', stock: 70 },
  { id: 'prod_17', name: 'Queen Size Bed', price: 18999, category: 'Home', rating: 4.7, reviews: 45, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&h=300', brand: 'SleepWell', description: 'Queen size bed with storage.', stock: 8 },
  { id: 'prod_18', name: 'Ring', price: 3499, category: 'Fashion', rating: 4.5, reviews: 130, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&h=300', brand: 'JewelHub', description: 'Sterling silver engagement ring.', stock: 18 },
  { id: 'prod_19', name: 'Smart TV', price: 24999, category: 'Electronics', rating: 4.6, reviews: 280, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&h=300', brand: 'VisionPlus', description: '43 inch 4K smart TV.', stock: 15 },
  { id: 'prod_20', name: 'T-Shirt', price: 599, category: 'Fashion', rating: 4.2, reviews: 350, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&h=300', brand: 'ComfortWear', description: 'Cotton round neck t-shirt.', stock: 200 },
  { id: 'prod_21', name: 'Umbrella', price: 399, category: 'Fashion', rating: 4.1, reviews: 95, image: 'https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?auto=format&fit=crop&w=400&h=300', brand: 'RainGuard', description: 'Automatic umbrella with UV protection.', stock: 80 },
  { id: 'prod_22', name: 'Vacuum Cleaner', price: 7999, category: 'Home', rating: 4.4, reviews: 65, image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=400&h=300', brand: 'CleanMax', description: 'Bagless vacuum cleaner.', stock: 20 },
  { id: 'prod_23', name: 'Watch', price: 4999, category: 'Fashion', rating: 4.5, reviews: 175, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=300', brand: 'TimeStyle', description: 'Analog watch with leather strap.', stock: 40 },
  { id: 'prod_24', name: 'Xiaomi Phone', price: 12999, category: 'Electronics', rating: 4.4, reviews: 420, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&h=300', brand: 'Xiaomi', description: 'Smartphone with 6GB RAM.', stock: 35 },
  { id: 'prod_25', name: 'Yoga Mat', price: 799, category: 'Sports', rating: 4.3, reviews: 88, image: 'https://images.unsplash.com/photo-1601925268008-f5e4c5e5e5e5?auto=format&fit=crop&w=400&h=300', brand: 'ZenFit', description: 'Non-slip premium yoga mat.', stock: 60 },
  { id: 'prod_26', name: 'Zapper', price: 599, category: 'Home', rating: 4.0, reviews: 45, image: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?auto=format&fit=crop&w=400&h=300', brand: 'BugFree', description: 'Electric mosquito zapper.', stock: 55 },
]

const loadAdminProducts = () => {
  try {
    const stored = localStorage.getItem('adminProducts')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const convertAdminProductToUserProduct = (adminProduct) => {
  const discountAmt = (adminProduct.basePrice * (adminProduct.discountPercent || 0)) / 100
  const priceAfterDiscount = adminProduct.basePrice - discountAmt
  const gstAmt = (priceAfterDiscount * (adminProduct.gstPercent || 18)) / 100
  const finalPrice = priceAfterDiscount + gstAmt
  
  return {
    id: adminProduct.id,
    name: adminProduct.name,
    price: Math.round(finalPrice),
    category: adminProduct.category || 'Electronics',
    rating: 4.5,
    reviews: 0,
    image: adminProduct.image || 'https://via.placeholder.com/400?text=Product',
    brand: 'AnJaliCart',
    description: adminProduct.description || '',
    stock: adminProduct.stock || 0,
    isAdminProduct: true,
    adminProductId: adminProduct.id
  }
}

const checkIsAdmin = () => {
  try {
    const userData = localStorage.getItem('userData')
    if (!userData) return false
    const user = JSON.parse(userData)
    return user?.role === 'admin' || user?.email === 'admin@anjalicart.com'
  } catch {
    return false
  }
}

function Products() {
  const [adminProducts, setAdminProducts] = useState(() => loadAdminProducts())
  const [allProducts, setAllProducts] = useState([])
  const [isAdminUser, setIsAdminUser] = useState(() => checkIsAdmin())
  const { addToast } = useToast()
  const [searchParams] = useSearchParams()
  
  const [activeTab, setActiveTab] = useState(() => checkIsAdmin() ? 'admin' : 'user')
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'All')
  const [sortBy, setSortBy] = useState('default')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [addedIds, setAddedIds] = useState([])
  const [productQuantities, setProductQuantities] = useState({})
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [pendingProduct, setPendingProduct] = useState(null)
  
  const [showQuickView, setShowQuickView] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [showFilters, setShowFilters] = useState(false)
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Electronics',
    basePrice: 0,
    discountPercent: 0,
    gstPercent: 18,
    stock: 0,
    description: '',
    image: ''
  })
  
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlist()
  const navigate = useNavigate()
  
  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const backendProducts = await productsAPI.getAll()
        if (backendProducts && backendProducts.length > 0) {
          // Convert MongoDB products to frontend format
          const convertedProducts = backendProducts.map(p => ({
            id: p._id,
            name: p.name,
            price: p.finalPrice || p.basePrice || p.price,
            category: p.category,
            rating: p.rating || 4.5,
            reviews: p.reviews || 0,
            image: p.image,
            brand: p.brand || 'AnJaliCart',
            description: p.description || '',
            stock: p.stock || 0,
            isBackendProduct: true
          }))
          
          // Remove duplicates based on product name (case-insensitive)
          const uniqueNames = new Set()
          const uniqueDefaultProducts = defaultProducts.filter(p => {
            const lowerName = p.name.toLowerCase()
            if (uniqueNames.has(lowerName)) return false
            uniqueNames.add(lowerName)
            return true
          })
          
          // Filter out backend products that have same name as default products
          const uniqueBackendProducts = convertedProducts.filter(p => {
            const lowerName = p.name.toLowerCase()
            if (uniqueNames.has(lowerName)) return false
            uniqueNames.add(lowerName)
            return true
          })
          
          setAllProducts([...uniqueDefaultProducts, ...uniqueBackendProducts])
        } else {
          setAllProducts(defaultProducts)
        }
      } catch (error) {
        console.log('Using default products:', error.message)
        // Fallback to default products if backend fails
        if (adminProducts.length > 0) {
          const userProducts = adminProducts.map(convertAdminProductToUserProduct)
          setAllProducts([...defaultProducts, ...userProducts])
        } else {
          setAllProducts(defaultProducts)
        }
      }
    }
    fetchProducts()
  }, [adminProducts])

  useEffect(() => {
    if (adminProducts.length > 0) {
      const userProducts = adminProducts.map(convertAdminProductToUserProduct)
      // Don't override if we already loaded from backend
      setAllProducts(prev => {
        if (prev.length > defaultProducts.length) return prev
        return [...defaultProducts, ...userProducts]
      })
    }
  }, [adminProducts])
  
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAdminUser(checkIsAdmin())
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  const isLoggedIn = () => localStorage.getItem('userLoggedIn') === 'true'
  
  const handleQuantityChange = (productId, quantity) => {
    const qty = Math.max(1, parseInt(quantity) || 1)
    setProductQuantities(prev => ({ ...prev, [productId]: qty }))
  }
  
  const categories = ['All', ...new Set(allProducts.map(p => p.category))]
  
  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    return matchesCategory && matchesSearch && matchesPrice
  })
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price
      case 'price-high': return b.price - a.price
      case 'rating': return b.rating - a.rating
      case 'name': return a.name.localeCompare(b.name)
      default: return 0
    }
  })
  
  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    
    const quantity = productQuantities[product.id] || 1
    
    if (!isLoggedIn()) {
      setPendingProduct({ ...product, quantity })
      setShowAuthPrompt(true)
      return
    }
    
    // Add the product multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    setAddedIds(prev => [...prev, product.id])
    setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 1500)
  }
  
  const handleWishlist = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    
    const currentWishlist = wishlist || []
    const isInWishlist = currentWishlist.some(item => item.id === product.id)
    if (isInWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }
  
  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } })
  }
  
  const handleQuickView = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickViewProduct(product)
    setShowQuickView(true)
  }
  
  const handleAuthPromptSignup = () => {
    localStorage.setItem('userLoggedIn', 'true')
    if (pendingProduct) {
      addToCart(pendingProduct)
      setAddedIds(prev => [...prev, pendingProduct.id])
      setTimeout(() => setAddedIds(prev => prev.filter(id => id !== pendingProduct.id)), 1500)
      setPendingProduct(null)
    }
    setShowAuthPrompt(false)
  }
  
  const handleAddToCartAfterAuth = () => {
    if (pendingProduct) {
      addToCart(pendingProduct)
      setAddedIds(prev => [...prev, pendingProduct.id])
      setTimeout(() => setAddedIds(prev => prev.filter(id => id !== pendingProduct.id)), 1500)
      setPendingProduct(null)
    }
    setShowAuthPrompt(false)
  }
  
  const isInWishlist = (productId) => {
    const currentWishlist = wishlist || []
    return currentWishlist.some(item => item.id === productId)
  }
  
  const handleAddProduct = async (e) => {
    e.preventDefault()
    
    // Get token from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const token = userData.token
    
    // Calculate final price with GST and discount
    const discountAmt = (newProduct.basePrice * (newProduct.discountPercent || 0)) / 100
    const priceAfterDiscount = newProduct.basePrice - discountAmt
    const gstAmt = (priceAfterDiscount * (newProduct.gstPercent || 18)) / 100
    const finalPrice = Math.round(priceAfterDiscount + gstAmt)
    
    const productData = {
      name: newProduct.name,
      category: newProduct.category,
      price: finalPrice,
      basePrice: newProduct.basePrice,
      discountPercent: newProduct.discountPercent,
      gstPercent: newProduct.gstPercent,
      stock: newProduct.stock,
      description: newProduct.description,
      image: newProduct.image,
      brand: 'AnJaliCart',
      rating: 4.5,
      reviews: 0,
      isActive: true
    }
    
    try {
      if (token) {
        // Save to backend
        const savedProduct = await productsAPI.create(token, productData)
        console.log('Product saved to MongoDB:', savedProduct)
      } else {
        // Fallback to localStorage
        const product = { id: Date.now(), ...newProduct }
        const updatedProducts = [...adminProducts, product]
        setAdminProducts(updatedProducts)
        localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
      }
      
      setNewProduct({
        name: '',
        category: 'Electronics',
        basePrice: 0,
        discountPercent: 0,
        gstPercent: 18,
        stock: 0,
        description: '',
        image: ''
      })
      setShowAddForm(false)
      addToast('Product added successfully!', 'success')
    } catch (error) {
      console.error('Error adding product:', error)
      // Fallback to localStorage
      const product = { id: Date.now(), ...newProduct }
      const updatedProducts = [...adminProducts, product]
      setAdminProducts(updatedProducts)
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
      addToast('Product added (saved locally)!', 'success')
    }
  }
  
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Get token from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      const token = userData.token
      
      try {
        if (token) {
          // Delete from backend
          await productsAPI.delete(token, productId)
          console.log('Product deleted from MongoDB')
        }
      } catch (error) {
        console.error('Error deleting from backend:', error)
      }
      
      // Always update local state
      const updatedProducts = adminProducts.filter(p => p.id !== productId)
      setAdminProducts(updatedProducts)
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
      addToast('Product deleted successfully!', 'success')
    }
  }
  
  const handleEditProduct = (product) => {
    const newName = prompt('Enter new name:', product.name)
    if (newName === null) return
    const newPrice = prompt('Enter new base price:', product.basePrice)
    if (newPrice === null) return
    const newStock = prompt('Enter new stock:', product.stock)
    if (newStock === null) return
    
    const updatedProducts = adminProducts.map(p => {
      if (p.id === product.id) {
        return { ...p, name: newName, basePrice: parseFloat(newPrice), stock: parseInt(newStock) }
      }
      return p
    })
    setAdminProducts(updatedProducts)
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
    addToast('Product updated successfully!', 'success')
  }
  
  return (
    <div className="products-page">
      {showAuthPrompt && (
        <div className="auth-prompt-overlay">
          <div className="auth-prompt-modal">
            <div className="auth-prompt-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2>Login Required</h2>
            </div>
            <p className="auth-prompt-message">Please login or create an account to add items to your cart.</p>
            <div className="auth-prompt-actions">
              <button className="btn btn-primary" onClick={handleAuthPromptSignup}>Continue & Add to Cart</button>
              <button className="btn btn-outline" onClick={handleAddToCartAfterAuth}>Login & Add to Cart</button>
            </div>
            <button className="auth-prompt-close" onClick={() => setShowAuthPrompt(false)}><FaTimes /></button>
          </div>
        </div>
      )}
      
      <section className="products-header">
        <h1>Our Products</h1>
        <p>Browse our collection of quality products</p>
      </section>

      <div className="products-tabs">
        {isAdminUser ? (
          <button className={`products-tab-btn ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}><FaUser /> Admin View</button>
        ) : (
          <button className={`products-tab-btn ${activeTab === 'user' ? 'active' : ''}`} onClick={() => setActiveTab('user')}><FaUser /> User View</button>
        )}
      </div>

      {activeTab === 'admin' && isAdminUser ? (
        <div className="admin-products-section">
          <div className="add-product-header">
            <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Add New Product</>}
            </button>
          </div>

          {showAddForm && (
            <div className="add-product-form">
              <h3>Add New Product</h3>
              <form onSubmit={handleAddProduct}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home">Home</option>
                      <option value="Sports">Sports</option>
                      <option value="Footwear">Footwear</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Base Price (₹)</label>
                    <input type="number" value={newProduct.basePrice} onChange={(e) => setNewProduct({...newProduct, basePrice: parseFloat(e.target.value)})} required min="0" />
                  </div>
                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input type="number" value={newProduct.discountPercent} onChange={(e) => setNewProduct({...newProduct, discountPercent: parseFloat(e.target.value)})} min="0" max="100" />
                  </div>
                  <div className="form-group">
                    <label>GST (%)</label>
                    <input type="number" value={newProduct.gstPercent} onChange={(e) => setNewProduct({...newProduct, gstPercent: parseFloat(e.target.value)})} min="0" max="50" />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} required min="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} rows="3" />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input type="url" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} placeholder="https://example.com/image.jpg" />
                </div>
                <button type="submit" className="btn btn-primary">Add Product</button>
              </form>
            </div>
          )}

          <div className="admin-products-list">
            <h3>Your Products</h3>
            {adminProducts.length === 0 ? (
              <p className="no-products">No products added yet. Add your first product above!</p>
            ) : (
              <div className="admin-products-grid">
                {adminProducts.map(product => (
                  <div key={product.id} className="admin-product-card">
                    <img src={product.image} alt={product.name} />
                    <div className="admin-product-info">
                      <h4>{product.name}</h4>
                      <p className="category">{product.category}</p>
                      <p className="price">₹{Math.round(product.basePrice * (1 + product.gstPercent / 100) * (1 - product.discountPercent / 100))}</p>
                      <p className="stock">Stock: {product.stock}</p>
                    </div>
                    <div className="admin-product-actions">
                      <button className="btn btn-sm btn-outline" onClick={() => handleEditProduct(product)}><FaEdit /> Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteProduct(product.id)}><FaTrash /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="products-toolbar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="filter-controls">
              <div className="sort-select">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Sort by: Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>🔍 Filters</button>
            </div>
          </div>

          {showFilters && (
            <div className="advanced-filters">
              <div className="price-range-filter">
                <label>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</label>
                <input type="range" className="price-slider" min="0" max="10000" value={priceRange[1]} onChange={(e) => setPriceRange([0, parseInt(e.target.value)])} />
              </div>
              <button className="clear-filters-btn" onClick={() => { setPriceRange([0, 10000]); setSelectedCategory('All'); setSearchQuery(''); }}>Clear Filters</button>
            </div>
          )}

          <div className="category-filters">
            {categories.map(category => (
              <button key={category} className={`filter-btn ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>{category}</button>
            ))}
          </div>

          <div className="products-container">
            <p className="results-info">Showing {sortedProducts.length} products</p>
            <div className="products-grid-full">
              {sortedProducts.map(product => (
                <div key={product.id} className="product-card-full" onClick={() => handleProductClick(product)}>
                  <div className="product-img-wrap">
                    <img src={product.image} alt={product.name} />
                    <span className="product-badge">{product.category}</span>
                    <button className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`} onClick={(e) => handleWishlist(e, product)}>
                      {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    <button className="quick-view-btn" onClick={(e) => handleQuickView(e, product)}>Quick View</button>
                  </div>
                  <div className="product-details">
                    <span className="product-brand">{product.brand}</span>
                    <h3>{product.name}</h3>
                    <div className="product-rating">
                      <span className="stars">{Array.from({length: Math.floor(product.rating)}, (_, i) => <FaStar key={i} />)}</span>
                      <span className="rating-count">({product.reviews})</span>
                    </div>
                    <div className="product-footer">
                      <span className="price">₹{product.price}</span>
                      <div className="quantity-controls">
                        <button className="qty-btn" onClick={() => handleQuantityChange(product.id, (productQuantities[product.id] || 1) - 1)} disabled={(productQuantities[product.id] || 1) <= 1}><FaMinus /></button>
                        <input type="number" className="qty-input" value={productQuantities[product.id] || 1} onChange={(e) => handleQuantityChange(product.id, e.target.value)} min="1" max={Math.min(9999, product.stock)} />
                        <button className="qty-btn" onClick={() => handleQuantityChange(product.id, (productQuantities[product.id] || 1) + 1)} disabled={(productQuantities[product.id] || 1) >= Math.min(9999, product.stock)}><FaPlus /></button>
                      </div>
                      <button className={`add-to-cart-btn ${addedIds.includes(product.id) ? 'added' : ''}`} onClick={(e) => handleAddToCart(e, product)} disabled={addedIds.includes(product.id)}>
                        {addedIds.includes(product.id) ? <><FaCheck /> Added!</> : <><FaShoppingCart /> Add to Cart</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {sortedProducts.length === 0 && <div className="no-results"><FaSearch /><p>No products found matching your criteria.</p></div>}
        </>
      )}

      {showQuickView && quickViewProduct && (
        <div className="quick-view-overlay" onClick={() => setShowQuickView(false)}>
          <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowQuickView(false)}><FaTimes /></button>
            <div className="quick-view-content">
              <div className="quick-view-image"><img src={quickViewProduct.image} alt={quickViewProduct.name} /></div>
              <div className="quick-view-details">
                <span className="category">{quickViewProduct.category}</span>
                <h2>{quickViewProduct.name}</h2>
                <p className="brand">{quickViewProduct.brand}</p>
                <div className="rating">{Array.from({length: Math.floor(quickViewProduct.rating)}, (_, i) => <FaStar key={i} />)}<span>({quickViewProduct.reviews} reviews)</span></div>
                <p className="description">{quickViewProduct.description}</p>
                <div className="price-info"><span className="price">₹{quickViewProduct.price}</span></div>
                <div className="stock-info">
                  <span className={quickViewProduct.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                    {quickViewProduct.stock > 0 ? `In Stock (${quickViewProduct.stock})` : 'Out of Stock'}
                  </span>
                </div>
                <div className="quick-view-actions">
                  <button className="btn btn-primary" onClick={(e) => handleAddToCart(e, quickViewProduct)} disabled={quickViewProduct.stock === 0}>Add to Cart</button>
                  <button className="btn btn-outline" onClick={(e) => handleWishlist(e, quickViewProduct)}>
                    {isInWishlist(quickViewProduct.id) ? <><FaHeart /> Wishlisted</> : <><FaRegHeart /> Add to Wishlist</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
