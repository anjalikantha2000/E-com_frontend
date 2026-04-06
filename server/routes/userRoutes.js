import express from 'express'
import jwt from 'jsonwebtoken'
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

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, access, phone, address, gender, adminSecret } = req.body
    
    // Admin secret key validation
    const ADMIN_SECRET_KEY = 'anjalicart_admin_secret_2024'
    if (role === 'admin') {
      if (!adminSecret || adminSecret !== ADMIN_SECRET_KEY) {
        return res.status(400).json({ message: 'Invalid admin secret key' })
      }
    }
    const emailRegex = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email. Only @ and . are allowed. Avoid special characters like #$%^&*()_+!' })
    }
    
    // Check if email contains @ and has proper domain
    if (!email.includes('@') || email.indexOf('@') === 0 || email.indexOf('@') === email.length - 1) {
      return res.status(400).json({ message: 'Please enter a valid email address (e.g., name@gmail.com)' })
    }
    
    // Check if user exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: 'User already exists' })
    }
    
    // Create new user (password will be hashed by pre-save middleware)
    const userAccess = role === 'admin' 
      ? ['home', 'products', 'contact', 'about', 'blog', 'cart', 'wishlist', 'profile', 'orders', 'admin']
      : (access || ['home', 'products', 'contact', 'about', 'blog', 'cart', 'wishlist', 'profile', 'orders'])
    
    user = new User({
      name,
      email,
      password, // bcryptjs will hash this automatically
      phone,
      address,
      gender,
      role: role || 'user',
      access: userAccess
    })
    
    await user.save()
    
    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        access: user.access,
        phone: user.phone,
        address: user.address,
        gender: user.gender
      }
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Check user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    
    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    
    // Update last login
    user.lastLogin = new Date()
    await user.save()
    
    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        access: user.access,
        phone: user.phone,
        address: user.address
      }
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().lean()
    // Remove passwords from response
    const usersWithoutPassword = users.map(u => {
      const user = { ...u }
      delete user.password
      return user
    })
    res.json(usersWithoutPassword)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user by ID
router.get('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password
    res.json(userWithoutPassword)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update user (admin)
router.put('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, role, access, phone, address } = req.body
    
    let user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    const updates = {}
    if (name) updates.name = name
    if (email) updates.email = email
    if (role) updates.role = role
    if (access) updates.access = access
    if (phone) updates.phone = phone
    if (address) updates.address = address
    
    user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete user (admin)
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Prevent deleting admin
    if (user.email === process.env.ADMIN_EMAIL) {
      return res.status(400).json({ message: 'Cannot delete admin user' })
    }
    
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update user access (admin)
router.put('/users/:id/access', auth, adminAuth, async (req, res) => {
  try {
    const { access } = req.body
    
    let user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    user.access = access
    await user.save()
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password
    res.json(userWithoutPassword)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body
    
    let user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    const updates = {}
    if (name) updates.name = name
    if (phone) updates.phone = phone
    if (address) updates.address = address
    
    user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's wishlist
router.get('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user.wishlist)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Add to wishlist
router.post('/wishlist/add', auth, async (req, res) => {
  try {
    const { productId } = req.body
    
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Check if product already in wishlist
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId)
      await user.save()
    }
    
    await user.populate('wishlist')
    res.json(user.wishlist)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Remove from wishlist
router.delete('/wishlist/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params
    
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId)
    await user.save()
    
    await user.populate('wishlist')
    res.json(user.wishlist)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
