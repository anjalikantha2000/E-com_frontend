import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useOrder, OrderStatus, PaymentStatus } from '../context/OrderContext'
import { useToast } from '../components/Toast'
import { FaBox, FaCheck, FaShippingFast } from 'react-icons/fa'
import './OrderHistory.css'

const getStoredUser = () => {
  const user = localStorage.getItem('userData')
  return user ? JSON.parse(user) : null
}

const getStatusColor = (status) => {
  switch (status) {
    case OrderStatus.CONFIRMED: return '#3498db'
    case OrderStatus.PROCESSING: return '#9b59b6'
    case OrderStatus.SHIPPED: return '#e67e22'
    case OrderStatus.OUT_FOR_DELIVERY: return '#1abc9c'
    case OrderStatus.DELIVERED: return '#27ae60'
    case OrderStatus.CANCELLED: return '#e74c3c'
    default: return '#95a5a6'
  }
}

const getPaymentStatusColor = (status) => {
  switch (status) {
    case PaymentStatus.SUCCESS: return '#27ae60'
    case PaymentStatus.PROCESSING: return '#f39c12'
    case PaymentStatus.PENDING: return '#95a5a6'
    case PaymentStatus.FAILED: return '#e74c3c'
    case PaymentStatus.REFUNDED: return '#9b59b6'
    default: return '#95a5a6'
  }
}

const getDeliveryStatus = (status) => {
  switch (status) {
    case OrderStatus.CONFIRMED: return { step: 1, label: 'Order Confirmed', desc: 'Your order has been confirmed' }
    case OrderStatus.PROCESSING: return { step: 2, label: 'Processing', desc: 'Your order is being prepared' }
    case OrderStatus.SHIPPED: return { step: 3, label: 'Shipped', desc: 'Your order has been shipped' }
    case OrderStatus.OUT_FOR_DELIVERY: return { step: 4, label: 'Out for Delivery', desc: 'Your order is out for delivery' }
    case OrderStatus.DELIVERED: return { step: 5, label: 'Delivered', desc: 'Your order has been delivered' }
    case OrderStatus.CANCELLED: return { step: 0, label: 'Cancelled', desc: 'Order has been cancelled' }
    default: return { step: 0, label: 'Unknown', desc: 'Status unknown' }
  }
}

function OrderHistory() {
  const { orders } = useOrder()
  const [userOrders, setUserOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const navigate = useNavigate()
  const { addToast } = useToast()

  useEffect(() => {
    const user = getStoredUser()
    if (!user || !user.email) {
      const storedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]')
      setUserOrders(storedOrders)
    } else {
      const token = localStorage.getItem('token')
      if (token && orders.length > 0) {
        setUserOrders(orders)
      } else {
        const storedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]')
        setUserOrders(storedOrders)
      }
    }
  }, [orders])

  const filteredOrders = filterStatus === 'all' 
    ? userOrders 
    : userOrders.filter(order => order.status === filterStatus)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleTrackOrder = (order) => {
    setSelectedOrder(order)
  }

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      // Update order status locally
      const updatedOrders = userOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.REFUNDED }
          : order
      )
      localStorage.setItem('userOrders', JSON.stringify(updatedOrders))
      setUserOrders(updatedOrders)
      addToast('Order has been cancelled and refund will be processed.', 'success')
    }
  }
  
  // Generate and download invoice
  const handleDownloadInvoice = (order) => {
    const invoiceContent = `
=====================================
       ANJALI CART - INVOICE
=====================================

Invoice No: ${order.id}
Date: ${formatDate(order.orderDate)}

--------------------------------------
BILL TO:
${order.shippingAddress?.name || 'N/A'}
${order.shippingAddress?.email || ''}
${order.shippingAddress?.phone || ''}
${order.shippingAddress?.address || ''}
${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}

--------------------------------------
ITEMS:
${order.items.map((item, index) => `
${index + 1}. ${item.name}
   Qty: ${item.quantity} x ₹${item.price?.toLocaleString('en-IN')} = ₹${((item.quantity || 0) * (item.price || 0)).toLocaleString('en-IN')}`).join('')}

--------------------------------------
SUBTOTAL:     ₹${(order.subtotal || 0).toLocaleString('en-IN')}
GST (18%):    ₹${(order.gst || 0).toLocaleString('en-IN')}
--------------------------------------
TOTAL:        ₹${(order.total || order.totalAmount || 0).toLocaleString('en-IN')}
=====================================

Payment Status: ${order.paymentStatus || 'Paid'}
Order Status: ${order.status?.replace(/_/g, ' ') || 'Confirmed'}

Thank you for shopping with us!
Anjali Cart - Your Trusted E-commerce
=====================================
    `
    
    // Create blob and download
    const blob = new Blob([invoiceContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Invoice_${order.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (userOrders.length === 0) {
    return (
      <div className="order-history-page">
        <section className="page-header">
          <h1>My Orders</h1>
          <p>View and track your order history</p>
        </section>
        <div className="no-orders">
          <div className="no-orders-icon"><FaBox /></div>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="order-history-page">
      <section className="page-header">
        <h1>My Orders</h1>
        <p>View and track your order history</p>
      </section>

      <div className="order-history-container">
        {/* Filter */}
        <div className="order-filters">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Orders</option>
            <option value={OrderStatus.CONFIRMED}>Confirmed</option>
            <option value={OrderStatus.PROCESSING}>Processing</option>
            <option value={OrderStatus.SHIPPED}>Shipped</option>
            <option value={OrderStatus.OUT_FOR_DELIVERY}>Out for Delivery</option>
            <option value={OrderStatus.DELIVERED}>Delivered</option>
            <option value={OrderStatus.CANCELLED}>Cancelled</option>
          </select>
          <span className="order-count">{filteredOrders.length} orders</span>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <span className="label">Order ID:</span>
                  <strong>{order.id}</strong>
                </div>
                <div className="order-date">{formatDate(order.orderDate)}</div>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="item-thumb">
                    <img src={item.image} alt={item.name} />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="more-items">+{order.items.length - 3}</div>
                )}
              </div>

              {/* Individual Items Breakdown */}
              <div className="order-items-breakdown">
                <h4>Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <div className="item-info">
                      <img src={item.image} alt={item.name} className="item-thumb-small" />
                      <div>
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <span className="item-total">₹{((item.quantity || 0) * (item.price || 0)).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <div className="order-total">
                  <span className="label">Total:</span>
                  <span className="amount">₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="order-items-count">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                </div>
                <div className="order-gst">
                  <span className="label">Subtotal:</span>
                  <span className="gst-amount">₹{(order.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="order-gst">
                  <span className="label">GST (18%):</span>
                  <span className="gst-amount">₹{(order.gst || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="order-status-section">
                <div 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div 
                  className="payment-badge"
                  style={{ color: getPaymentStatusColor(order.paymentStatus) }}
                >
                  {order.paymentStatus}
                </div>
              </div>

              <div className="order-actions">
                <button 
                  className="btn btn-outline track-btn"
                  onClick={() => handleTrackOrder(order)}
                >
                  📍 Track Order
                </button>
                <button 
                  className="btn btn-outline invoice-btn"
                  onClick={() => handleDownloadInvoice(order)}
                >
                  📄 Download Invoice
                </button>
                {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED && (
                  <button 
                    className="btn btn-danger cancel-btn"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                )}
                <Link to={`/products`} className="btn btn-outline">
                  Buy Again
                </Link>
              </div>

              {/* Order Tracking Timeline */}
              {selectedOrder?.id === order.id && (
                <div className="order-tracking">
                  {/* Delivery Status Tracker */}
                  {order.status !== OrderStatus.CANCELLED && (
                    <div className="delivery-status-tracker">
                      <h4>🚚 Delivery Status</h4>
                      <div className="delivery-progress">
                        <div className="progress-steps">
                          {[
                            { step: 1, icon: <FaCheck />, label: 'Confirmed' },
                            { step: 2, icon: <FaBox />, label: 'Processing' },
                            { step: 3, icon: <FaShippingFast />, label: 'Shipped' },
                            { step: 4, icon: '🏃', label: 'Out for Delivery' },
                            { step: 5, icon: '🏠', label: 'Delivered' }
                          ].map((item) => {
                            const currentStep = getDeliveryStatus(order.status).step
                            const isCompleted = item.step <= currentStep
                            const isCurrent = item.step === currentStep
                            return (
                              <div 
                                key={item.step} 
                                className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                              >
                                <div className="step-icon">{item.icon}</div>
                                <span className="step-label">{item.label}</span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${((getDeliveryStatus(order.status).step - 1) / 4) * 100}%`,
                              backgroundColor: getStatusColor(order.status)
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="delivery-status-text" style={{ color: getStatusColor(order.status) }}>
                        <strong>{getDeliveryStatus(order.status).label}</strong>
                        <p>{getDeliveryStatus(order.status).desc}</p>
                      </div>
                    </div>
                  )}
                  
                  <h4>Order Timeline</h4>
                  <div className="tracking-timeline">
                    {order.timeline?.map((event, index) => (
                      <div key={index} className="timeline-item">
                        <div 
                          className="timeline-dot" 
                          style={{ backgroundColor: getStatusColor(event.status) }}
                        ></div>
                        <div className="timeline-content">
                          <span className="timeline-status">{event.message}</span>
                          <span className="timeline-date">{formatDate(event.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="shipping-address-section">
                      <h4>Delivery Address</h4>
                      <div className="shipping-address-card">
                        <p className="address-name">{order.shippingAddress.name}</p>
                        <div className="address-details">
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        </div>
                        <p className="address-phone"><span>Phone:</span> {order.shippingAddress.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrderHistory
