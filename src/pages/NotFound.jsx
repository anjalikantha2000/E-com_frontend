import { Link } from 'react-router-dom'
import { FaShoppingBag } from 'react-icons/fa'
import './NotFound.css'

function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <span className="notfound-emoji"><FaShoppingBag /></span>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">Go to Home</Link>
          <Link to="/products" className="btn btn-outline">Browse Products</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
