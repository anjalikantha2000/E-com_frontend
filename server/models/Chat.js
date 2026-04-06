import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for guest users
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [{
    id: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['user', 'admin'],
      required: true
    },
    time: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for faster queries
chatSchema.index({ sessionId: 1 })
chatSchema.index({ userId: 1 })
chatSchema.index({ updatedAt: -1 })

const Chat = mongoose.model('Chat', chatSchema)

export default Chat
