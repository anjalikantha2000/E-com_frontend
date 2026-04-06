import { useState, useEffect } from 'react'
import { contentAPI } from '../services/api'
import './About.css'

const defaultTeamMembers = [
  { name: 'Anjali Sharma', role: 'Founder & CEO', emoji: '👩‍💼' },
  { name: 'Rahul Verma', role: 'Head of Technology', emoji: '👨‍💻' },
  { name: 'Priya Nair', role: 'Marketing Director', emoji: '👩‍🎨' },
  { name: 'Arjun Patel', role: 'Operations Manager', emoji: '👨‍🔧' },
]

const defaultAboutData = {
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
}

function About() {
  const [teamMembers, setTeamMembers] = useState(defaultTeamMembers)
  const [aboutData, setAboutData] = useState(defaultAboutData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch about data and team from backend
        const [aboutRes, teamRes] = await Promise.all([
          contentAPI.getAbout(),
          contentAPI.getTeam()
        ])
        
        if (aboutRes) {
          setAboutData({
            story: aboutRes.story || defaultAboutData.story,
            stats: aboutRes.stats || defaultAboutData.stats,
            values: aboutRes.values || defaultAboutData.values
          })
        }
        
        if (teamRes && teamRes.length > 0) {
          setTeamMembers(teamRes.map(m => ({
            name: m.name,
            role: m.role,
            emoji: m.emoji
          })))
        }
      } catch (error) {
        console.log('Using default about data:', error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="about">Loading...</div>
  }
  return (
    <div className="about">
      {/* Page Header */}
      <section className="page-header">
        <h1>About AnJaliCart</h1>
        <p>Your trusted online shopping destination since 2020</p>
      </section>

      {/* Our Story */}
      <section className="our-story">
        <div className="story-content">
          <h2>Our Story</h2>
          <p>
            {aboutData.story || 'AnJaliCart was founded in 2020 with a simple mission: to make quality products accessible to everyone across India. What started as a small online store has grown into a thriving marketplace trusted by over 500,000 customers.'}
          </p>
          <p>
            We believe shopping should be easy, enjoyable, and affordable. That's why we
            carefully curate our product selection, partner with reliable suppliers, and
            offer competitive prices without compromising on quality.
          </p>
          <p>
            From electronics to fashion, home decor to sports equipment — we have everything
            you need, delivered right to your doorstep.
          </p>
        </div>
        <div className="story-stats">
          <div className="stat-card">
            <span className="stat-number">{aboutData.stats?.happyCustomers || '500K+'}</span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{aboutData.stats?.products || '50K+'}</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{aboutData.stats?.citiesServed || '100+'}</span>
            <span className="stat-label">Cities Served</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{aboutData.stats?.averageRating || '4.8★'}</span>
            <span className="stat-label">Average Rating</span>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="our-values">
        <h2>Our Values</h2>
        <div className="values-grid">
          {(aboutData.values || defaultAboutData.values).map((value, index) => (
            <div key={index} className="value-card">
              <span className="value-icon">{value.icon}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="our-team">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-avatar">{member.emoji}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default About
