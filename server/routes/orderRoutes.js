import express from 'express'
import jwt from 'jsonwebtoken'
import Order from '../models/Order.js'
import User from '../models/User.js'

const router = express.Router()

// Middleware to verify JWT token
const auth = (req, res, next) => {
  const token = req.header('x-auth-token')
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' })
  }
}

// Middleware to verify admin
const adminAuth = async (req, res, next) => {
  const user = await User.findById(req.user.id)
  if (!user || (user.role !== 'admin' && user.email !== process.env.ADMIN_EMAIL)) {
    return res.status(403).json({ message: 'Access denied. Admin only.' })
  }
  next()
}

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, subtotal, gst, total, paymentMethod } = req.body
    
    // Generate order ID if not provided
    const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9)
    
    const order = new Order({
      orderId,
      user: req.user.id,
      items,
      shippingAddress,
      subtotal: subtotal || 0,
      gst: gst || 0,
      total: total || 0,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'success',
      status: 'confirmed',
      timeline: [{
        status: 'confirmed',
        message: 'Order confirmed',
        date: new Date()
      }]
    })
    
    await order.save()
    res.status(201).json(order)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ orderDate: -1 })
    res.json(orders)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all orders (admin)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ orderDate: -1 })
    res.json(orders)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    // Check if user owns the order or is admin
    const user = await User.findById(req.user.id)
    if (order.user._id.toString() !== req.user.id && 
        user.role !== 'admin' && 
        user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    
    res.json(order)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update order status (admin)
router.put('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body
    
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    order.status = status
    order.timeline.push({
      status,
      message: `Order status updated to ${status}`,
      date: new Date()
    })
    
    // If delivered, set delivery date
    if (status === 'delivered') {
      order.deliveryDate = new Date()
    }
    
    await order.save()
    res.json(order)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update payment status (admin)
router.put('/:id/payment', auth, adminAuth, async (req, res) => {
  try {
    const { paymentStatus } = req.body
    
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    order.paymentStatus = paymentStatus
    order.timeline.push({
      status: order.status,
      message: `Payment status updated to ${paymentStatus}`,
      date: new Date()
    })
    
    await order.save()
    res.json(order)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    
    // Only allow cancellation if not delivered
    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel delivered order' })
    }
    
    order.status = 'cancelled'
    order.paymentStatus = 'refunded'
    order.timeline.push({
      status: 'cancelled',
      message: 'Order cancelled by customer',
      date: new Date()
    })
    
    await order.save()
    res.json(order)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
