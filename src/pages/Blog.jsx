import { useState, useEffect } from 'react'
import { contentAPI } from '../services/api'
import { FaPen, FaCalendar, FaClock } from 'react-icons/fa'
import './Blog.css'

const defaultBlogPosts = [
  {
    id: 1,
    title: 'Top 10 Fashion Trends for 2025',
    excerpt: 'Discover the hottest fashion trends that are taking the world by storm this year. From bold colors to minimalist designs, we cover it all.',
    category: 'Fashion',
    author: 'Priya Nair',
    date: 'February 20, 2025',
    readTime: '5 min read',
    emoji: '👗',
  },
  {
    id: 2,
    title: 'How to Choose the Right Smartphone in 2025',
    excerpt: "With so many options available, picking the right smartphone can be overwhelming. Here's our comprehensive guide to help you make the best choice.",
    category: 'Electronics',
    author: 'Rahul Verma',
    date: 'February 15, 2025',
    readTime: '8 min read',
    emoji: '📱',
  },
  {
    id: 3,
    title: 'Home Decor Ideas on a Budget',
    excerpt: 'Transform your living space without breaking the bank. These creative and affordable home decor ideas will make your home look stunning.',
    category: 'Home',
    author: 'Anjali Sharma',
    date: 'February 10, 2025',
    readTime: '6 min read',
    emoji: '🏠',
  },
  {
    id: 4,
    title: 'The Ultimate Guide to Fitness Equipment',
    excerpt: "Whether you're setting up a home gym or looking to upgrade your workout gear, this guide covers everything you need to know.",
    category: 'Sports',
    author: 'Arjun Patel',
    date: 'February 5, 2025',
    readTime: '7 min read',
    emoji: '💪',
  },
  {
    id: 5,
    title: 'Smart Shopping: How to Get the Best Deals Online',
    excerpt: 'Learn the tricks and strategies that savvy shoppers use to save money and get the best value when shopping online.',
    category: 'Shopping Tips',
    author: 'Priya Nair',
    date: 'January 28, 2025',
    readTime: '4 min read',
    emoji: '💡',
  },
  {
    id: 6,
    title: 'Sustainable Fashion: Shop Responsibly',
    excerpt: 'Explore how you can make more eco-conscious fashion choices without sacrificing style. A guide to sustainable shopping.',
    category: 'Fashion',
    author: 'Anjali Sharma',
    date: 'January 20, 2025',
    readTime: '6 min read',
    emoji: '🌿',
  },
]

const blogCategories = ['All', 'Fashion', 'Electronics', 'Home', 'Sports', 'Shopping Tips']

function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [blogPosts, setBlogPosts] = useState(defaultBlogPosts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await contentAPI.getBlogs()
        if (blogs && blogs.length > 0) {
          setBlogPosts(blogs.map(b => ({
            id: b._id,
            title: b.title,
            excerpt: b.excerpt,
            category: b.category,
            author: b.author,
            date: b.date,
            readTime: b.readTime,
            emoji: b.emoji
          })))
        }
      } catch (error) {
        console.log('Using default blog posts:', error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  const filtered = blogPosts.filter(
    post => activeCategory === 'All' || post.category === activeCategory
  )

  return (
    <div className="blog-page">
      {/* Page Header */}
      <section className="page-header">
        <h1>Our Blog</h1>
        <p>Tips, trends, and insights for smart shoppers</p>
      </section>

      {/* Category Filter */}
      <div className="blog-filters">
        {blogCategories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Posts Grid */}
      <div className="blog-container">
        <div className="blog-grid">
          {filtered.map(post => (
            <article key={post.id} className="blog-card">
              <div className="blog-card-image">
                <span className="blog-emoji">{post.emoji}</span>
                <span className="blog-category-tag">{post.category}</span>
              </div>
              <div className="blog-card-content">
                <h2>{post.title}</h2>
                <p className="blog-excerpt">{post.excerpt}</p>
                <div className="blog-meta">
                  <span className="blog-author"><FaPen /> {post.author}</span>
                  <span className="blog-date"><FaCalendar /> {post.date}</span>
                  <span className="blog-read-time"><FaClock /> {post.readTime}</span>
                </div>
                <button className="btn btn-outline btn-sm">Read More →</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Blog
