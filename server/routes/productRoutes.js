import express from 'express'
import jwt from 'jsonwebtoken'
import Product from '../models/Product.js'
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

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
    res.json(products)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create product (admin)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update product (admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete product (admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    
    await product.deleteOne()
    res.json({ message: 'Product deleted' })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ 
      category: req.params.category,
      isActive: true 
    })
    res.json(products)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Search products
router.get('/search/:query', async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: req.params.query, $options: 'i' } },
        { description: { $regex: req.params.query, $options: 'i' } }
      ],
      isActive: true
    })
    res.json(products)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
