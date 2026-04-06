import { Link } from 'react-router-dom'
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
              <FaFacebookF className="footer-logo-icon" />
              <span className="footer-brand-name">AnJali<span>Cart</span></span>
            </div>
          <p>Your trusted online shopping destination. Quality products, unbeatable prices, delivered to your door.</p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h3>Customer Service</h3>
          <ul>
            <li><a href="#">Track Order</a></li>
            <li><a href="#">Returns & Refunds</a></li>
            <li><a href="#">Shipping Policy</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Size Guide</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h3>Account</h3>
          <ul>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/signup">Create Account</Link></li>
            <li><a href="#">My Orders</a></li>
            <li><a href="#">Wishlist</a></li>
            <li><a href="#">Rewards</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} AnJaliCart. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
