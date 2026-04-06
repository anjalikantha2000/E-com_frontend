import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import contentRoutes from './routes/contentRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

// Load environment variables
dotenv.config()

// Global flag for database connection
let isDBConnected = false

// Initialize database and seed admin user
const initDB = async () => {
  const connected = await connectDB()
  isDBConnected = connected
  
  if (connected) {
    try {
      const User = (await import('./models/User.js')).default
      const Product = (await import('./models/Product.js')).default
      
      // Seed Admin User
      const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL })
      if (!adminExists) {
        const adminUser = new User({
          name: 'Admin',
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: 'admin',
          access: ['home', 'products', 'contact', 'about', 'blog', 'cart', 'wishlist', 'profile', 'orders', 'admin']
        })
        await adminUser.save()
        console.log('Admin user created successfully!')
      } else {
        console.log('Admin user already exists')
      }
      
      // Seed Default Products
      const productCount = await Product.countDocuments()
      if (productCount === 0) {
        const defaultProducts = [
          { name: 'Wireless Headphones', basePrice: 2499, finalPrice: 2499, category: 'Electronics', rating: 4.5, reviews: 128, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&auto=format', brand: 'SoundMax', description: 'Premium wireless headphones with active noise cancellation.', stock: 45, isActive: true },
          { name: 'Running Shoes', basePrice: 1899, finalPrice: 1899, category: 'Footwear', rating: 4.3, reviews: 95, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&auto=format', brand: 'SportX', description: 'Lightweight running shoes for maximum comfort.', stock: 30, isActive: true },
          { name: 'Leather Handbag', basePrice: 3299, finalPrice: 3299, category: 'Fashion', rating: 4.7, reviews: 210, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop&auto=format', brand: 'LuxeLeather', description: 'Elegant genuine leather handbag.', stock: 18, isActive: true },
          { name: 'Smart Watch', basePrice: 5999, finalPrice: 5999, category: 'Electronics', rating: 4.6, reviews: 175, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop&auto=format', brand: 'TechWear', description: 'Feature-packed smartwatch with health monitoring.', stock: 22, isActive: true },
          { name: 'Yoga Mat', basePrice: 799, finalPrice: 799, category: 'Sports', rating: 4.4, reviews: 88, image: 'https://images.unsplash.com/photo-1601925268008-f5e4c5e5e5e5?w=400&h=300&fit=crop&auto=format', brand: 'ZenFit', description: 'Non-slip premium yoga mat.', stock: 60, isActive: true },
          { name: 'Coffee Maker', basePrice: 2199, finalPrice: 2199, category: 'Home', rating: 4.2, reviews: 64, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&auto=format', brand: 'BrewMaster', description: 'Programmable coffee maker with 12-cup capacity.', stock: 15, isActive: true },
          { name: 'Sunglasses', basePrice: 1299, finalPrice: 1299, category: 'Fashion', rating: 4.1, reviews: 52, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop&auto=format', brand: 'SunStyle', description: 'Stylish UV400 polarized sunglasses.', stock: 40, isActive: true },
          { name: 'Bluetooth Speaker', basePrice: 1799, finalPrice: 1799, category: 'Electronics', rating: 4.5, reviews: 143, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop&auto=format', brand: 'SoundWave', description: '360° surround sound portable speaker.', stock: 28, isActive: true },
          { name: 'Backpack', basePrice: 1499, finalPrice: 1499, category: 'Fashion', rating: 4.3, reviews: 77, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format', brand: 'TravelPro', description: 'Durable 30L backpack with laptop compartment.', stock: 35, isActive: true },
          { name: 'Dumbbells Set', basePrice: 2999, finalPrice: 2999, category: 'Sports', rating: 4.6, reviews: 112, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format', brand: 'IronPower', description: 'Adjustable dumbbell set for home gym.', stock: 20, isActive: true },
          { name: 'Table Lamp', basePrice: 899, finalPrice: 899, category: 'Home', rating: 4.0, reviews: 41, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop&auto=format', brand: 'LumiHome', description: 'Modern LED table lamp.', stock: 50, isActive: true },
          { name: 'Sneakers', basePrice: 2299, finalPrice: 2299, category: 'Footwear', rating: 4.4, reviews: 98, image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=300&fit=crop&auto=format', brand: 'StepEasy', description: 'Trendy casual sneakers.', stock: 25, isActive: true }
        ]
        
        await Product.insertMany(defaultProducts)
        console.log(`✅ Seeded ${defaultProducts.length} default products to MongoDB!`)
      } else {
        console.log(`📦 Database already has ${productCount} products`)
      }
      
      // Seed Team Members
      const TeamMember = (await import('./models/TeamMember.js')).default
      const teamCount = await TeamMember.countDocuments()
      if (teamCount === 0) {
        const defaultTeam = [
          { name: 'Anjali Sharma', role: 'Founder & CEO', emoji: '👩‍💼', bio: 'Visionary leader with 15+ years in e-commerce' },
          { name: 'Rahul Verma', role: 'Head of Technology', emoji: '👨‍💻', bio: 'Tech expert driving innovation' },
          { name: 'Priya Nair', role: 'Marketing Director', emoji: '👩‍🎨', bio: 'Creative strategist with brand expertise' },
          { name: 'Arjun Patel', role: 'Operations Manager', emoji: '👨‍🔧', bio: 'Operations expert ensuring smooth delivery' }
        ]
        await TeamMember.insertMany(defaultTeam)
        console.log(`✅ Seeded ${defaultTeam.length} team members!`)
      }
      
      // Seed Blog Posts
      const BlogPost = (await import('./models/BlogPost.js')).default
      const blogCount = await BlogPost.countDocuments()
      if (blogCount === 0) {
        const defaultBlogs = [
          { title: 'Top 10 Fashion Trends for 2025', excerpt: 'Discover the hottest fashion trends that are taking the world by storm this year.', category: 'Fashion', author: 'Priya Nair', date: 'February 20, 2025', readTime: '5 min read', emoji: '👗', isPublished: true },
          { title: 'How to Choose the Right Smartphone in 2025', excerpt: "With so many options available, picking the right smartphone can be overwhelming.", category: 'Electronics', author: 'Rahul Verma', date: 'February 15, 2025', readTime: '8 min read', emoji: '📱', isPublished: true },
          { title: 'Home Decor Ideas on a Budget', excerpt: 'Transform your living space without breaking the bank.', category: 'Home', author: 'Anjali Sharma', date: 'February 10, 2025', readTime: '6 min read', emoji: '🏠', isPublished: true },
          { title: 'The Ultimate Guide to Fitness Equipment', excerpt: 'Whether you are setting up a home gym or looking to upgrade.', category: 'Sports', author: 'Arjun Patel', date: 'February 5, 2025', readTime: '7 min read', emoji: '💪', isPublished: true },
          { title: 'Smart Shopping: How to Get the Best Deals Online', excerpt: 'Learn the tricks and strategies that savvy shoppers use to save money.', category: 'Shopping Tips', author: 'Priya Nair', date: 'January 28, 2025', readTime: '4 min read', emoji: '💡', isPublished: true },
          { title: 'Sustainable Fashion: Shop Responsibly', excerpt: 'Explore how you can make more eco-conscious fashion choices.', category: 'Fashion', author: 'Anjali Sharma', date: 'January 20, 2025', readTime: '6 min read', emoji: '🌿', isPublished: true }
        ]
        await BlogPost.insertMany(defaultBlogs)
        console.log(`✅ Seeded ${defaultBlogs.length} blog posts!`)
      }
    } catch (error) {
      console.error('Error seeding data:', error.message)
    }
  } else {
    console.log('Running without database connection')
  }
}

initDB()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/payment', paymentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: isDBConnected ? 'ok' : 'degraded', 
    database: isDBConnected ? 'connected' : 'disconnected',
    message: 'AnjaliCart API is running' 
  })
})

// Debug route to check all routes
app.get('/api/debug', (req, res) => {
  res.json({ 
    message: 'Routes loaded',
    routes: ['/api/auth', '/api/products', '/api/orders', '/api/cart', '/api/chat', '/api/content', '/api/payment']
  })
})

// Catch-all for debugging
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
