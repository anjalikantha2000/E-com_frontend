import mongoose from 'mongoose'

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    default: '👤'
  },
  bio: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

const TeamMember = mongoose.model('TeamMember', teamMemberSchema)

export default TeamMember
