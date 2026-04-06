import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authAPI } from '../services/api'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load wishlist from backend on mount
  useEffect(() => {
    const loadWishlist = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          setIsLoading(true)
          const wishlistData = await authAPI.getWishlist(token)
          if (wishlistData && Array.isArray(wishlistData)) {
            // Convert backend wishlist items to frontend format
            const items = wishlistData.map(item => ({
              id: item._id,
              name: item.name,
              price: item.finalPrice || item.basePrice || item.price || 0,
              image: item.image || '',
              description: item.description || '',
              category: item.category || '',
              brand: item.brand || '',
              stock: item.stock || 0,
              rating: item.rating || 0,
              reviews: item.reviews || 0
            }))
            setWishlistItems(items)
          }
        } catch (error) {
          console.error('Failed to load wishlist from backend:', error)
          // Fall back to localStorage
          try {
            const stored = localStorage.getItem('wishlistItems')
            if (stored) {
              setWishlistItems(JSON.parse(stored))
            }
          } catch (e) {
            console.error('Failed to load wishlist from localStorage:', e)
          }
        } finally {
          setIsLoading(false)
        }
      } else {
        // Load from localStorage if not logged in
        try {
          const stored = localStorage.getItem('wishlistItems')
          if (stored) {
            setWishlistItems(JSON.parse(stored))
          }
        } catch (e) {
          console.error('Failed to load wishlist from localStorage:', e)
        }
      }
    }
    loadWishlist()
  }, [])

  // Save to localStorage whenever wishlistItems changes
  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems))
  }, [wishlistItems])

  const toggleWishlist = useCallback(async (product) => {
    const token = localStorage.getItem('token')
    const productId = product.id || product._id

    // Check if product exists in wishlist
    const exists = wishlistItems.some(item => item.id === productId)

    if (token) {
      try {
        setIsLoading(true)
        if (exists) {
          await authAPI.removeFromWishlist(token, productId)
        } else {
          await authAPI.addToWishlist(token, productId)
        }

        // Reload wishlist from backend
        const wishlistData = await authAPI.getWishlist(token)
        if (wishlistData && Array.isArray(wishlistData)) {
          const items = wishlistData.map(item => ({
            id: item._id,
            name: item.name,
            price: item.finalPrice || item.basePrice || item.price || 0,
            image: item.image || '',
            description: item.description || '',
            category: item.category || '',
            brand: item.brand || '',
            stock: item.stock || 0,
            rating: item.rating || 0,
            reviews: item.reviews || 0
          }))
          setWishlistItems(items)
        }
      } catch (error) {
        console.error('Failed to update wishlist on backend:', error)
        // Fall back to local state
        if (exists) {
          setWishlistItems(prev => prev.filter(item => item.id !== productId))
        } else {
          setWishlistItems(prev => [...prev, { ...product, id: productId }])
        }
      } finally {
        setIsLoading(false)
      }
    } else {
      // Use local state for non-logged in users
      if (exists) {
        setWishlistItems(prev => prev.filter(item => item.id !== productId))
      } else {
        setWishlistItems(prev => [...prev, { ...product, id: productId }])
      }
    }
  }, [wishlistItems])

  const addToWishlist = useCallback(async (product) => {
    const token = localStorage.getItem('token')
    const productId = product.id || product._id

    // Check if product already exists
    const exists = wishlistItems.some(item => item.id === productId)
    if (exists) return

    if (token) {
      try {
        setIsLoading(true)
        await authAPI.addToWishlist(token, productId)

        // Reload wishlist from backend
        const wishlistData = await authAPI.getWishlist(token)
        if (wishlistData && Array.isArray(wishlistData)) {
          const items = wishlistData.map(item => ({
            id: item._id,
            name: item.name,
            price: item.finalPrice || item.basePrice || item.price || 0,
            image: item.image || '',
            description: item.description || '',
            category: item.category || '',
            brand: item.brand || '',
            stock: item.stock || 0,
            rating: item.rating || 0,
            reviews: item.reviews || 0
          }))
          setWishlistItems(items)
        }
      } catch (error) {
        console.error('Failed to add to wishlist on backend:', error)
        // Fall back to local state
        setWishlistItems(prev => [...prev, { ...product, id: productId }])
      } finally {
        setIsLoading(false)
      }
    } else {
      // Use local state for non-logged in users
      setWishlistItems(prev => [...prev, { ...product, id: productId }])
    }
  }, [wishlistItems])

  const removeFromWishlist = useCallback(async (productId) => {
    const token = localStorage.getItem('token')

    if (token) {
      try {
        setIsLoading(true)
        await authAPI.removeFromWishlist(token, productId)

        // Update local state
        setWishlistItems(prev => prev.filter(item => item.id !== productId))
      } catch (error) {
        console.error('Failed to remove from wishlist on backend:', error)
        // Fall back to local state
        setWishlistItems(prev => prev.filter(item => item.id !== productId))
      } finally {
        setIsLoading(false)
      }
    } else {
      // Use local state for non-logged in users
      setWishlistItems(prev => prev.filter(item => item.id !== productId))
    }
  }, [])

  const clearWishlist = useCallback(() => {
    setWishlistItems([])
  }, [])

  const isWishlisted = useCallback((productId) => {
    return wishlistItems.some(item => item.id === productId)
  }, [wishlistItems])

  const wishlistCount = wishlistItems.length

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems, 
      toggleWishlist,
      addToWishlist, 
      removeFromWishlist, 
      clearWishlist,
      isWishlisted,
      wishlistCount,
      isLoading
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
