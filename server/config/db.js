import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
  try {
    // Use MongoDB URI from environment variables
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/anjalicart'
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    console.log(`✅ MongoDB Connected: ${mongoUri}`)
    return true
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    console.log('Please make sure MongoDB is running or update MONGODB_URI in .env file')
    console.log('The server will continue without database connection...')
    return false
  }
}

export default connectDB
