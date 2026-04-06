import { Link, useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { FaHeart, FaTimes, FaShoppingCart } from 'react-icons/fa'
import './WishlistPage.css'

function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <section className="page-header">
          <h1>My Wishlist</h1>
          <p>Items you've saved for later</p>
        </section>
        <div className="wishlist-empty">
          <span className="wishlist-empty-icon"><FaHeart /></span>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love by clicking the heart icon on any product.</p>
          <Link to="/products" className="btn btn-primary">Explore Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="wishlist-page">
      <section className="page-header">
        <h1>My Wishlist</h1>
        <p>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</p>
      </section>

      <div className="wishlist-container">
        <div className="wishlist-grid">
          {wishlistItems.map(item => (
            <div key={item.id} className="wishlist-card" onClick={() => navigate(`/products/${item.id}`)}>
              <div className="wishlist-card-image">
                <img src={item.image} alt={item.name} />
                <button
                  className="wishlist-remove-btn"
                  onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id) }}
                  aria-label="Remove from wishlist"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="wishlist-card-info">
                <span className="wishlist-category">{item.category}</span>
                <h3>{item.name}</h3>
                <div className="wishlist-card-footer">
                  <span className="wishlist-price">₹{item.price.toLocaleString('en-IN')}</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => { e.stopPropagation(); addToCart(item) }}
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WishlistPage
