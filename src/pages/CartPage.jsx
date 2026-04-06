import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useOrder, OrderStatus, PaymentStatus } from '../context/OrderContext'
import { useToast } from '../components/Toast'
import { FaShoppingCart, FaTrash, FaHeart, FaRegHeart, FaMinus, FaPlus, FaTimes, FaArrowLeft, FaCheck, FaCreditCard, FaUniversity, FaMobileAlt } from 'react-icons/fa'
import { getRazorpayKey, validatePaymentResponse, createRazorpayOrder, initRazorpayPayment } from '../services/paymentService'
import './CartPage.css'

const GST_RATE = 18 // 18% GST

const isLoggedIn = () => localStorage.getItem('userLoggedIn') === 'true'

const getStoredUser = () => {
  const userStr = localStorage.getItem('userData')
  if (!userStr) {
    return { name: '', email: '', phone: '', street: '', city: '', state: '', pincode: '' }
  }
  const user = JSON.parse(userStr)
  
  // Handle address object from registration
  let street = '', city = '', state = '', pincode = ''
  if (user.address) {
    if (typeof user.address === 'string') {
      street = user.address
    } else if (typeof user.address === 'object') {
      street = user.address.street || ''
      city = user.address.city || ''
      state = user.address.state || ''
      pincode = user.address.pincode || ''
    }
  }
  
  return {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: street,
    city: city,
    state: state,
    pincode: pincode
  }
}

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart()
  const { addToWishlist, wishlistItems } = useWishlist()
  const { createOrder } = useOrder()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState('cart')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [orderId, setOrderId] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [savedForLater, setSavedForLater] = useState([])
  const [deliveryAddress, setDeliveryAddress] = useState(getStoredUser())
  const [email, setEmail] = useState(getStoredUser().email || '')
  const [emailError, setEmailError] = useState('')
  const [addressErrors, setAddressErrors] = useState({})
  const [addressTouched, setAddressTouched] = useState({})
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay')
  const [razorpayKey, setRazorpayKey] = useState('')
  const [razorpayLoading, setRazorpayLoading] = useState(false)
  
  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (emailError) {
      setEmailError('')
    }
  }

  // Load Razorpay key
  useEffect(() => {
    const loadRazorpayKey = async () => {
      const key = await getRazorpayKey()
      setRazorpayKey(key)
    }
    loadRazorpayKey()
  }, [])
  
  const validateAddressForm = () => {
    if (!deliveryAddress.name) return 'Please enter your name'
    if (!deliveryAddress.phone) return 'Please enter your phone number'
    if (!email) return 'Please enter your email'
    if (!validateEmail(email)) return 'Please enter a valid email address'
    if (!deliveryAddress.address) return 'Please enter your address'
    if (!deliveryAddress.city) return 'Please enter your city'
    if (!deliveryAddress.state) return 'Please enter your state'
    if (!deliveryAddress.pincode) return 'Please enter your pincode'
    return null
  }
  
  // Individual field validation
  const validateField = (field, value) => {
    switch(field) {
      case 'name':
        if (!value || !value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        return ''
      case 'phone':
        if (!value) return 'Phone number is required'
        if (!/^[6-9]\d{9}$/.test(value.replace(/\s/g, ''))) return 'Enter a valid 10-digit mobile number'
        return ''
      case 'email':
        if (!value) return 'Email is required'
        if (!validateEmail(value)) return 'Please enter a valid email address'
        return ''
      case 'address':
        if (!value || !value.trim()) return 'Address is required'
        if (value.trim().length < 10) return 'Please enter a complete address (min 10 characters)'
        return ''
      case 'city':
        if (!value || !value.trim()) return 'City is required'
        return ''
      case 'state':
        if (!value || !value.trim()) return 'State is required'
        return ''
      case 'pincode':
        if (!value) return 'Pincode is required'
        if (!/^\d{6}$/.test(value)) return 'Enter a valid 6-digit pincode'
        return ''
      default:
        return ''
    }
  }
  
  const handleFieldBlur = (field) => {
    setAddressTouched({ ...addressTouched, [field]: true })
    const error = validateField(field, deliveryAddress[field])
    setAddressErrors({ ...addressErrors, [field]: error })
  }
  
  const handleFieldChange = (field, value) => {
    setDeliveryAddress({ ...deliveryAddress, [field]: value })
    if (addressTouched[field]) {
      const error = validateField(field, value)
      setAddressErrors({ ...addressErrors, [field]: error })
    }
  }
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [upiId, setUpiId] = useState('')
  const [selectedBank, setSelectedBank] = useState('')

  // Banks for Net Banking
  const banks = [
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'yesbank', name: 'Yes Bank' },
    { id: 'kotak', name: 'Kotak Bank' },
    { id: 'pnb', name: 'Punjab National Bank' },
    { id: 'bob', name: 'Bank of Baroda' }
  ]

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const gstAmount = (cartTotal * GST_RATE) / 100
  const deliveryCharge = cartTotal >= 499 ? 0 : 49
  const finalTotal = cartTotal + gstAmount + deliveryCharge

  const isInWishlist = (productId) => wishlistItems.some(item => item.id === productId)

  const handleSaveForLater = (item) => {
    if (!isInWishlist(item.id)) {
      addToWishlist(item)
    }
    removeFromCart(item.id)
    setSavedForLater([...savedForLater, item])
  }

  const handleMoveToCart = (item) => {
    setSavedForLater(savedForLater.filter(i => i.id !== item.id))
  }

  // Auto-login and proceed to checkout
  const handleAutoLoginCheckout = () => {
    localStorage.setItem('userLoggedIn', 'true')
    setShowLoginPrompt(false)
    setCheckoutStep('address')
  }

  // Empty Cart View
  if (cartItems.length === 0 && checkoutStep === 'cart') {
    return (
      <div className="flipkart-cart-page">
        <div className="flipkart-cart-header">
          <Link to="/" className="flipkart-logo">
            <span className="flipkart-logo-text">anjali</span><span className="flipkart-logo-text2">cart</span>
          </Link>
        </div>
        <div className="flipkart-cart-content">
          <div className="flipkart-empty-cart">
            <div className="flipkart-empty-cart-image">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" fill="#fff"/>
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" fill="#fff"/>
                <path d="M1 1H5L7.68 14.39C7.77 14.85 8.02 15.27 8.38 15.57C8.74 15.87 9.19 16.02 9.66 16H19.4C19.87 16.02 20.32 15.87 20.68 15.57C21.04 15.27 21.29 14.85 21.38 14.39L23 6H6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>You have no items in your shopping cart</p>
            <Link to="/products" className="flipkart-shop-now-btn">Shop now</Link>
          </div>
        </div>
      </div>
    )
  }

  const handleCheckout = () => { 
    if (!isLoggedIn()) { 
      setShowLoginPrompt(true) 
    } else {
      setCheckoutStep('address')
    } 
  }
  
  const handleAddressSubmit = (e) => {
    e.preventDefault()
    
    // Mark all fields as touched
    const allTouched = {
      name: true,
      phone: true,
      email: true,
      address: true,
      city: true,
      state: true,
      pincode: true
    }
    setAddressTouched(allTouched)
    
    // Validate all fields
    const errors = {
      name: validateField('name', deliveryAddress.name),
      phone: validateField('phone', deliveryAddress.phone),
      email: validateField('email', email),
      address: validateField('address', deliveryAddress.address),
      city: validateField('city', deliveryAddress.city),
      state: validateField('state', deliveryAddress.state),
      pincode: validateField('pincode', deliveryAddress.pincode)
    }
    setAddressErrors(errors)
    
    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error)
    if (hasErrors) {
      addToast('Please fix the errors in the form', 'error')
      return
    }
    
    localStorage.setItem('userData', JSON.stringify(deliveryAddress))
    setCheckoutStep('payment')
  }
  
  const handlePayment = async () => {
    // Handle Razorpay payment
    if (selectedPaymentMethod === 'razorpay') {
      setRazorpayLoading(true)
      try {
        setPaymentStatus('processing')
        
        // Create Razorpay order
        const orderResponse = await createRazorpayOrder(finalTotal, 'INR')
        
        if (!orderResponse.success || !orderResponse.orderId) {
          throw new Error('Failed to create payment order')
        }
        
        // Open Razorpay payment modal
        const paymentResponse = await initRazorpayPayment({
          amount: finalTotal,
          currency: 'INR',
          orderId: orderResponse.orderId,
          name: 'AnJaliCart',
          description: 'Order Payment',
          customerName: deliveryAddress.name,
          customerEmail: email,
          customerPhone: deliveryAddress.phone
        })
        
        if (paymentResponse.success) {
          // Verify payment signature before creating order
          const verificationResult = await validatePaymentResponse(
            orderResponse.orderId,
            paymentResponse.paymentId,
            paymentResponse.signature
          )
          
          if (!verificationResult.valid) {
            throw new Error(verificationResult.message || 'Payment verification failed')
          }
          
          // Payment verified - create order
          const newOrder = createOrder({
            userEmail: email || deliveryAddress.email,
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image
            })),
            shippingAddress: deliveryAddress,
            subtotal: cartTotal,
            discount: 0,
            deliveryCharge: deliveryCharge,
            gst: gstAmount,
            total: finalTotal,
            paymentMethod: 'razorpay',
            paymentId: paymentResponse.paymentId,
            razorpayOrderId: orderResponse.orderId
          })
          
          setPaymentStatus('success')
          setOrderId(newOrder.id)
          setCheckoutStep('success')
          clearCart()
          addToast('Payment successful! Order placed.', 'success')
        }
      } catch (error) {
        console.error('Razorpay payment error:', error)
        setPaymentStatus('pending')
        if (error.message !== 'Payment cancelled by user') {
          addToast(error.message || 'Payment failed. Please try again.', 'error')
        }
      } finally {
        setRazorpayLoading(false)
      }
      return
    }
    
    // Validate payment details for other methods
    if (selectedPaymentMethod === 'card') {
      if (cardDetails.number.length < 16 || cardDetails.name.length < 2 || cardDetails.expiry.length < 4 || cardDetails.cvv.length < 3) {
        addToast('Please enter valid card details', 'error')
        return
      }
    } else if (selectedPaymentMethod === 'upi') {
      if (!upiId.includes('@')) {
        addToast('Please enter a valid UPI ID', 'error')
        return
      }
    } else if (selectedPaymentMethod === 'netbanking') {
      if (!selectedBank) {
        addToast('Please select your bank', 'error')
        return
      }
    }
    
    const orderInfo = {
      subtotal: cartTotal,
      gst: gstAmount,
      deliveryCharge: deliveryCharge,
      total: finalTotal,
      items: totalItems,
      cartItems: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      date: new Date().toISOString(),
      address: deliveryAddress,
      email: email,
      paymentMethod: selectedPaymentMethod
    }
    setOrderDetails(orderInfo)
    setPaymentStatus('processing')
    
    setTimeout(() => {
      const newOrder = createOrder({
        userEmail: email || deliveryAddress.email,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: deliveryAddress,
        subtotal: cartTotal,
        discount: 0,
        deliveryCharge: deliveryCharge,
        gst: gstAmount,
        total: finalTotal,
        paymentMethod: selectedPaymentMethod
      })
      
      setPaymentStatus('success')
      setOrderId(newOrder.id)
      setCheckoutStep('success')
      clearCart()
    }, 3000)
  }

  const handleLogin = () => { 
    localStorage.setItem('userLoggedIn', 'true') 
    setShowLoginPrompt(false) 
    setCheckoutStep('address') 
  }

  // Success View
  if (checkoutStep === 'success' && paymentStatus === 'success') {
    return (
      <div className="flipkart-cart-page">
        <div className="flipkart-cart-header">
          <Link to="/" className="flipkart-logo">
            <span className="flipkart-logo-text">anjali</span><span className="flipkart-logo-text2">cart</span>
          </Link>
        </div>
        <div className="flipkart-back-button">
          <button onClick={() => setCheckoutStep('cart')} className="flipkart-back-btn">
            ← Back to Cart
          </button>
        </div>
        <div className="flipkart-cart-content">
          <div className="flipkart-payment-success">
            <div className="flipkart-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Order Placed Successfully!</h2>
            <p className="flipkart-success-subtitle">Your order has been confirmed and will be delivered soon</p>
            
            <div className="flipkart-order-summary-box">
              <div className="flipkart-order-header">
                <h3>Order Summary</h3>
                <span className="flipkart-order-id">{orderId}</span>
              </div>
              
              <div className="flipkart-order-items">
                {orderDetails?.cartItems?.map((item, index) => (
                  <div key={index} className="flipkart-order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="flipkart-order-item-info">
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="flipkart-order-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              
              <div className="flipkart-order-price-breakup">
                <div className="flipkart-price-row">
                  <span>Total Item Price</span>
                  <span>₹{orderDetails?.subtotal?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flipkart-price-row">
                  <span>Delivery Fee</span>
                  <span className="flipkart-free">{orderDetails?.deliveryCharge === 0 ? 'FREE' : `₹${orderDetails?.deliveryCharge || 0}`}</span>
                </div>
                <div className="flipkart-price-row">
                  <span>GST (18%)</span>
                  <span>₹{orderDetails?.gst?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flipkart-price-divider"></div>
                <div className="flipkart-price-row flipkart-total-paid">
                  <span>Amount Paid</span>
                  <span>₹{orderDetails?.total?.toLocaleString('en-IN') || 0}</span>
                </div>
              </div>
              
              <div className="flipkart-payment-method-box">
                <span className="flipkart-payment-label">Payment Method:</span>
                <span className="flipkart-payment-value">{selectedPaymentMethod.toUpperCase()}</span>
              </div>
            </div>
            
            <p className="flipkart-delivery-estimate">
              🚚 Estimated delivery: <strong>3-5 business days</strong>
            </p>
            
            <div className="flipkart-success-actions">
              <Link to="/products" className="flipkart-continue-btn">Continue Shopping</Link>
              <Link to="/profile" className="flipkart-view-order-btn">View All Orders</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Processing View
  if (checkoutStep === 'payment' && paymentStatus === 'processing') {
    return (
      <div className="flipkart-cart-page">
        <div className="flipkart-cart-header">
          <Link to="/" className="flipkart-logo">
            <span className="flipkart-logo-text">anjali</span><span className="flipkart-logo-text2">cart</span>
          </Link>
        </div>
        <div className="flipkart-cart-content">
          <div className="flipkart-processing">
            <div className="flipkart-spinner"></div>
            <h2>Processing Payment...</h2>
            <p>Please wait while we process your payment</p>
          </div>
        </div>
      </div>
    )
  }

  // Address Form View
  if (checkoutStep === 'address') {
    return (
      <div className="flipkart-cart-page">
        <div className="flipkart-cart-header">
          <Link to="/" className="flipkart-logo">
            <span className="flipkart-logo-text">anjali</span><span className="flipkart-logo-text2">cart</span>
          </Link>
        </div>
        <div className="flipkart-cart-content">
          <div className="flipkart-address-form-container">
            <div className="flipkart-address-card">
              <div className="flipkart-address-header">
                <div className="flipkart-address-header-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h3>Delivery Address</h3>
                  <p>Please enter your delivery details</p>
                </div>
              </div>
              <form className="flipkart-address-form" onSubmit={handleAddressSubmit}>
                <div className="flipkart-form-row">
                  <div className="flipkart-form-group">
                    <label>Name <span className="required">*</span></label>
                    <input 
                      type="text" 
                      value={deliveryAddress.name} 
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      onBlur={() => handleFieldBlur('name')}
                      placeholder="Enter your full name"
                      className={addressTouched.name && addressErrors.name ? 'input-error' : ''}
                    />
                    {addressTouched.name && addressErrors.name && <span className="field-error">{addressErrors.name}</span>}
                  </div>
                  <div className="flipkart-form-group">
                    <label>Phone Number <span className="required">*</span></label>
                    <input 
                      type="tel" 
                      value={deliveryAddress.phone} 
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      onBlur={() => handleFieldBlur('phone')}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      className={addressTouched.phone && addressErrors.phone ? 'input-error' : ''}
                    />
                    {addressTouched.phone && addressErrors.phone && <span className="field-error">{addressErrors.phone}</span>}
                  </div>
                </div>
                <div className="flipkart-form-group">
                  <label>Address <span className="required">*</span></label>
                  <textarea 
                    value={deliveryAddress.address} 
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    onBlur={() => handleFieldBlur('address')}
                    placeholder="Enter complete address (House No., Street, City)"
                    rows="2"
                    className={addressTouched.address && addressErrors.address ? 'input-error' : ''}
                  />
                  {addressTouched.address && addressErrors.address && <span className="field-error">{addressErrors.address}</span>}
                </div>
                <div className="flipkart-form-row flipkart-form-3col">
                  <div className="flipkart-form-group">
                    <label>City <span className="required">*</span></label>
                    <input 
                      type="text" 
                      value={deliveryAddress.city} 
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      onBlur={() => handleFieldBlur('city')}
                      placeholder="Enter city"
                      className={addressTouched.city && addressErrors.city ? 'input-error' : ''}
                    />
                    {addressTouched.city && addressErrors.city && <span className="field-error">{addressErrors.city}</span>}
                  </div>
                  <div className="flipkart-form-group">
                    <label>State <span className="required">*</span></label>
                    <input 
                      type="text" 
                      value={deliveryAddress.state} 
                      onChange={(e) => handleFieldChange('state', e.target.value)}
                      onBlur={() => handleFieldBlur('state')}
                      placeholder="Enter state"
                      className={addressTouched.state && addressErrors.state ? 'input-error' : ''}
                    />
                    {addressTouched.state && addressErrors.state && <span className="field-error">{addressErrors.state}</span>}
                  </div>
                  <div className="flipkart-form-group">
                    <label>Pincode <span className="required">*</span></label>
                    <input 
                      type="text" 
                      value={deliveryAddress.pincode} 
                      onChange={(e) => handleFieldChange('pincode', e.target.value)}
                      onBlur={() => handleFieldBlur('pincode')}
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                      className={addressTouched.pincode && addressErrors.pincode ? 'input-error' : ''}
                    />
                    {addressTouched.pincode && addressErrors.pincode && <span className="field-error">{addressErrors.pincode}</span>}
                  </div>
                </div>
                <div className="flipkart-form-group">
                  <label>Email <span className="required">*</span></label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={handleEmailChange}
                    onBlur={() => {
                      if (!email) {
                        setEmailError('Email is required')
                      } else if (!validateEmail(email)) {
                        setEmailError('Please enter a valid email address')
                      } else {
                        setEmailError('')
                      }
                    }}
                    placeholder="Enter your email"
                    className={emailError ? 'input-error' : ''}
                  />
                  {emailError && <span className="field-error">{emailError}</span>}
                </div>
                <div className="flipkart-form-actions">
                  <button type="button" className="flipkart-back-btn" onClick={() => setCheckoutStep('cart')}>
                    ← Back
                  </button>
                  <button type="submit" className="flipkart-continue-payment-btn">
                    Deliver Here →
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Payment View
  if (checkoutStep === 'payment') {
    return (
      <div className="flipkart-cart-page">
        <div className="flipkart-cart-header">
          <Link to="/" className="flipkart-logo">
            <span className="flipkart-logo-text">anjali</span><span className="flipkart-logo-text2">cart</span>
          </Link>
        </div>
        <div className="flipkart-back-button">
          <button onClick={() => setCheckoutStep('address')} className="flipkart-back-btn">
            ← Back to Address
          </button>
        </div>
        <div className="flipkart-cart-content">
          <div className="flipkart-payment-container">
            <div className="flipkart-payment-left">
              <div className="flipkart-payment-method-card">
                <h3>Payment Method</h3>
                <div className="flipkart-payment-options">
                  <label className="flipkart-payment-option">
                    <input 
                      type="radio" 
                      name="method" 
                      checked={selectedPaymentMethod === 'razorpay'} 
                      onChange={() => setSelectedPaymentMethod('razorpay')}
                    />
                    Razorpay (Secure Payment)
                  </label>
                  <label className="flipkart-payment-option">
                    <input 
                      type="radio" 
                      name="method" 
                      checked={selectedPaymentMethod === 'card'} 
                      onChange={() => setSelectedPaymentMethod('card')}
                    />
                    Credit / Debit Card
                  </label>
                  <label className="flipkart-payment-option">
                    <input 
                      type="radio" 
                      name="method" 
                      checked={selectedPaymentMethod === 'upi'} 
                      onChange={() => setSelectedPaymentMethod('upi')}
                    />
                    UPI
                  </label>
                  <label className="flipkart-payment-option">
                    <input 
                      type="radio" 
                      name="method" 
                      checked={selectedPaymentMethod === 'netbanking'} 
                      onChange={() => setSelectedPaymentMethod('netbanking')}
                    />
                    Net Banking
                  </label>
                  <label className="flipkart-payment-option">
                    <input 
                      type="radio" 
                      name="method" 
                      checked={selectedPaymentMethod === 'cod'} 
                      onChange={() => setSelectedPaymentMethod('cod')}
                    />
                    Cash on Delivery
                  </label>
                </div>
                
                {/* Razorpay Payment Form */}
                {selectedPaymentMethod === 'razorpay' && (
                  <div className="flipkart-razorpay-form">
                    <div className="razorpay-info">
                      <span className="razorpay-logo">💳</span>
                      <p>Secure payment via Razorpay</p>
                      <div className="razorpay-price-breakdown">
                        <div className="razorpay-price-row">
                          <span>Item Price ({totalItems} items)</span>
                          <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="razorpay-price-row">
                          <span>GST (18%)</span>
                          <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="razorpay-price-row">
                          <span>Delivery</span>
                          <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                        </div>
                        <div className="razorpay-price-divider"></div>
                        <div className="razorpay-price-row razorpay-total">
                          <span>Total Amount</span>
                          <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                    {razorpayLoading && <p className="razorpay-loading">Opening payment gateway...</p>}
                  </div>
                )}
                
                {/* Card Payment Form */}
                {selectedPaymentMethod === 'card' && (
                  <div className="flipkart-card-form">
                    <div className="flipkart-card-inputs">
                      <input 
                        type="text" 
                        placeholder="Card Number" 
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                        className="flipkart-card-number"
                      />
                      <input 
                        type="text" 
                        placeholder="Name on Card" 
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        className="flipkart-card-name"
                      />
                    </div>
                    <div className="flipkart-card-expiry-cvv">
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                        className="flipkart-card-expiry"
                      />
                      <input 
                        type="password" 
                        placeholder="CVV" 
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                        className="flipkart-card-cvv"
                      />
                    </div>
                    <div className="flipkart-card-icons">
                      <span className="flipkart-card-icon">💳 Visa</span>
                      <span className="flipkart-card-icon">💳 Mastercard</span>
                      <span className="flipkart-card-icon">💳 RuPay</span>
                    </div>
                  </div>
                )}
                
                {/* UPI Payment Form */}
                {selectedPaymentMethod === 'upi' && (
                  <div className="flipkart-upi-form">
                    <input 
                      type="text" 
                      placeholder="Enter UPI ID (e.g., mobile@upi)" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="flipkart-upi-input"
                    />
                    <p className="flipkart-upi-hint">Use your UPI app to complete payment</p>
                  </div>
                )}
                
                {/* Net Banking Form */}
                {selectedPaymentMethod === 'netbanking' && (
                  <div className="flipkart-bank-form">
                    <select 
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="flipkart-bank-select"
                    >
                      <option value="">Select Your Bank</option>
                      {banks.map(bank => (
                        <option key={bank.id} value={bank.id}>{bank.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* COD Info */}
                {selectedPaymentMethod === 'cod' && (
                  <div className="flipkart-cod-info">
                    <p>Pay cash when you receive your order</p>
                    <p className="flipkart-cod-charges">Cash on Delivery charges: ₹{deliveryCharge > 0 ? deliveryCharge : 0}</p>
                  </div>
                )}
              </div>
              <div className="flipkart-address-review-card">
                <h3>Delivery Address</h3>
                <p><strong>{deliveryAddress.name}</strong></p>
                <p>{deliveryAddress.address}, {deliveryAddress.city}</p>
                <p>{deliveryAddress.state} - {deliveryAddress.pincode}</p>
                <p>Phone: {deliveryAddress.phone}</p>
                <button className="flipkart-change-address" onClick={() => setCheckoutStep('address')}>Change</button>
              </div>
            </div>
            <div className="flipkart-payment-right">
              <div className="flipkart-price-card">
                <h3>Price Details</h3>
                <div className="flipkart-price-rows">
                  <div className="flipkart-price-row">
                    <span>Price ({totalItems} items)</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flipkart-price-row">
                    <span>GST (18%)</span>
                    <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flipkart-price-row">
                    <span>Delivery</span>
                    <span>{deliveryCharge === 0 ? <span className="flipkart-free">FREE</span> : `₹${deliveryCharge}`}</span>
                  </div>
                  <div className="flipkart-price-divider"></div>
                  <div className="flipkart-price-row flipkart-total">
                    <span>Total Amount</span>
                    <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <button 
                  className="flipkart-place-order-btn" 
                  onClick={handlePayment}
                  disabled={razorpayLoading || paymentStatus === 'processing'}
                >
                  {razorpayLoading ? 'Processing...' : paymentStatus === 'processing' ? 'Processing Payment...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Cart View - Flipkart Style
  return (
    <div className="flipkart-cart-page">
      <div className="flipkart-cart-header">
        <Link to="/" className="flipkart-logo">
          <span className="flipkart-logo-text">anjali</span><span className="flipkart-logo-text2">cart</span>
        </Link>
        <div className="flipkart-cart-icons">
          <Link to="/cart" className="flipkart-cart-icon-btn">
            <FaShoppingCart />
            <span className="flipkart-cart-count">{totalItems}</span>
          </Link>
        </div>
      </div>
      
      <div className="flipkart-back-button">
        <Link to="/products" className="flipkart-back-btn">
          ← Continue Shopping
        </Link>
      </div>
      
      {showLoginPrompt && (
        <div className="flipkart-login-overlay">
          <div className="flipkart-login-prompt">
            <div className="flipkart-prompt-header">
              <h2>Login</h2>
              <p>Get access to your orders, wishlist and recommendations</p>
            </div>
            <div className="flipkart-prompt-actions">
              <button className="flipkart-login-continue-btn" onClick={handleLogin}>
                Login with Email/Mobile
              </button>
              <button className="flipkart-guest-btn" onClick={handleAutoLoginCheckout}>
                Continue as Guest
              </button>
            </div>
            <button className="flipkart-close-prompt" onClick={() => setShowLoginPrompt(false)}><FaTimes /></button>
          </div>
        </div>
      )}
      
      <div className="flipkart-cart-content">
        <div className="flipkart-cart-main-container">
          {/* Cart Left Side - Items */}
          <div className="flipkart-cart-left">
            <div className="flipkart-cart-title-bar">
              <h1>My Cart ({totalItems} items)</h1>
              <div className="flipkart-cart-location">
                <span>Deliver to</span>
                <strong>{deliveryAddress.city || 'Select Location'}</strong>
              </div>
            </div>
            
            <div className="flipkart-cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="flipkart-cart-item">
                  <div className="flipkart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="flipkart-item-details">
                    <h3 className="flipkart-item-name">{item.name}</h3>
                    <p className="flipkart-item-seller">Seller: AnJaliCart</p>
                    <div className="flipkart-item-price">
                      <span className="flipkart-final-price">₹{item.price.toLocaleString('en-IN')}</span>
                      <span className="flipkart-mrp">₹{(Math.round(item.price * 1.2)).toLocaleString('en-IN')}</span>
                      <span className="flipkart-discount-tag">20% off</span>
                    </div>
                    <div className="flipkart-item-actions">
                      <div className="flipkart-quantity-selector">
                        <button 
                          className="flipkart-qty-btn" 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        ><FaMinus /></button>
                        <input 
                          type="number" 
                          className="flipkart-qty-input"
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 1
                            updateQuantity(item.id, Math.min(9999, Math.max(1, qty)))
                          }}
                          min="1"
                          max="9999"
                        />
                        <button 
                          className="flipkart-qty-btn" 
                          onClick={() => updateQuantity(item.id, Math.min(9999, item.quantity + 1))}
                          disabled={item.quantity >= 9999}
                        ><FaPlus /></button>
                      </div>
                      <button 
                        className="flipkart-save-btn" 
                        onClick={() => handleSaveForLater(item)}
                      >
                        <FaHeart style={{marginRight: '5px'}} /> Save for later
                      </button>
                      <button 
                        className="flipkart-remove-btn" 
                        onClick={() => removeFromCart(item.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="flipkart-delivery-estimate">
                    <span className="flipkart-delivery-label">Delivery by</span>
                    <span className="flipkart-delivery-date">Tomorrow</span>
                    <span className="flipkart-delivery-charges">
                      {deliveryCharge === 0 ? <span className="flipkart-free">FREE</span> : `₹${deliveryCharge}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flipkart-cart-footer">
              <button className="flipkart-place-order-btn flipkart-full-width" onClick={handleCheckout}>
                PLACE ORDER
              </button>
            </div>
          </div>
          
          {/* Cart Right Side - Order Summary */}
          <div className="flipkart-cart-right">
            <div className="flipkart-price-details-card">
              <h3>Price Details</h3>
              <div className="flipkart-price-rows">
                <div className="flipkart-price-row">
                  <span>Price ({totalItems} items)</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flipkart-price-row">
                  <span>Delivery</span>
                  <span className="flipkart-free">FREE</span>
                </div>
                <div className="flipkart-price-row">
                  <span>Tax (GST 18%)</span>
                  <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flipkart-price-divider"></div>
                <div className="flipkart-price-row flipkart-total">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="flipkart-safe-secure">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <span>Safe and Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
