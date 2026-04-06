import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const router = express.Router()

// Check if Razorpay is properly configured
const isRazorpayConfigured = () => {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  return keyId && keySecret && 
         keyId.startsWith('rzp_') && 
         keySecret.length >= 20
}

// Initialize Razorpay instance only if properly configured
let razorpay = null
if (isRazorpayConfigured()) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  })
  console.log('✅ Razorpay Payment Gateway ACTIVE')
  console.log('   Key ID:', process.env.RAZORPAY_KEY_ID)
} else {
  console.log('⚠️ Razorpay in MOCK mode (using test keys)')
}

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    // If Razorpay is not configured, return mock order
    if (!razorpay) {
      const mockOrderId = `mock_order_${Date.now()}`
      return res.json({
        success: true,
        orderId: mockOrderId,
        amount: Math.round(amount),
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        isMock: true
      })
    }

    const options = {
      amount: amount, // Already in paise from frontend
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    }

    const order = await razorpay.orders.create(options)

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    })
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    // Return mock order on error for testing
    const mockOrderId = `mock_order_${Date.now()}`
    res.json({
      success: true,
      orderId: mockOrderId,
      amount: Math.round(req.body.amount || 0),
      currency: req.body.currency || 'INR',
      isMock: true
    })
  }
})

// Verify Razorpay Payment Signature
router.post('/verify-signature', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    // Check if this is a mock payment
    if (razorpay_order_id && razorpay_order_id.startsWith('mock_order_')) {
      // Accept mock payments
      res.json({
        success: true,
        message: 'Payment verified successfully (mock mode)'
      })
      return
    }

    // Create signature verification string
    const signature = razorpay_order_id + '|' + razorpay_payment_id

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_key_secret')
      .update(signature)
      .digest('hex')

    // Verify signature
    const isValidSignature = expectedSignature === razorpay_signature

    if (isValidSignature) {
      res.json({
        success: true,
        message: 'Payment verified successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      })
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(500).json({ 
      error: 'Payment verification failed',
      details: error.message 
    })
  }
})

// Get Razorpay Key (for frontend)
router.get('/key', (req, res) => {
  const key = process.env.RAZORPAY_KEY_ID
  const isConfigured = isRazorpayConfigured()
  res.json({
    key: key,
    isConfigured: isConfigured
  })
})

export default router
