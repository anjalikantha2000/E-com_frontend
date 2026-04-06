// Payment Gateway Integration Service

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Razorpay key will be loaded dynamically from backend
let razorpayKeyId = ''

// Set Razorpay key from external source (e.g., CartPage)
export const setRazorpayKey = (key) => {
  razorpayKeyId = key
}

// Get Razorpay key
export const getRazorpayKey = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/key`)
    const data = await response.json()
    razorpayKeyId = data.key
    if (data.isConfigured) {
      console.log('✅ Razorpay is CONFIGURED and ready for real payments')
    } else {
      console.log('⚠️ Razorpay is in MOCK mode')
    }
    return data.key
  } catch (error) {
    console.error('Failed to get Razorpay key:', error)
    return razorpayKeyId
  }
}

// Payment Status Enum
export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded'
}

// Payment Methods
export const PaymentMethods = {
  CARD: 'card',
  UPI: 'upi',
  NET_BANKING: 'netbanking',
  WALLET: 'wallet',
  COD: 'cod',
  RAZORPAY: 'razorpay'
}

// Create Razorpay Order (using backend)
export const createRazorpayOrder = async (amount, currency = 'INR') => {
  try {
    // Ensure amount is in paise (Razorpay expects amount in paise)
    const amountInPaise = Math.round(amount * 100)
    
    const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: amountInPaise, currency })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create order')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Razorpay order creation failed:', error)
    throw error
  }
}

// Initialize Razorpay Payment
export const initRazorpayPayment = (options) => {
  return new Promise(async (resolve, reject) => {
    // Get the Razorpay key if not already loaded
    let key = razorpayKeyId
    if (!key) {
      key = await getRazorpayKey()
    }
    
    // Check if using mock mode (placeholder keys)
    if (!key || key === 'rzp_test_your_key_id' || !key.startsWith('rzp_')) {
      // Mock mode - simulate successful payment
      console.log('⚠️ Using mock payment mode (Razorpay not configured)')
      setTimeout(() => {
        resolve({
          success: true,
          paymentId: `mock_pay_${Date.now()}`,
          orderId: options.orderId,
          signature: `mock_sig_${Date.now()}`
        })
      }, 1500)
      return
    }
    
    // Real Razorpay mode
    console.log('💳 Using REAL Razorpay payment gateway')
    
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      // Load Razorpay script dynamically
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        openRazorpay(key, options, resolve, reject)
      }
      script.onerror = () => reject(new Error('Failed to load Razorpay'))
      document.body.appendChild(script)
    } else {
      openRazorpay(key, options, resolve, reject)
    }
  })
}

const openRazorpay = (key, options, resolve, reject) => {
  // Ensure amount is in paise
  const amountInPaise = Math.round(options.amount * 100)
  
  const rzp = window.Razorpay({
    key: key,
    amount: amountInPaise,
    currency: options.currency || 'INR',
    name: options.name || 'AnJaliCart',
    description: options.description || 'Order Payment',
    image: options.image || '/logo.png',
    order_id: options.orderId,
    handler: (response) => {
      resolve({
        success: true,
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature
      })
    },
    prefill: {
      name: options.customerName,
      email: options.customerEmail,
      contact: options.customerPhone
    },
    theme: {
      color: '#667eea'
    },
    modal: {
      ondismiss: () => {
        reject(new Error('Payment cancelled by user'))
      }
    }
  })
  
  rzp.on('payment.failed', (response) => {
    reject({
      success: false,
      error: response.error.description,
      code: response.error.code
    })
  })
  
  rzp.open()
}

// Stripe Payment Intent
export const createStripePaymentIntent = async (amount, currency = 'inr') => {
  try {
    // In production, this should be done on your backend
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency })
    })
    return await response.json()
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error)
    throw error
  }
}

// Simulate Payment (For Demo)
export const simulatePayment = (amount, paymentMethod) => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // 90% success rate for simulation
      if (Math.random() > 0.1) {
        resolve({
          success: true,
          transactionId: `TXN${Date.now()}`,
          amount,
          paymentMethod,
          timestamp: new Date().toISOString()
        })
      } else {
        reject({
          success: false,
          error: 'Payment failed. Please try again.',
          code: 'PAYMENT_FAILED'
        })
      }
    }, 2000)
  })
}

// Validate Payment Response
export const validatePaymentResponse = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/verify-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
    })
    const data = await response.json()
    if (data.success) {
      return { valid: true, message: 'Payment verified successfully' }
    }
    return { valid: false, message: data.message || 'Payment verification failed' }
  } catch (error) {
    console.error('Payment verification error:', error)
    return { valid: false, message: 'Payment verification failed' }
  }
}

// Process Refund
export const processRefund = async (transactionId, amount, reason) => {
  try {
    // In production, this should be done on your backend
    const response = await fetch('/api/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, amount, reason })
    })
    return await response.json()
  } catch (error) {
    console.error('Refund processing failed:', error)
    throw error
  }
}

// Get Payment Status
export const getPaymentStatus = async (transactionId) => {
  try {
    const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]')
    const order = existingOrders.find(o => o.id === transactionId)
    return order?.paymentStatus || PaymentStatus.FAILED
  } catch (error) {
    console.error('Failed to get payment status:', error)
    return PaymentStatus.FAILED
  }
}

export default {
  PaymentStatus,
  PaymentMethods,
  setRazorpayKey,
  getRazorpayKey,
  createRazorpayOrder,
  initRazorpayPayment,
  createStripePaymentIntent,
  simulatePayment,
  validatePaymentResponse,
  processRefund,
  getPaymentStatus
}
