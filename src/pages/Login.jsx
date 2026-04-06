import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { FaShoppingBag, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa'
import './Auth.css'

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addToast } = useToast()

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate password
  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters'
    }
    return ''
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required'
        if (!validateEmail(value)) return 'Please enter a valid email address'
        return ''
      case 'password':
        if (!value) return 'Password is required'
        return validatePassword(value)
      default:
        return ''
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) })
    }
  }

  const handleBlur = e => {
    const { name, value } = e.target
    setTouched({ ...touched, [name]: true })
    setErrors({ ...errors, [name]: validateField(name, value) })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    
    const newErrors = {}
    newErrors.email = validateField('email', formData.email)
    newErrors.password = validateField('password', formData.password)
    
    setErrors(newErrors)
    setTouched({ email: true, password: true })
    
    if (newErrors.email || newErrors.password) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token)
        
        // Use AuthContext login function
        login(data.user)
        
        // Redirect based on role
        if (data.user.role === 'admin' || data.user.email === 'admin@anjalicart.com') {
          addToast(`Welcome back, Admin!`, 'success')
          navigate('/admin')
        } else {
          addToast(`Welcome back, ${data.user.name || 'User'}!`, 'success')
          navigate('/')
        }
      } else {
        addToast(data.message || 'Login failed! Please check your credentials.', 'error')
      }
    } catch (error) {
      console.error('Login error:', error)
      addToast('Unable to connect to server. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left">
          <div className="auth-brand">
            <FaShoppingBag className="auth-logo" />
            <h1>AnJaliCart</h1>
          </div>
          <h2>Welcome Back!</h2>
          <p>Sign in to access your account, track orders, and enjoy exclusive deals.</p>
          <div className="auth-features">
            <div className="auth-feature"><FaCheck /> Track your orders</div>
            <div className="auth-feature"><FaCheck /> Exclusive member discounts</div>
            <div className="auth-feature"><FaCheck /> Faster checkout</div>
            <div className="auth-feature"><FaCheck /> Wishlist & saved items</div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-right">
          <div className="auth-form-card">
            <h2>Sign In</h2>
            <p className="auth-subtitle">Enter your credentials to continue</p>

            {errors.email && touched.email && <div className="field-error">{errors.email}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className={`input-wrap ${errors.email && touched.email ? 'input-error' : ''}`}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && touched.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className={`input-wrap ${errors.password && touched.password ? 'input-error' : ''}`}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && touched.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="auth-switch">
                Don't have an account? <Link to="/signup">Sign Up</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
