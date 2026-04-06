import express from 'express'
import jwt from 'jsonwebtoken'
import TeamMember from '../models/TeamMember.js'
import BlogPost from '../models/BlogPost.js'
import Contact from '../models/Contact.js'
import About from '../models/About.js'

const router = express.Router()

// Middleware to verify JWT token (optional for public routes)
const optionalAuth = (req, res, next) => {
  const token = req.header('x-auth-token')
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
    } catch (err) {
      // Token invalid, continue without user
    }
  }
  next()
}

// Middleware to verify admin
const adminAuth = async (req, res, next) => {
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

// ===== TEAM MEMBERS ROUTES =====

// Get all team members
router.get('/team', async (req, res) => {
  try {
    const members = await TeamMember.find({ isActive: true })
    res.json(members)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create team member (admin only)
router.post('/team', adminAuth, async (req, res) => {
  try {
    const { name, role, emoji, bio } = req.body
    const member = new TeamMember({ name, role, emoji, bio })
    await member.save()
    res.json(member)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update team member (admin only)
router.put('/team/:id', adminAuth, async (req, res) => {
  try {
    const { name, role, emoji, bio } = req.body
    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { name, role, emoji, bio },
      { new: true }
    )
    res.json(member)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete team member (admin only)
router.delete('/team/:id', adminAuth, async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id)
    res.json({ message: 'Team member deleted' })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// ===== BLOG POSTS ROUTES =====

// Get all blog posts
router.get('/blogs', async (req, res) => {
  try {
    const posts = await BlogPost.find({ isPublished: true }).sort({ createdAt: -1 })
    res.json(posts)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get blog post by ID
router.get('/blogs/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' })
    }
    res.json(post)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create blog post (admin only)
router.post('/blogs', adminAuth, async (req, res) => {
  try {
    const { title, excerpt, content, category, author, date, readTime, emoji, image, isPublished } = req.body
    const post = new BlogPost({ title, excerpt, content, category, author, date, readTime, emoji, image, isPublished })
    await post.save()
    res.json(post)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update blog post (admin only)
router.put('/blogs/:id', adminAuth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(post)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete blog post (admin only)
router.delete('/blogs/:id', adminAuth, async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id)
    res.json({ message: 'Blog post deleted' })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// ===== CONTACT MESSAGES ROUTES =====

// Submit contact form (public)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    const contact = new Contact({ name, email, subject, message })
    await contact.save()
    res.status(201).json({ message: 'Message sent successfully!' })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all contact messages (admin only)
router.get('/contact', adminAuth, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update contact message status (admin only)
router.put('/contact/:id', adminAuth, async (req, res) => {
  try {
    const { status, reply } = req.body
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, reply },
      { new: true }
    )
    res.json(contact)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete contact message (admin only)
router.delete('/contact/:id', adminAuth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id)
    res.json({ message: 'Message deleted' })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// ===== ABOUT PAGE ROUTES =====

// Get about page content
router.get('/about', async (req, res) => {
  try {
    let about = await About.findOne({ isActive: true })
    if (!about) {
      // Seed default about content
      about = new About({
        story: 'AnJaliCart was founded in 2020 with a simple mission: to make quality products accessible to everyone across India. What started as a small online store has grown into a thriving marketplace trusted by over 500,000 customers.',
        stats: {
          happyCustomers: '500K+',
          products: '50K+',
          citiesServed: '100+',
          averageRating: '4.8★'
        },
        values: [
          { icon: '🎯', title: 'Quality First', description: 'We source only the best products from verified suppliers to ensure you get the highest quality.' },
          { icon: '💚', title: 'Customer Focus', description: 'Your satisfaction is our top priority. We go above and beyond to ensure a great experience.' },
          { icon: '🌱', title: 'Sustainability', description: "We're committed to eco-friendly packaging and sustainable business practices." },
          { icon: '🤝', title: 'Trust & Transparency', description: 'Honest pricing, clear policies, and transparent communication — always.' }
        ]
      })
      await about.save()
    }
    res.json(about)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update about page content (admin only)
router.put('/about', adminAuth, async (req, res) => {
  try {
    const { story, stats, values } = req.body
    let about = await About.findOne()
    if (about) {
      about = await About.findByIdAndUpdate(about._id, { story, stats, values }, { new: true })
    } else {
      about = new About({ story, stats, values })
      await about.save()
    }
    res.json(about)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
