import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import './Signup.css'

const initialForm = {
  fullName: '',
  phone: '',
  address: '',
  email: '',
  gender: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
  role: 'user', // Default role
  adminSecret: '', // Admin secret key
}

const initialErrors = {
  fullName: '',
  phone: '',
  address: '',
  email: '',
  gender: '',
  password: '',
  confirmPassword: '',
  agreeTerms: '',
}

function validate(form) {
  const errors = { ...initialErrors }
  let valid = true

  // Full Name
  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required.'
    valid = false
  } else if (form.fullName.trim().length < 3) {
    errors.fullName = 'Name must be at least 3 characters.'
    valid = false
  }

  // Phone
  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.'
    valid = false
  } else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number.'
    valid = false
  }

  // Address
  if (!form.address.trim()) {
    errors.address = 'Address is required.'
    valid = false
  } else if (form.address.trim().length < 10) {
    errors.address = 'Please enter a complete address (min 10 characters).'
    valid = false
  }

  // Email - strict validation: only allow letters, numbers, @ and . (no special characters)
  if (!form.email.trim()) {
    errors.email = 'Email address is required.'
    valid = false
  } else {
    // Only allow: letters (a-z, A-Z), numbers (0-9), @ symbol, dot (.), and hyphen (-)
    // Reject special characters: #$%^&*()_+! etc.
    const emailRegex = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(form.email)) {
      errors.email = 'Invalid email format. Only letters, numbers, @ and . are allowed.'
      valid = false
    } else if (!form.email.includes('@')) {
      errors.email = 'Email must contain @ symbol.'
      valid = false
    } else if (form.email.indexOf('@') > form.email.lastIndexOf('.')) {
      errors.email = 'Invalid email format. Domain must come before extension.'
      valid = false
    } else {
      // Only allow gmail.com and yahoo.com domains
      const emailDomain = form.email.split('@')[1]?.toLowerCase()
      const allowedDomains = ['gmail.com', 'yahoo.com']
      if (!allowedDomains.includes(emailDomain)) {
        errors.email = 'Only @gmail.com and @yahoo.com email addresses are allowed.'
        valid = false
      }
    }
  }

  // Gender
  if (!form.gender) {
    errors.gender = 'Please select your gender.'
    valid = false
  }

  // Password
  if (!form.password) {
    errors.password = 'Password is required.'
    valid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
    valid = false
  } else if (!/(?=.*[A-Z])/.test(form.password)) {
    errors.password = 'Password must contain at least one uppercase letter.'
    valid = false
  } else if (!/(?=.*\d)/.test(form.password)) {
    errors.password = 'Password must contain at least one number.'
    valid = false
  }

  // Confirm Password
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
    valid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
    valid = false
  }

  // Terms
  if (!form.agreeTerms) {
    errors.agreeTerms = 'You must agree to the Terms & Conditions.'
    valid = false
  }

  // Allow admin registration with special secret key
  const ADMIN_SECRET_KEY = 'anjalicart_admin_secret_2024'
  if (form.role === 'admin') {
    if (form.adminSecret !== ADMIN_SECRET_KEY) {
      errors.role = 'Invalid admin secret key.'
      valid = false
    }
  }

  return { errors, valid }
}

function PasswordStrength({ password }) {
  if (!password) return null
  let strength = 0
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#e74c3c', '#f39c12', '#3498db', '#27ae60']

  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="strength-bar"
            style={{ background: i <= strength ? colors[strength] : '#e0e0e0' }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  )
}

function Signup() {
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState(initialErrors)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { addToast } = useToast()

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const { errors: newErrors, valid } = validate(formData)
    setErrors(newErrors)
    if (!valid) return
    
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender,
          role: formData.role,
          adminSecret: formData.adminSecret
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Show success message and redirect to login
        addToast('Account created successfully! Please login to continue.', 'success')
        navigate('/login')
      } else {
        addToast(data.message || 'Registration failed! Please try again.', 'error')
      }
    } catch (error) {
      console.error('Registration error:', error)
      addToast('Unable to connect to server. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-wrapper">
        {/* Left Panel */}
        <div className="signup-left">
          <div className="signup-brand">
            <h1>AnJaliCart</h1>
          </div>
          <h2>Create Your Account</h2>
          <p>Join thousands of happy shoppers and enjoy exclusive benefits.</p>
          <div className="signup-perks">
            <div className="perk-item">
              <div>
                <strong>Welcome Discount</strong>
                <p>10% off on your first order</p>
              </div>
            </div>
            <div className="perk-item">
              <div>
                <strong>Free Delivery</strong>
                <p>On orders above Rs.499</p>
              </div>
            </div>
            <div className="perk-item">
              <div>
                <strong>Easy Returns</strong>
                <p>30-day hassle-free returns</p>
              </div>
            </div>
            <div className="perk-item">
              <div>
                <strong>Reward Points</strong>
                <p>Earn points on every purchase</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="signup-right">
          <div className="signup-form-card">
            <div className="signup-form-header">
              <h2>Register</h2>
              <p>Fill in the details below to create your account</p>
            </div>

            <form className="signup-form" onSubmit={handleSubmit} noValidate>

              {/* Full Name */}
              <div className={`form-field ${errors.fullName ? 'has-error' : ''}`}>
                <label htmlFor="fullName">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>

              {/* Phone & Email Row */}
              <div className="form-row-2">
                <div className={`form-field ${errors.phone ? 'has-error' : ''}`}>
                  <label htmlFor="phone">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98765 43210"
                    maxLength={10}
                    autoComplete="tel"
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>

                <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
                  <label htmlFor="email">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
              </div>

              {/* Address */}
              <div className={`form-field ${errors.address ? 'has-error' : ''}`}>
                <label htmlFor="address">
                  Address <span className="required">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House No., Street, City, State, PIN Code"
                  rows={3}
                  autoComplete="street-address"
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>

              {/* Gender */}
              <div className={`form-field ${errors.gender ? 'has-error' : ''}`}>
                <label>
                  Gender <span className="required">*</span>
                </label>
                <div className="gender-options">
                  {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => (
                    <label key={g} className={`gender-option ${formData.gender === g ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                      />
                      <span className="gender-label">{g}</span>
                    </label>
                  ))}
                </div>
                {errors.gender && <span className="field-error">{errors.gender}</span>}
              </div>

              {/* Password & Confirm Password Row */}
              <div className="form-row-2">
                <div className={`form-field ${errors.password ? 'has-error' : ''}`}>
                  <label htmlFor="password">
                    Password <span className="required">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <PasswordStrength password={formData.password} />
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <div className={`form-field ${errors.confirmPassword ? 'has-error' : ''}`}>
                  <label htmlFor="confirmPassword">
                    Confirm Password <span className="required">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <span className="field-success">Passwords match</span>
                  )}
                  {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* Terms */}
              <div className={`form-field terms-field ${errors.agreeTerms ? 'has-error' : ''}`}>
                <label className="terms-check-label">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <span>
                    I agree to the{' '}
                    <a href="#" className="terms-link">Terms & Conditions</a>
                    {' '}and{' '}
                    <a href="#" className="terms-link">Privacy Policy</a>
                  </span>
                </label>
                {errors.agreeTerms && <span className="field-error">⚠ {errors.agreeTerms}</span>}
              </div>

              {/* Role Selection */}
              <div className="form-field">
                <label>
                  Account Type <span className="required">*</span>
                </label>
                <div className="role-options">
                  <label className={`role-option ${formData.role === 'user' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={formData.role === 'user'}
                      onChange={handleChange}
                    />
                    <div className="role-info">
                      <strong>Customer</strong>
                      <p>Shop and place orders</p>
                    </div>
                  </label>
                  <label className={`role-option ${formData.role === 'admin' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === 'admin'}
                      onChange={handleChange}
                    />
                    <div className="role-info">
                      <strong>Admin</strong>
                      <p>Manage products & orders</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Admin Secret Key - Show only when admin is selected */}
              {formData.role === 'admin' && (
                <div className={`form-field ${errors.role ? 'has-error' : ''}`}>
                  <label htmlFor="adminSecret">
                    Admin Secret Key <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="adminSecret"
                    name="adminSecret"
                    value={formData.adminSecret}
                    onChange={handleChange}
                    placeholder="Enter admin secret key"
                  />
                  {errors.role && <span className="field-error">{errors.role}</span>}
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="btn btn-primary btn-submit">
                Create Account
              </button>
            </form>

            <p className="signin-link">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
