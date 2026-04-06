import mongoose from 'mongoose'

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  readTime: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    default: '📝'
  },
  image: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

const BlogPost = mongoose.model('BlogPost', blogPostSchema)

export default BlogPost
