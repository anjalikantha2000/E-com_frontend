import express from 'express'
import jwt from 'jsonwebtoken'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

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

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name image price stock')
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [], totalAmount: 0 })
      await cart.save()
    }
    
    res.json(cart)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body
    
    // Get product details
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    
    let cart = await Cart.findOne({ user: req.user.id })
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] })
    }
    
    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    )
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        name: product.name,
        price: product.finalPrice,
        quantity,
        image: product.image
      })
    }
    
    await cart.save()
    
    // Populate product details
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name image price stock')
    
    res.json(cart)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update item quantity
router.put('/update/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body
    
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === req.params.productId
    )
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }
    
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = quantity
    }
    
    await cart.save()
    
    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name image price stock')
    
    res.json(updatedCart)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Remove item from cart
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }
    
    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    )
    
    await cart.save()
    
    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name image price stock')
    
    res.json(updatedCart)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    if (cart) {
      cart.items = []
      cart.totalAmount = 0
      await cart.save()
    }
    
    res.json({ message: 'Cart cleared', cart: null })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
