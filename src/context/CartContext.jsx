import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { cartAPI, productsAPI } from '../services/api'

const CartContext = createContext(null)

const GST_RATE = 18 // 18% GST

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load cart from backend on mount
  useEffect(() => {
    const loadCart = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          setIsLoading(true)
          const cartData = await cartAPI.getCart(token)
          if (cartData && cartData.items && cartData.items.length > 0) {
            // Convert backend cart items to frontend format
            const items = cartData.items.map(item => ({
              id: item.product?._id || item.product,
              name: item.product?.name || 'Unknown Product',
              price: item.price || item.product?.finalPrice || 0,
              image: item.product?.image || '',
              quantity: item.quantity,
              stock: item.product?.stock || 0
            }))
            setCartItems(items)
          } else {
            // Backend cart is empty, clear local cart too
            setCartItems([])
            localStorage.setItem('cartItems', JSON.stringify([]))
          }
        } catch (error) {
          console.error('Failed to load cart from backend:', error)
          // Fall back to localStorage
          try {
            const savedCart = localStorage.getItem('cartItems')
            if (savedCart) {
              const parsed = JSON.parse(savedCart)
              // Filter out any items with invalid IDs
              const validItems = parsed.filter(item => item && item.id)
              setCartItems(validItems)
            }
          } catch (e) {
            console.error('Failed to load cart from localStorage:', e)
          }
        } finally {
          setIsLoading(false)
        }
      } else {
        // Load from localStorage if not logged in
        try {
          const savedCart = localStorage.getItem('cartItems')
          if (savedCart) {
            const parsed = JSON.parse(savedCart)
            // Filter out any invalid items
            const validItems = parsed.filter(item => item && item.id)
            setCartItems(validItems)
          }
        } catch (e) {
          console.error('Failed to load cart from localStorage:', e)
        }
      }
    }
    loadCart()
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback(async (product) => {
    const token = localStorage.getItem('token')
    
    // Check if product has local ID
    const isLocalProduct = typeof product.id === 'string' && product.id.startsWith('prod_')
    
    // Calculate price including GST
    const gstAmount = (product.price * GST_RATE) / 100
    const priceWithGST = Math.round(product.price + gstAmount)
    
    // For local products or not logged in, use local storage
    if (!token || isLocalProduct) {
      setCartItems(prev => {
        const existing = prev.find(item => item.id === product.id)
        if (existing) {
          return prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
        return [...prev, { ...product, price: priceWithGST, quantity: 1 }]
      })
      // Save to localStorage
      const currentItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
      const existingIndex = currentItems.findIndex(item => item.id === product.id)
      if (existingIndex >= 0) {
        currentItems[existingIndex].quantity += 1
      } else {
        currentItems.push({ ...product, price: priceWithGST, quantity: 1 })
      }
      localStorage.setItem('cartItems', JSON.stringify(currentItems))
      return
    }
    
    // Use backend for logged-in users with MongoDB products
    try {
      setIsLoading(true)
      const productId = product.id || product._id || product.adminProductId
      await cartAPI.addItem(token, productId, 1)
      
      // Reload cart from backend
      const cartData = await cartAPI.getCart(token)
      if (cartData && cartData.items) {
        const items = cartData.items.map(item => ({
          id: item.product?._id || item.product,
          name: item.product?.name || 'Unknown Product',
          price: item.price || item.product?.finalPrice || 0,
          image: item.product?.image || '',
          quantity: item.quantity,
          stock: item.product?.stock || 0
        }))
        setCartItems(items)
      }
    } catch (error) {
      console.error('Failed to add to cart on backend:', error)
      // Fall back to local state
      setCartItems(prev => {
        const existing = prev.find(item => item.id === product.id)
        if (existing) {
          return prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
        return [...prev, { ...product, price: priceWithGST, quantity: 1 }]
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeFromCart = useCallback(async (productId) => {
    const token = localStorage.getItem('token')
    
    if (token) {
      try {
        setIsLoading(true)
        await cartAPI.removeItem(token, productId)
        
        // Reload cart from backend
        const cartData = await cartAPI.getCart(token)
        if (cartData && cartData.items) {
          const items = cartData.items.map(item => ({
            id: item.product?._id || item.product,
            name: item.product?.name || 'Unknown Product',
            price: item.price || item.product?.finalPrice || 0,
            image: item.product?.image || '',
            quantity: item.quantity,
            stock: item.product?.stock || 0
          }))
          setCartItems(items)
        }
      } catch (error) {
        console.error('Failed to remove from cart on backend:', error)
        // Fall back to local state
        setCartItems(prev => prev.filter(item => item.id !== productId))
      } finally {
        setIsLoading(false)
      }
    } else {
      setCartItems(prev => prev.filter(item => item.id !== productId))
    }
  }, [])

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return
    
    // Check if productId is a string (local product) or MongoDB ObjectId
    const isLocalProduct = typeof productId === 'string' && productId.startsWith('prod_')
    
    // For local products or if no token, update local state only
    const token = localStorage.getItem('token')
    
    if (!token || isLocalProduct) {
      // Update local state only for local products
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      )
      // Also save to localStorage
      const currentItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
      const updatedItems = currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
      localStorage.setItem('cartItems', JSON.stringify(updatedItems))
      return
    }
    
    // For logged-in users with MongoDB products, try backend update
    try {
      setIsLoading(true)
      await cartAPI.updateItem(token, productId, quantity)
      
      // Reload cart from backend
      const cartData = await cartAPI.getCart(token)
      if (cartData && cartData.items) {
        const items = cartData.items.map(item => ({
          id: item.product?._id || item.product,
          name: item.product?.name || 'Unknown Product',
          price: item.price || item.product?.finalPrice || 0,
          image: item.product?.image || '',
          quantity: item.quantity,
          stock: item.product?.stock || 0
        }))
        setCartItems(items)
      }
    } catch (error) {
      console.error('Failed to update cart on backend:', error)
      // Fall back to local state
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearCart = useCallback(async () => {
    const token = localStorage.getItem('token')
    
    if (token) {
      try {
        setIsLoading(true)
        await cartAPI.clearCart(token)
      } catch (error) {
        console.error('Failed to clear cart on backend:', error)
      } finally {
        setIsLoading(false)
      }
    }
    // Clear local cart items
    setCartItems([])
    // Also clear localStorage
    localStorage.setItem('cartItems', JSON.stringify([]))
  }, [])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount, 
      cartTotal,
      isLoading 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
