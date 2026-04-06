import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { productsAPI, ordersAPI, authAPI, contentAPI, chatAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { FaHome, FaUsers, FaBox, FaShoppingBag, FaFileAlt, FaUsersCog, FaInfoCircle, FaChartLine, FaCommentDots, FaCog, FaUserFriends, FaSearch, FaEdit, FaTrash, FaCheck, FaTimes, FaPlus, FaExclamationTriangle, FaPaperPlane, FaChevronLeft, FaChevronRight, FaUser } from 'react-icons/fa'
import './Admin.css'

// High-quality product images
const productImages = {
  iphone: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
  macbook: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
  watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  handbag: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
  camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop',
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
  tablet: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
  speaker: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
  gaming: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
  airpods: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop',
  sunglass: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
  yoga: 'https://images.unsplash.com/photo-1601925268008-f5e4c5e5e5e5?w=400&h=400&fit=crop',
  earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
}

function Admin() {
  const { addToCart } = useCart()
  const { addToast } = useToast()
  const [activeSection, setActiveSection] = useState('customers')
  const [searchTerm, setSearchTerm] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Product form state
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: 0,
    discountPercent: 0,
    profitPercent: 10,
    gstPercent: 18,
    stock: '',
    image: null,
    imagePreview: null
  })
  
  // Edit product state
  const [editingProduct, setEditingProduct] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Calculated values
  const discountAmount = (product.basePrice * product.discountPercent) / 100
  const priceAfterDiscount = product.basePrice - discountAmount
  const gstAmount = (priceAfterDiscount * product.gstPercent) / 100
  const finalPrice = priceAfterDiscount + gstAmount
  
  // Products list - will fetch from database
  const [products, setProducts] = useState([])
  
  // Blog posts state - from database
  const [blogs, setBlogs] = useState([])
  
  // Contact messages state - from database
  const [contacts, setContacts] = useState([])
  
  // Team members state - from database
  const [teamMembers, setTeamMembers] = useState([])
  
  // About content state - from database
  const [aboutContent, setAboutContent] = useState(null)
  
  // Chat sessions state - from database
  const [chatSessions, setChatSessions] = useState([])
  
  // Fetch all database collections on mount
  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      
      try {
        // Fetch products
        const productsData = await productsAPI.getAll()
        const transformedProducts = productsData.map(p => ({
          _id: p._id,
          id: p._id,
          name: p.name,
          category: p.category,
          basePrice: p.basePrice || p.price || 0,
          discountPercent: p.discountPercent || 0,
          profitPercent: p.profitPercent || 10,
          gstPercent: p.gstPercent || 18,
          finalPrice: p.finalPrice || p.price || 0,
          stock: p.stock || 0,
          image: p.image || productImages.iphone,
          description: p.description || ''
        }))
        setProducts(transformedProducts)
        
        // Fetch blogs
        try {
          const blogsData = await contentAPI.getBlogs()
          setBlogs(blogsData || [])
        } catch (err) {
          console.log('No blogs found')
          setBlogs([])
        }
        
        // Fetch contacts
        try {
          const contactsData = await contentAPI.getContacts(token)
          setContacts(contactsData || [])
        } catch (err) {
          console.log('No contacts found')
          setContacts([])
        }
        
        // Fetch team members
        try {
          const teamData = await contentAPI.getTeam()
          setTeamMembers(teamData || [])
        } catch (err) {
          console.log('No team members found')
          setTeamMembers([])
        }
        
        // Fetch about content
        try {
          const aboutData = await contentAPI.getAbout()
          setAboutContent(aboutData)
        } catch (err) {
          console.log('No about content found')
          setAboutContent(null)
        }
        
        // Fetch chat sessions
        try {
          const chatsData = await chatAPI.getAllSessions(token)
          setChatSessions(chatsData || [])
        } catch (err) {
          console.log('No chat sessions found')
          setChatSessions([])
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchAllData()
  }, [])
  
  // Users state - load from localStorage
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('registeredUsers')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Ensure we return an array with proper user objects (not cart items)
        if (!Array.isArray(parsed)) return []
        // Filter to ensure only user objects with email exist
        return parsed.filter(u => u && typeof u === 'object' && u.email)
      } catch {
        return []
      }
    }
    return []
  })
  
  // Orders state - load from localStorage
  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem('userOrders')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  })
  
  // Order modal state for status update
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newOrderStatus, setNewOrderStatus] = useState('')
  const [orderSearchTerm, setOrderSearchTerm] = useState('')
  const [orderFilterStatus, setOrderFilterStatus] = useState('all')

  // Calculate stats
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0)
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0)
  const lowStockCount = products.filter(p => p.stock < 20).length

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProduct({ ...product, [name]: name.includes('Percent') || name === 'basePrice' ? parseFloat(value) || 0 : value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProduct({ ...product, image: file, imagePreview: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!product.name || product.basePrice <= 0) {
      addToast('Please fill in product name and base price', 'error')
      return
    }
    const newProduct = {
      id: Date.now(),
      name: product.name,
      category: product.category,
      basePrice: product.basePrice,
      discountPercent: product.discountPercent || 0,
      profitPercent: product.profitPercent || 10,
      gstPercent: product.gstPercent || 18,
      finalPrice: Math.round(finalPrice),
      stock: product.stock || 50,
      image: product.imagePreview || 'https://via.placeholder.com/400?text=Product',
      description: product.description
    }
    const updatedProducts = [...products, newProduct]
    setProducts(updatedProducts)
    // Save to localStorage for user view
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
    setProduct({
      name: '',
      description: '',
      category: '',
      basePrice: 0,
      discountPercent: 0,
      profitPercent: 10,
      gstPercent: 18,
      stock: '',
      image: null,
      imagePreview: null
    })
    addToast('Product added successfully!', 'success')
  }

  const handleDeleteProduct = (id) => {
    const productToDelete = products.find(p => p.id === id)
    if (window.confirm(`Are you sure you want to delete the product: "${productToDelete?.name || id}"?`)) {
      const updatedProducts = products.filter(p => p.id !== id)
      setProducts(updatedProducts)
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
      addToast(`Product "${productToDelete?.name}" has been deleted successfully!`, 'success')
    }
  }

  // Handle edit user access
  const [editingUser, setEditingUser] = useState(null)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [selectedPages, setSelectedPages] = useState([])

  // Handle create user
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    access: ['home', 'products', 'contact']
  })
  const [newUserErrors, setNewUserErrors] = useState({})
  
  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // Validate new user form
  const validateNewUserForm = () => {
    const errors = {}
    if (!newUser.name.trim()) errors.name = 'Name is required'
    if (!newUser.email.trim()) errors.email = 'Email is required'
    else if (!validateEmail(newUser.email)) errors.email = 'Please enter a valid email'
    if (!newUser.password) errors.password = 'Password is required'
    else if (newUser.password.length < 6) errors.password = 'Password must be at least 6 characters'
    setNewUserErrors(errors)
    return Object.keys(errors).length === 0
  }

  const allPages = ['home', 'products', 'contact', 'about', 'blog', 'cart', 'wishlist', 'profile', 'orders']

  // Fetch users from database on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token')
      try {
        const response = await fetch('http://localhost:5000/api/auth/users', {
          headers: {
            'x-auth-token': token
          }
        })
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
  }, [])

  const handleEditUserAccess = (user) => {
    setEditingUser(user)
    // Ensure we have an array for access
    const userAccess = Array.isArray(user.access) ? user.access : allPages
    setSelectedPages(userAccess)
    setShowAccessModal(true)
  }

  const handleSaveUserAccess = async () => {
    if (!editingUser) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${editingUser._id}/access`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ access: selectedPages })
      })
      
      if (response.ok) {
        const updatedUser = await response.json()
        const updatedUsers = users.map(user => 
          user._id === editingUser._id ? updatedUser : user
        )
        setUsers(updatedUsers)
        setShowAccessModal(false)
        setEditingUser(null)
        addToast('User access updated successfully!', 'success')
      } else {
        const data = await response.json()
        addToast(data.message || 'Failed to update user access', 'error')
      }
    } catch (error) {
      console.error('Error updating user access:', error)
      addToast('Error updating user access', 'error')
    }
  }

  const togglePageAccess = (page) => {
    setSelectedPages(prev => 
      prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]
    )
  }

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    // Validate user data with proper validation
    if (!validateNewUserForm()) {
      return
    }
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          phone: newUser.phone,
          role: newUser.role,
          access: newUser.access
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Refresh users list
        const usersResponse = await fetch('http://localhost:5000/api/auth/users', {
          headers: { 'x-auth-token': token }
        })
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData)
        }
        
        // Reset form and close modal
        setNewUser({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'user',
          access: ['home', 'products', 'contact']
        })
        setShowCreateUserModal(false)
        addToast('User created successfully!', 'success')
      } else {
        addToast(data.message || 'Failed to create user', 'error')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      addToast('Error creating user', 'error')
    }
  }

  const handleNewUserInputChange = (e) => {
    const { name, value } = e.target
    setNewUser(prev => ({ ...prev, [name]: value }))
  }

  const toggleNewUserPageAccess = (page) => {
    setNewUser(prev => ({
      ...prev,
      access: prev.access.includes(page) 
        ? prev.access.filter(p => p !== page) 
        : [...prev.access, page]
    }))
  }

  // Handle delete user
  const handleDeleteUser = async (userId, email) => {
    if (email === 'admin@anjalicart.com') {
      addToast('Cannot delete the main admin!', 'warning')
      return
    }
    if (window.confirm(`Are you sure you want to delete user: ${email}?`)) {
      const token = localStorage.getItem('token')
      try {
        const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token
          }
        })
        
        if (response.ok) {
          const updatedUsers = users.filter(u => u._id !== userId)
          setUsers(updatedUsers)
          addToast('User deleted successfully!', 'success')
        } else {
          const data = await response.json()
          addToast(data.message || 'Failed to delete user', 'error')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        addToast('Error deleting user', 'error')
      }
    }
  }
  
  // Open order modal
  const openOrderModal = (order) => {
    setSelectedOrder(order)
    setNewOrderStatus(order.status || '')
    setShowOrderModal(true)
  }
  
  // Handle update order status
  const handleUpdateOrderStatus = (orderId) => {
    if (!newOrderStatus) {
      addToast('Please select a status', 'error')
      return
    }
    
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const timeline = order.timeline || []
        timeline.push({
          status: newOrderStatus,
          date: new Date().toISOString(),
          message: `Order status updated to ${newOrderStatus}`
        })
        return { ...order, status: newOrderStatus, timeline }
      }
      return order
    })
    
    setOrders(updatedOrders)
    localStorage.setItem('userOrders', JSON.stringify(updatedOrders))
    setShowOrderModal(false)
    setSelectedOrder(null)
    setNewOrderStatus('')
    addToast('Order status updated successfully!', 'success')
  }

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product })
    setShowEditModal(true)
  }

  const handleUpdateProduct = (e) => {
    e.preventDefault()
    if (!editingProduct.name || editingProduct.basePrice <= 0) {
      addToast('Please fill in product name and base price', 'error')
      return
    }
    
    const discountAmt = (editingProduct.basePrice * editingProduct.discountPercent) / 100
    const priceAfterDiscount = editingProduct.basePrice - discountAmt
    const gstAmt = (priceAfterDiscount * editingProduct.gstPercent) / 100
    const finalPrice = priceAfterDiscount + gstAmt
    
    const updatedProduct = {
      ...editingProduct,
      finalPrice: Math.round(finalPrice)
    }
    
    setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p))
    setShowEditModal(false)
    setEditingProduct(null)
    addToast('Product updated successfully!', 'success')
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditingProduct({ 
      ...editingProduct, 
      [name]: name.includes('Percent') || name === 'basePrice' || name === 'stock' ? parseFloat(value) || 0 : value 
    })
  }

  const handleEditImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, image: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddToCart = (product) => {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true'
    if (!isLoggedIn) {
      addToast('Please login to add items to cart!', 'warning')
      return
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: Math.round(product.finalPrice),
      image: product.image || product.imagePreview || 'https://via.placeholder.com/60?text=Product',
      category: product.category
    })
    addToast('Product added to cart!', 'success')
  }

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sidebar menu items - Admin Panel focused on User Management
  const menuItems = [
    { id: 'dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { id: 'customers', icon: <FaUsers />, label: 'User Management' },
    { id: 'products', icon: <FaBox />, label: 'Products' },
    { id: 'orders', icon: <FaShoppingBag />, label: 'Orders' },
    { id: 'blogs', icon: <FaFileAlt />, label: 'Blog Posts' },
    { id: 'contacts', icon: <FaCommentDots />, label: 'Contact Messages' },
    { id: 'team', icon: <FaUsersCog />, label: 'Team Members' },
    { id: 'about', icon: <FaInfoCircle />, label: 'About Page' },
    { id: 'analytics', icon: <FaChartLine />, label: 'Analytics' },
    { id: 'chat', icon: <FaCommentDots />, label: 'Chat Support' },
    { id: 'settings', icon: <FaCog />, label: 'Settings' }
  ]
  
  // Chat state
  const [chatMessages, setChatMessages] = useState(() => {
    const stored = localStorage.getItem('chatMessages')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return [
          {
            id: 1,
            text: 'Hello! How can I help you today?',
            sender: 'admin',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    }
    return [
      {
        id: 1,
        text: 'Hello! How can I help you today?',
        sender: 'admin',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]
  })
  const [chatInput, setChatInput] = useState('')

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon"><FaShoppingBag /></span>
            {sidebarOpen && <span className="logo-text">AnJaliCart</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.filter((item, index, self) => index === self.findIndex(i => i.id === item.id)).map(item => (
            <button
              key={item.id}
              className={`sidebar-menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              {sidebarOpen && <span className="menu-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-menu-item">
            <span className="menu-icon">🏠</span>
            {sidebarOpen && <span className="menu-label">Back to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(m => m.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="dashboard-section">
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card" onClick={() => setActiveSection('products')} style={{cursor: 'pointer'}}>
                  <div className="stat-icon blue"><FaBox /></div>
                  <div className="stat-info">
                    <span className="stat-value">{products.length}</span>
                    <span className="stat-label">Total Products</span>
                  </div>
                </div>
                <div className="stat-card" onClick={() => setActiveSection('orders')} style={{cursor: 'pointer'}}>
                  <div className="stat-icon green"><FaShoppingBag /></div>
                  <div className="stat-info">
                    <span className="stat-value">{orders.length}</span>
                    <span className="stat-label">Total Orders</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple">💰</div>
                  <div className="stat-info">
                    <span className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</span>
                    <span className="stat-label">Total Revenue</span>
                  </div>
                </div>
                <div className="stat-card" onClick={() => setActiveSection('customers')} style={{cursor: 'pointer'}}>
                  <div className="stat-icon orange"><FaUsers /></div>
                  <div className="stat-info">
                    <span className="stat-value">{users.length}</span>
                    <span className="stat-label">Total Users</span>
                  </div>
                </div>
                <div className="stat-card" onClick={() => setActiveSection('blogs')} style={{cursor: 'pointer'}}>
                  <div className="stat-icon teal"><FaFileAlt /></div>
                  <div className="stat-info">
                    <span className="stat-value">{blogs.length}</span>
                    <span className="stat-label">Blog Posts</span>
                  </div>
                </div>
                <div className="stat-card" onClick={() => setActiveSection('contacts')} style={{cursor: 'pointer'}}>
                  <div className="stat-icon yellow">📧</div>
                  <div className="stat-info">
                    <span className="stat-value">{contacts.length}</span>
                    <span className="stat-label">Contact Messages</span>
                  </div>
                </div>
                <div className="stat-card" onClick={() => setActiveSection('team')} style={{cursor: 'pointer'}}>
                  <div className="stat-icon pink"><FaUsersCog /></div>
                  <div className="stat-info">
                    <span className="stat-value">{teamMembers.length}</span>
                    <span className="stat-label">Team Members</span>
                  </div>
                </div>
                <div className="stat-card" onClick={() => setActiveSection('chat')} style={{cursor: 'pointer'}}>
                  <div className="stat-icon cyan"><FaCommentDots /></div>
                  <div className="stat-info">
                    <span className="stat-value">{chatSessions.length}</span>
                    <span className="stat-label">Chat Sessions</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Recent Orders</h3>
                  <button className="view-all-btn" onClick={() => setActiveSection('orders')}>View All</button>
                </div>
                <div className="orders-list">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="order-item">
                      <div className="order-info">
                        <span className="order-id">{order.id}</span>
                        <span className="order-user">{order.shippingAddress?.name || order.user?.name || 'Guest'}</span>
                      </div>
                      <div className="order-details">
                        <span className="order-items">{typeof order.items === 'number' ? order.items : Array.isArray(order.items) ? order.items.length : 0} items</span>
                        <span className="order-total">₹{(order.total || 0).toLocaleString('en-IN')}</span>
                        <span className={`order-status ${(order.status || 'pending').toLowerCase()}`}>{order.status || 'Pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>Low Stock Alerts</h3>
                  </div>
                  <div className="low-stock-list">
                    {products.filter(p => p.stock < 20).slice(0, 5).map(p => (
                      <div key={p.id} className="low-stock-item">
                        <img src={p.image} alt={p.name} />
                        <div className="item-info">
                          <span className="item-name">{p.name}</span>
                          <span className="item-stock">{p.stock} left</span>
                        </div>
                      </div>
                    ))}
                    {lowStockCount === 0 && <p className="no-alerts">No low stock items!</p>}
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>Category Distribution</h3>
                  </div>
                  <div className="category-stats">
                    {['Electronics', 'Footwear', 'Fashion', 'Sports'].map(cat => {
                      const count = products.filter(p => p.category === cat).length
                      return (
                        <div key={cat} className="category-item">
                          <span className="category-name">{cat}</span>
                          <div className="category-bar">
                            <div 
                              className="category-fill" 
                              style={{ width: `${(count / products.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="category-count">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          {activeSection === 'products' && (
            <div className="products-section">
              <div className="section-header">
                <h2>All Products ({filteredProducts.length})</h2>
                <button className="btn btn-primary" onClick={() => setActiveSection('add-product')}>
                  ➕ Add Product
                </button>
              </div>
              
              {/* Products Grid with Images - Same as User View */}
              <div className="products-grid-view">
                {filteredProducts.map(product => {
                  const discountAmt = (product.basePrice * product.discountPercent) / 100
                  const priceAfterDiscount = product.basePrice - discountAmt
                  const gstAmt = (priceAfterDiscount * product.gstPercent) / 100
                  const finalProductPrice = priceAfterDiscount + gstAmt
                  
                  return (
                    <div key={product.id || product._id || index} className="product-card-view">
                      <div className="product-image-view">
                        <img src={product.image} alt={product.name} />
                        <span className="category-badge">{product.category}</span>
                        {product.discountPercent > 0 && (
                          <span className="discount-badge">-{product.discountPercent}%</span>
                        )}
                      </div>
                      <div className="product-info-view">
                        <h3>{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                        <div className="product-pricing-view">
                          <span className="original-price">₹{product.basePrice.toLocaleString('en-IN')}</span>
                          <span className="final-price">₹{Math.round(finalProductPrice).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="product-stock-view">
                          <span className={`stock-indicator ${product.stock > 20 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                            {product.stock > 20 ? <><FaCheck /> In Stock</> : product.stock > 0 ? <><FaExclamationTriangle /> Only {product.stock} left</> : <><FaTimes /> Out of Stock</>}
                          </span>
                        </div>
                        <div className="product-actions-view">
                          <button className="action-btn edit" title="Edit" onClick={() => handleEditProduct(product)}>
                            <FaEdit /> Edit
                          </button>
                          <button className="action-btn delete" title="Delete" onClick={() => handleDeleteProduct(product.id)}>
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="no-products">
                  <span className="no-products-icon"><FaBox /></span>
                  <h3>No products found</h3>
                  <p>Try adjusting your search or add new products.</p>
                </div>
              )}
            </div>
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <div className="orders-section">
              <div className="section-header">
                <h2>All Orders ({orders.length})</h2>
                <div className="order-filters">
                  <input 
                    type="text" 
                    placeholder="Search by Order ID or Customer..." 
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="order-search"
                  />
                  <select 
                    value={orderFilterStatus} 
                    onChange={(e) => setOrderFilterStatus(e.target.value)}
                    className="order-status-filter"
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              {orders.length === 0 ? (
                <div className="coming-soon">
                  <span className="coming-soon-icon"><FaBox /></span>
                  <h3>No Orders Yet</h3>
                  <p>Orders placed by customers will appear here.</p>
                </div>
              ) : (
                <div className="orders-table-container">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Subtotal</th>
                        <th>GST</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(order => {
                          const matchesSearch = order.id?.toLowerCase().includes(orderSearchTerm.toLowerCase()) || 
                            order.user?.name?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                            order.shippingAddress?.name?.toLowerCase().includes(orderSearchTerm.toLowerCase())
                          const matchesStatus = orderFilterStatus === 'all' || order.status === orderFilterStatus
                          return matchesSearch && matchesStatus
                        })
                        .map((order, index) => (
                          <tr key={order.id || index}>
                            <td><span className="order-id">{order.id}</span></td>
                            <td>
                              <div className="customer-info">
                                <span className="customer-name">{order.shippingAddress?.name || order.user?.name || 'N/A'}</span>
                                <span className="customer-email">{order.shippingAddress?.email || order.user?.email || ''}</span>
                              </div>
                            </td>
                            <td>{order.items?.length ?? (typeof order.items === 'number' ? order.items : 0)}</td>
                            <td className="price-cell">₹{(order.subtotal || 0).toLocaleString('en-IN')}</td>
                            <td className="price-cell">₹{(order.gst || 0).toLocaleString('en-IN')}</td>
                            <td className="price-cell">₹{(order.total || 0).toLocaleString('en-IN')}</td>
                            <td>
                              <span className={`status-badge ${(order.status || 'pending').toLowerCase()}`}>{order.status || 'Pending'}</span>
                            </td>
                            <td>
                              <span className={`payment-badge ${order.paymentStatus?.toLowerCase() || 'paid'}`}>
                                {order.paymentStatus || 'Paid'}
                              </span>
                            </td>
                            <td>{order.date ? new Date(order.date).toLocaleDateString('en-IN') : 'N/A'}</td>
                            <td>
                              <button 
                                className="action-btn update"
                                onClick={() => openOrderModal(order)}
                                title="Update Status"
                              >
                                <FaEdit /> Update
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Order Status Update Modal */}
          {showOrderModal && selectedOrder && (
            <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
              <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Update Order Status</h3>
                <div className="modal-order-info">
                  <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                  <p><strong>Customer:</strong> {selectedOrder.shippingAddress?.name || selectedOrder.user?.name}</p>
                  <p><strong>Current Status:</strong> <span className={`status-badge ${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</span></p>
                </div>
                <div className="status-update-form">
                  <label>Select New Status:</label>
                  <select 
                    value={newOrderStatus} 
                    onChange={(e) => setNewOrderStatus(e.target.value)}
                    className="status-select"
                  >
                    <option value="">Select Status...</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowOrderModal(false)}>Cancel</button>
                  <button className="btn-update" onClick={() => handleUpdateOrderStatus(selectedOrder.id)}>Update Status</button>
                </div>
              </div>
            </div>
          )}

          {/* User Access Edit Modal */}
          {showAccessModal && editingUser && (
            <div className="modal-overlay" onClick={() => setShowAccessModal(false)}>
              <div className="modal-content access-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Edit User Access - {editingUser.name || editingUser.email}</h3>
                <div className="access-form">
                  <label>Select Pages to Allow Access:</label>
                  <div className="pages-grid">
                    {allPages.map(page => (
                      <label key={page} className="page-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedPages.includes(page)}
                          onChange={() => togglePageAccess(page)}
                        />
                        <span className="page-label">{page.charAt(0).toUpperCase() + page.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowAccessModal(false)}>Cancel</button>
                  <button className="btn-update" onClick={handleSaveUserAccess}>Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* Add Product Section */}
          {activeSection === 'add-product' && (
            <div className="add-product-section">
              <div className="section-header">
                <h2>Add New Product</h2>
              </div>
              
              <form className="product-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input type="text" name="name" value={product.name} onChange={handleInputChange} placeholder="Enter product name" required />
                  </div>
                  
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={product.category} onChange={handleInputChange}>
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Sports">Sports</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input type="number" name="stock" value={product.stock || ''} onChange={handleInputChange} placeholder="50" min="0" />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Product Description</label>
                    <textarea name="description" value={product.description} onChange={handleInputChange} placeholder="Enter product description" rows="3" />
                  </div>

                  <div className="form-section-title">💰 Pricing Details</div>
                  
                  <div className="form-group">
                    <label>Base Price (₹) *</label>
                    <input type="number" name="basePrice" value={product.basePrice || ''} onChange={handleInputChange} placeholder="0" min="0" step="0.01" required />
                  </div>
                  
                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input type="number" name="discountPercent" value={product.discountPercent || ''} onChange={handleInputChange} placeholder="0" min="0" max="100" />
                    <span className="field-help">Discount: ₹{discountAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="form-group">
                    <label>Profit Margin (%)</label>
                    <input type="number" name="profitPercent" value={product.profitPercent || ''} onChange={handleInputChange} placeholder="10" min="0" max="100" />
                  </div>
                  
                  <div className="form-group">
                    <label>GST (%)</label>
                    <input type="number" name="gstPercent" value={product.gstPercent || ''} onChange={handleInputChange} placeholder="18" min="0" max="50" />
                    <span className="field-help">GST: ₹{gstAmount.toFixed(2)}</span>
                  </div>

                  <div className="price-summary-card">
                    <h4>Price Breakdown</h4>
                    <div className="summary-row"><span>Base Price:</span><span>₹{product.basePrice.toFixed(2)}</span></div>
                    <div className="summary-row discount"><span>− Discount ({product.discountPercent}%):</span><span>−₹{discountAmount.toFixed(2)}</span></div>
                    <div className="summary-row"><span>Price After Discount:</span><span>₹{priceAfterDiscount.toFixed(2)}</span></div>
                    <div className="summary-row"><span>GST ({product.gstPercent}%):</span><span>₹{gstAmount.toFixed(2)}</span></div>
                    <div className="summary-divider"></div>
                    <div className="summary-row final"><span>Final Price:</span><span>₹{finalPrice.toFixed(2)}</span></div>
                  </div>

                  <div className="form-group">
                    <label>Product Image</label>
                    <div className="image-upload">
                      <input type="file" accept="image/*" onChange={handleImageChange} id="product-image" />
                      <label htmlFor="product-image" className="upload-label">
                        📁 Choose Image
                      </label>
                      {product.imagePreview && (
                        <div className="image-preview">
                          <img src={product.imagePreview} alt="Preview" />
                          <button type="button" onClick={() => setProduct({ ...product, image: null, imagePreview: null })}><FaTimes /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full">
                  ➕ Add Product
                </button>
              </form>
            </div>
          )}

          {/* Customers Section */}
          {activeSection === 'customers' && (
            <div className="customers-section">
              <div className="section-header">
                <h2>Customers ({users.length})</h2>
                <div className="header-actions">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreateUserModal(true)}
                  >
                    ➕ Create User
                  </button>
                  <div className="header-search">
                    <input 
                      type="text" 
                      placeholder="Search customers..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {users.length === 0 ? (
                <div className="coming-soon">
                  <span className="coming-soon-icon"><FaUsers /></span>
                  <h3>No Customers Yet</h3>
                  <p>Customers who register will appear here.</p>
                </div>
              ) : (
                <div className="customers-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Access</th>
                        <th>Registered Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => 
                        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((user, index) => (
                        <tr key={user._id || `user-${index}`}>
                          <td>{user.name || 'N/A'}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td>
                            <span className={`role-badge ${user.role || 'user'}`}>
                              {(user.role || 'user').toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="access-tags">
                              {Array.isArray(user.access) ? user.access.map(page => (
                                <span key={page} className="access-tag">{page}</span>
                              )) : 'N/A'}
                            </div>
                          </td>
                          <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <button 
                              className="action-btn edit"
                              onClick={() => handleEditUserAccess(user)}
                              disabled={user.email === 'admin@anjalicart.com'}
                            >
                              ✏️ Edit Access
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={() => handleDeleteUser(user._id, user.email)}
                              disabled={user.email === 'admin@anjalicart.com'}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div className="analytics-section">
              <div className="section-header">
                <h2>Analytics</h2>
              </div>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-icon blue"><FaShoppingBag /></div>
                  <div className="analytics-info">
                    <span className="analytics-value">{orders.length}</span>
                    <span className="analytics-label">Total Orders</span>
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-icon green"><FaBox /></div>
                  <div className="analytics-info">
                    <span className="analytics-value">{products.length}</span>
                    <span className="analytics-label">Total Products</span>
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-icon orange"><FaUsers /></div>
                  <div className="analytics-info">
                    <span className="analytics-value">{users.length}</span>
                    <span className="analytics-label">Total Users</span>
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-icon purple"><FaShoppingBag /></div>
                  <div className="analytics-info">
                    <span className="analytics-value">₹{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}</span>
                    <span className="analytics-label">Total Revenue</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Support Section */}
          {activeSection === 'chat' && (
            <div className="chat-section">
              <div className="section-header">
                <h2>Chat Support</h2>
              </div>
              <div className="chat-container">
                <div className="chat-messages">
                  {chatMessages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`chat-message ${message.sender}`}
                    >
                      <div className="chat-message-content">
                        <p>{message.text}</p>
                        <span className="chat-message-time">{message.time}</span>
                      </div>
                      {message.sender === 'admin' && (
                        <span className="chat-message-avatar">👤</span>
                      )}
                      {message.sender === 'user' && (
                        <span className="chat-message-avatar"><FaUser /></span>
                      )}
                    </div>
                  ))}
                </div>
                <form className="chat-input" onSubmit={(e) => {
                  e.preventDefault()
                  if (!chatInput.trim()) return

                  const newMessage = {
                    id: chatMessages.length + 1,
                    text: chatInput,
                    sender: 'admin',
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  }

                  const updatedMessages = [...chatMessages, newMessage]
                  setChatMessages(updatedMessages)
                  localStorage.setItem('chatMessages', JSON.stringify(updatedMessages))
                  setChatInput('')
                }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (!chatInput.trim()) return

                        const newMessage = {
                          id: chatMessages.length + 1,
                          text: chatInput,
                          sender: 'admin',
                          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        }

                        const updatedMessages = [...chatMessages, newMessage]
                        setChatMessages(updatedMessages)
                        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages))
                        setChatInput('')
                      }
                    }}
                    placeholder="Type your response..."
                  />
                  <button type="submit" disabled={!chatInput.trim()}>
                    <span>➤</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Settings</h2>
              </div>
              <div className="coming-soon">
                <span className="coming-soon-icon"><FaCog /></span>
                <h3>Settings Coming Soon</h3>
                <p>Configure your store settings, payment methods, and more.</p>
              </div>
            </div>
          )}

          {/* Blog Posts Section */}
          {activeSection === 'blogs' && (
            <div className="blogs-section">
              <div className="section-header">
                <h2>Blog Posts ({blogs.length})</h2>
              </div>
              {blogs.length === 0 ? (
                <div className="coming-soon">
                  <span className="coming-soon-icon"><FaFileAlt /></span>
                  <h3>No Blog Posts Yet</h3>
                  <p>Create blog posts to engage with your customers.</p>
                </div>
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Author</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.filter((blog, index, self) => self.findIndex(b => b._id === blog._id) === index).map((blog, index) => (
                        <tr key={blog._id || index}>
                          <td>{blog.title}</td>
                          <td>{blog.category}</td>
                          <td>{blog.author}</td>
                          <td>{blog.date ? new Date(blog.date).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <span className={`status-badge ${blog.isPublished ? 'active' : 'inactive'}`}>
                              {blog.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Contact Messages Section */}
          {activeSection === 'contacts' && (
            <div className="contacts-section">
              <div className="section-header">
                <h2>Contact Messages ({contacts.length})</h2>
              </div>
              {contacts.length === 0 ? (
                <div className="coming-soon">
                  <span className="coming-soon-icon">📧</span>
                  <h3>No Contact Messages</h3>
                  <p>Customer messages will appear here.</p>
                </div>
              ) : (
                <div className="contacts-grid">
                  {contacts.filter((contact, index, self) => self.findIndex(c => c._id === contact._id) === index).map((contact, index) => (
                    <div key={contact._id || index} className="contact-card">
                      <div className="contact-header">
                        <h3>{contact.name}</h3>
                        <span className={`status-badge ${contact.status || 'pending'}`}>
                          {contact.status || 'pending'}
                        </span>
                      </div>
                      <p className="contact-email">{contact.email}</p>
                      <p className="contact-subject"><strong>Subject:</strong> {contact.subject}</p>
                      <p className="contact-message">{contact.message}</p>
                      <p className="contact-date">
                        {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Team Members Section */}
          {activeSection === 'team' && (
            <div className="team-section">
              <div className="section-header">
                <h2>Team Members ({teamMembers.length})</h2>
              </div>
              {teamMembers.length === 0 ? (
                <div className="coming-soon">
                  <span className="coming-soon-icon"><FaUsersCog /></span>
                  <h3>No Team Members</h3>
                  <p>Add team members to display on your About page.</p>
                </div>
              ) : (
                <div className="team-grid">
                  {teamMembers.map((member, index) => (
                    <div key={member._id || index} className="team-card">
                      <div className="team-emoji">{member.emoji || '👤'}</div>
                      <h3>{member.name}</h3>
                      <p className="team-role">{member.role}</p>
                      <p className="team-bio">{member.bio}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* About Page Section */}
          {activeSection === 'about' && (
            <div className="about-section">
              <div className="section-header">
                <h2>About Page Content</h2>
              </div>
              {aboutContent ? (
                <div className="about-content-card">
                  <h3>Our Story</h3>
                  <p>{aboutContent.story}</p>
                  {aboutContent.stats && (
                    <div className="about-stats">
                      <div className="stat-item">
                        <span className="stat-number">{aboutContent.stats.happyCustomers}</span>
                        <span className="stat-label">Happy Customers</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{aboutContent.stats.products}</span>
                        <span className="stat-label">Products</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{aboutContent.stats.citiesServed}</span>
                        <span className="stat-label">Cities Served</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="coming-soon">
                  <span className="coming-soon-icon"><FaInfoCircle /></span>
                  <h3>No About Content</h3>
                  <p>Add content to your About page.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="edit-modal-overlay" onClick={() => setShowCreateUserModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2><FaPlus /> Create User</h2>
              <button className="modal-close" onClick={() => setShowCreateUserModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="edit-modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={newUser.name}
                      onChange={handleNewUserInputChange}
                      placeholder="Enter user name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email *</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={newUser.email}
                      onChange={handleNewUserInputChange}
                      placeholder="Enter email address"
                      className={newUserErrors.email ? 'input-error' : ''}
                    />
                    {newUserErrors.email && <span className="field-error">{newUserErrors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={newUser.phone}
                      onChange={handleNewUserInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Password *</label>
                    <input 
                      type="password" 
                      name="password" 
                      value={newUser.password}
                      onChange={handleNewUserInputChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Role</label>
                    <select 
                      name="role" 
                      value={newUser.role}
                      onChange={handleNewUserInputChange}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Page Access</label>
                    <div className="access-checkboxes">
                      {allPages.map(page => (
                        <label key={page} className="access-checkbox">
                          <input 
                            type="checkbox" 
                            checked={newUser.access.includes(page)}
                            onChange={() => toggleNewUserPageAccess(page)}
                          />
                          <span className="access-label">{page.charAt(0).toUpperCase() + page.slice(1)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="edit-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="edit-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2><FaEdit /> Edit Product</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleUpdateProduct}>
              <div className="edit-modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input type="text" name="name" value={editingProduct.name} onChange={handleEditInputChange} placeholder="Enter product name" required />
                  </div>
                  
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={editingProduct.category} onChange={handleEditInputChange}>
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Sports">Sports</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Product Description</label>
                    <textarea name="description" value={editingProduct.description || ''} onChange={handleEditInputChange} placeholder="Enter product description" rows="3" />
                  </div>

                  <div className="form-section-title">💰 Pricing Details</div>
                  
                  <div className="form-group">
                    <label>Base Price (₹) *</label>
                    <input type="number" name="basePrice" value={editingProduct.basePrice || ''} onChange={handleEditInputChange} placeholder="0" min="0" step="0.01" required />
                  </div>
                  
                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input type="number" name="discountPercent" value={editingProduct.discountPercent || ''} onChange={handleEditInputChange} placeholder="0" min="0" max="100" />
                  </div>
                  
                  <div className="form-group">
                    <label>GST (%)</label>
                    <input type="number" name="gstPercent" value={editingProduct.gstPercent || ''} onChange={handleEditInputChange} placeholder="18" min="0" max="50" />
                  </div>

                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input type="number" name="stock" value={editingProduct.stock || 0} onChange={handleEditInputChange} placeholder="0" min="0" />
                  </div>

                  <div className="form-group">
                    <label>Product Image</label>
                    <div className="image-upload">
                      <input type="file" accept="image/*" onChange={handleEditImageChange} id="edit-product-image" />
                      <label htmlFor="edit-product-image" className="upload-label">
                        📁 Choose Image
                      </label>
                      {editingProduct.image && (
                        <div className="image-preview">
                          <img src={editingProduct.image} alt="Preview" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="edit-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
