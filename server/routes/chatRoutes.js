import express from 'express'
import jwt from 'jsonwebtoken'
import Chat from '../models/Chat.js'
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

// Get or create chat session (for users)
router.post('/session', async (req, res) => {
  try {
    const { sessionId, userId } = req.body
    console.log('Chat session request:', { sessionId, userId })
    
    let chat = await Chat.findOne({ sessionId })
    
    if (!chat) {
      chat = new Chat({
        userId: userId || null,
        sessionId,
        messages: [{
          id: 1,
          text: 'Hello! How can I help you today?',
          sender: 'admin',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }]
      })
      await chat.save()
      console.log('New chat session created:', chat._id)
    }
    
    res.json(chat)
  } catch (err) {
    console.error('Chat session error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Send a message (for users)
router.post('/message', async (req, res) => {
  try {
    const { sessionId, userId, text } = req.body
    console.log('Chat message request:', { sessionId, userId, text })
    
    let chat = await Chat.findOne({ sessionId })
    
    if (!chat) {
      chat = new Chat({
        userId: userId || null,
        sessionId,
        messages: []
      })
    }
    
    // Add user message
    const userMessage = {
      id: chat.messages.length + 1,
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    chat.messages.push(userMessage)
    chat.lastMessage = text
    chat.lastMessageTime = new Date()
    
    // Generate admin response (simulated)
    const responses = [
      'I will check that for you.',
      'Thank you for your question. Let me assist you.',
      'That sounds interesting. Tell me more.',
      'I understand. Let me help you with that.',
      'Please provide more details so I can assist better.',
      'Our team will get back to you shortly.',
      'You can find more information on our products page.',
      'Is there anything else I can help you with?'
    ]
    
    const adminMessage = {
      id: chat.messages.length + 1,
      text: responses[Math.floor(Math.random() * responses.length)],
      sender: 'admin',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    chat.messages.push(adminMessage)
    
    await chat.save()
    console.log('Chat saved with message, total messages:', chat.messages.length)
    
    res.json({ userMessage, adminMessage })
  } catch (err) {
    console.error('Chat message error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get chat by session ID
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ sessionId: req.params.sessionId })
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }
    res.json(chat)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all chats (admin only)
router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const chats = await Chat.find({ isActive: true })
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 })
    res.json(chats)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all chat sessions for admin (including inactive)
router.get('/sessions', auth, adminAuth, async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('userId', 'name email')
      .select('sessionId messages lastMessage lastMessageTime isActive createdAt updatedAt')
      .sort({ updatedAt: -1 })
    res.json(chats)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin replies to a chat
router.post('/reply', auth, adminAuth, async (req, res) => {
  try {
    const { sessionId, text } = req.body
    
    const chat = await Chat.findOne({ sessionId })
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }
    
    const adminMessage = {
      id: chat.messages.length + 1,
      text,
      sender: 'admin',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    chat.messages.push(adminMessage)
    chat.lastMessage = text
    chat.lastMessageTime = new Date()
    
    await chat.save()
    
    res.json(adminMessage)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Close a chat session (admin)
router.put('/close/:sessionId', auth, adminAuth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ sessionId: req.params.sessionId })
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }
    
    chat.isActive = false
    await chat.save()
    
    res.json(chat)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete a chat (admin)
router.delete('/:sessionId', auth, adminAuth, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ sessionId: req.params.sessionId })
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }
    
    res.json({ message: 'Chat deleted' })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
