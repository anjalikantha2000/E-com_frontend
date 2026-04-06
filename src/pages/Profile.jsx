import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaPhone, FaHome, FaMars, FaSignOutAlt, FaEdit, FaSave, FaTimes, FaBox, FaCheck, FaClock, FaMoneyBill, FaCog, FaBell, FaLock, FaMobileAlt, FaCalendarAlt, FaExclamationTriangle, FaTrash } from 'react-icons/fa'
import { useToast } from '../components/Toast'
import { useOrder } from '../context/OrderContext'
import './Profile.css'

function Profile() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { orders } = useOrder()
  const [userOrders, setUserOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  // Check if user is admin
  const isAdmin = () => {
    try {
      const userData = localStorage.getItem('userData')
      if (!userData) return false
      const user = JSON.parse(userData)
      return user?.role === 'admin' || user?.email === 'admin@anjalicart.com'
    } catch (e) {
      console.error('Error parsing userData:', e)
      return false
    }
  }
  
  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true'
    if (!isLoggedIn) {
      navigate('/login')
    }
  }, [navigate])

  // Get user data from localStorage or use defaults
  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem('userData')
      if (stored) {
        const user = JSON.parse(stored)
        // Handle address object - convert to string if it's an object
        let addressStr = '123, Main Street, New Delhi, 110001'
        if (user.address) {
          if (typeof user.address === 'string') {
            addressStr = user.address
          } else if (typeof user.address === 'object') {
            // It's an object with street, city, state, pincode, country
            const parts = []
            if (user.address.street) parts.push(user.address.street)
            if (user.address.city) parts.push(user.address.city)
            if (user.address.state) parts.push(user.address.state)
            if (user.address.pincode) parts.push(user.address.pincode)
            addressStr = parts.join(', ')
          }
        }
        // Only return basic user info, not cart items or other objects
        return {
          name: user.name || localStorage.getItem('userName') || 'John Doe',
          email: user.email || localStorage.getItem('userEmail') || 'user@email.com',
          phone: user.phone || '+91 9876543210',
          address: addressStr,
          gender: user.gender || 'Male',
          joinedDate: user.joinedDate || 'January 2024'
        }
      }
    } catch (e) {
      console.error('Error parsing userData:', e)
    }
    return {
      name: localStorage.getItem('userName') || 'John Doe',
      email: localStorage.getItem('userEmail') || 'user@email.com',
      phone: '+91 9876543210',
      address: '123, Main Street, New Delhi, 110001',
      gender: 'Male',
      joinedDate: 'January 2024'
    }
  }
  
  // User state
  const [user, setUser] = useState(getStoredUser)
  const [editForm, setEditForm] = useState(getStoredUser())
  
  // Load orders from OrderContext
  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]')
    if (orders.length > 0) {
      setUserOrders(orders)
    } else if (storedOrders.length > 0) {
      setUserOrders(storedOrders)
    }
  }, [orders])
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    })
  }
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'delivered'
      case 'delivered': return 'delivered'
      case 'Processing': return 'processing'
      case 'processing': return 'processing'
      case 'Shipped': return 'shipped'
      case 'shipped': return 'shipped'
      case 'Cancelled': return 'cancelled'
      case 'cancelled': return 'cancelled'
      default: return ''
    }
  }
  
  const handleTrackOrder = (order) => {
    setSelectedOrder(selectedOrder?.id === order.id ? null : order)
  }
  
  const handleViewOrder = (order) => {
    navigate('/orders')
  }
  
  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const updatedOrders = userOrders.filter(order => order.id !== orderId)
      setUserOrders(updatedOrders)
      localStorage.setItem('userOrders', JSON.stringify(updatedOrders))
      addToast('Order deleted successfully', 'success')
    }
  }
  
  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    promotionalEmails: false,
    newsletter: true,
    darkMode: false
  })
  
  const handleSettingChange = (key) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }
  
  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    navigate('/')
  }
  
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm({ ...editForm, [name]: value })
  }
  
  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // Validate profile form
  const validateForm = () => {
    if (!editForm.name.trim()) {
      addToast('Please enter your name', 'error')
      return false
    }
    if (!editForm.email.trim()) {
      addToast('Please enter your email', 'error')
      return false
    }
    if (!validateEmail(editForm.email)) {
      addToast('Please enter a valid email address', 'error')
      return false
    }
    return true
  }
  
  const handleSaveProfile = () => {
    if (!validateForm()) return
    
    setUser(editForm)
    localStorage.setItem('userData', JSON.stringify(editForm))
    localStorage.setItem('userName', editForm.name)
    localStorage.setItem('userEmail', editForm.email)
    setIsEditing(false)
    addToast('Profile updated successfully!', 'success')
  }
  
  const handleCancelEdit = () => {
    setEditForm(user)
    setIsEditing(false)
  }

  return (
    <div className="profile-page">
      <section className="page-header">
        <h1><FaUser /> My Profile</h1>
        <p>Manage your account settings and view orders</p>
      </section>
      
      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> My Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FaBox /> Orders ({userOrders.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FaCog /> Settings
        </button>
      </div>
      
      <div className="profile-container">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="profile-card">
              {/* Profile Header with Avatar */}
              <div className="profile-header">
                <div className="profile-avatar">
                  <span className="avatar-initials">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className="profile-info">
                  <h2>{user.name}</h2>
                  <p className="profile-email">{user.email}</p>
                  <p className="profile-joined">Member since {user.joinedDate}</p>
                </div>
              </div>
              
              {/* Profile Fields - View Mode */}
              {!isEditing ? (
                <>
                  <div className="profile-details">
                    <div className="detail-item">
                      <span className="detail-label"><FaUser /> Name</span>
                      <span className="detail-value">{user.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><FaEnvelope /> Email</span>
                      <span className="detail-value">{user.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><FaPhone /> Phone</span>
                      <span className="detail-value">{user.phone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><FaHome /> Address</span>
                      <span className="detail-value">{user.address}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><FaMars /> Gender</span>
                      <span className="detail-value">{user.gender}</span>
                    </div>
                  </div>
                  
                  <div className="profile-actions">
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                      <FaEdit /> Edit Profile
                    </button>
                    <button className="btn btn-outline" onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </>
              ) : (
                /* Edit Mode */
                 <div className="profile-edit-form">
                  <div className="edit-form-grid">
                    <div className="form-group">
                      <label><FaUser /> Full Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={editForm.name} 
                        onChange={handleEditChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label><FaEnvelope /> Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={editForm.email} 
                        onChange={handleEditChange}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="form-group">
                      <label><FaPhone /> Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={editForm.phone} 
                        onChange={handleEditChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="form-group">
                      <label><FaMars /> Gender</label>
                      <select name="gender" value={editForm.gender} onChange={handleEditChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label><FaHome /> Address</label>
                      <textarea 
                        name="address" 
                        value={editForm.address} 
                        onChange={handleEditChange}
                        placeholder="Enter your address"
                        rows="3"
                      />
                    </div>
                  </div>
                  
                  <div className="profile-actions">
                    <button className="btn btn-primary" onClick={handleSaveProfile}>
                      <FaSave /> Save Changes
                    </button>
                    <button className="btn btn-outline" onClick={handleCancelEdit}>
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon"><FaBox /></span>
                <span className="stat-number">{userOrders.length}</span>
                <span className="stat-label">Total Orders</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon"><FaCheck /></span>
                <span className="stat-number">{userOrders.filter(o => o.status === 'delivered' || o.status === 'Delivered').length}</span>
                <span className="stat-label">Delivered</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon"><FaClock /></span>
                <span className="stat-number">{userOrders.filter(o => o.status === 'processing' || o.status === 'Processing').length}</span>
                <span className="stat-label">Processing</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon"><FaMoneyBill /></span>
                <span className="stat-number">₹{userOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0).toLocaleString('en-IN')}</span>
                <span className="stat-label">Total Spent</span>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2><FaBox /> My Orders</h2>
            {userOrders.length === 0 ? (
              <div className="no-orders">
                <p>No orders yet. <Link to="/products">Start shopping</Link></p>
              </div>
            ) : (
              <div className="orders-list">
                {userOrders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-id">
                        <span className="order-label">Order ID</span>
                        <span className="order-value">{order.id}</span>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${getStatusColor(order.status)}`}>{order.status?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <div className="order-body">
                      <div className="order-info">
                        <span><FaCalendarAlt /> {formatDate(order.orderDate)}</span>
                        <span><FaBox /> {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items</span>
                      </div>
                      <div className="order-total">
                        <span className="total-label">Total</span>
                        <span className="total-value">₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    
                    {/* Order Tracking */}
                    {selectedOrder?.id === order.id && (
                      <div className="order-tracking-details">
                        <div className="tracking-items">
                          <h4>Items:</h4>
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="tracking-item">
                              <img src={item.image} alt={item.name} />
                              <div>
                                <span className="item-name">{item.name}</span>
                                <span className="item-qty">Qty: {item.quantity} × ₹{item.price}</span>
                              </div>
                              <span className="item-subtotal">₹{(item.quantity * item.price).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                        {order.shippingAddress && (
                          <div className="shipping-address">
                            <h4>Shipping Address:</h4>
                            <p className="address-name">{order.shippingAddress.name}</p>
                            <div className="address-details">
                              <p>{order.shippingAddress.address}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                            </div>
                            <p className="address-phone"><span>Phone:</span> {order.shippingAddress.phone}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="order-actions">
                      <button className="btn btn-sm btn-outline" onClick={() => handleViewOrder(order)}>View Details</button>
                      <button className="btn btn-sm btn-primary" onClick={() => handleTrackOrder(order)}>
                        {selectedOrder?.id === order.id ? 'Hide Tracking' : 'Track Order'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteOrder(order.id)}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2><FaCog /> Account Settings</h2>
            
            <div className="settings-group">
              <h3><FaBell /> Notifications</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Email Notifications</span>
                  <span className="setting-desc">Receive order updates via email</span>
                </div>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    checked={settings.emailNotifications}
                    onChange={() => handleSettingChange('emailNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">SMS Notifications</span>
                  <span className="setting-desc">Receive order updates via SMS</span>
                </div>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    checked={settings.smsNotifications}
                    onChange={() => handleSettingChange('smsNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Promotional Emails</span>
                  <span className="setting-desc">Receive deals and offers</span>
                </div>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    checked={settings.promotionalEmails}
                    onChange={() => handleSettingChange('promotionalEmails')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="settings-group">
              <h3><FaLock /> Security</h3>
              <div className="security-options">
                <button className="btn btn-outline btn-full"><FaLock /> Change Password</button>
                <button className="btn btn-outline btn-full"><FaMobileAlt /> Two-Factor Authentication</button>
              </div>
            </div>
            
            <div className="settings-group danger-zone">
              <h3><FaExclamationTriangle /> Danger Zone</h3>
              <button className="btn btn-danger btn-full" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
