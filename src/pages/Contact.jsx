import { useState } from 'react'
import { contentAPI } from '../services/api'
import { useToast } from '../components/Toast'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaComment, FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaCheck, FaPaperPlane } from 'react-icons/fa'
import './Contact.css'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const { addToast } = useToast()

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate all fields
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        return ''
      case 'email':
        if (!value) return 'Email is required'
        if (!validateEmail(value)) return 'Please enter a valid email address'
        return ''
      case 'subject':
        if (!value) return 'Please select a subject'
        return ''
      case 'message':
        if (!value.trim()) return 'Message is required'
        if (value.trim().length < 10) return 'Message must be at least 10 characters'
        return ''
      default:
        return ''
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleBlur = e => {
    const { name, value } = e.target
    setErrors({ ...errors, [name]: validateField(name, value) })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      subject: validateField('subject', formData.subject),
      message: validateField('message', formData.message),
    }
    setErrors(newErrors)
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      return
    }
    
    try {
      await contentAPI.submitContact(formData)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      setErrors({})
    } catch (error) {
      console.error('Error submitting contact form:', error)
      addToast('Failed to send message. Please try again.', 'error')
    }
  }

  return (
    <div className="contact-page">
      {/* Page Header */}
      <section className="page-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Get in touch with us!</p>
      </section>

      <div className="contact-container">
        {/* Contact Info */}
        <div className="contact-info">
          <h2>Get In Touch</h2>
          <p>Have a question, feedback, or need help with your order? Our team is here to assist you.</p>

          <div className="info-cards">
            <div className="info-card">
              <span className="info-icon"><FaMapMarkerAlt /></span>
              <div>
                <h3>Our Address</h3>
                <p>123 Shopping Street, Koramangala<br />Bengaluru, Karnataka 560034</p>
              </div>
            </div>
            <div className="info-card">
              <span className="info-icon"><FaPhone /></span>
              <div>
                <h3>Phone</h3>
                <p>+91 98765 43210<br />Mon–Sat, 9am–6pm</p>
              </div>
            </div>
            <div className="info-card">
              <span className="info-icon"><FaEnvelope /></span>
              <div>
                <h3>Email</h3>
                <p>support@anjalicart.com<br />We reply within 24 hours</p>
              </div>
            </div>
            <div className="info-card">
              <span className="info-icon"><FaComment /></span>
              <div>
                <h3>Live Chat</h3>
                <p>Available 24/7<br />Instant support</p>
              </div>
            </div>
          </div>

          <div className="social-links">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" className="social-icon" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" className="social-icon" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-wrap">
          <h2>Send a Message</h2>
          {submitted ? (
            <div className="success-message">
              <span><FaCheck /></span>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <button className="btn btn-primary" onClick={() => setSubmitted(false)}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Your full name"
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="your@email.com"
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.subject ? 'input-error' : ''}
                >
                  <option value="">Select a subject</option>
                  <option value="order">Order Inquiry</option>
                  <option value="return">Return / Refund</option>
                  <option value="product">Product Question</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
                {errors.subject && <span className="field-error">{errors.subject}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Write your message here..."
                  rows={6}
                  className={errors.message ? 'input-error' : ''}
                />
                {errors.message && <span className="field-error">{errors.message}</span>}
              </div>
              <button type="submit" className="btn btn-primary btn-full">
                Send Message <FaPaperPlane />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Contact
