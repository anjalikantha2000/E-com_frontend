import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ordersAPI } from '../services/api'

const OrderContext = createContext(null)

// Payment status enum
export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded'
}

// Order status enum
export const OrderStatus = {
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load orders from backend on mount
  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          setIsLoading(true)
          const ordersData = await ordersAPI.getMyOrders(token)
          if (ordersData && Array.isArray(ordersData)) {
            // Convert backend orders to frontend format
            const convertedOrders = ordersData.map(order => ({
              id: order._id,
              orderDate: order.createdAt,
              status: order.status,
              paymentStatus: order.paymentStatus,
              items: order.items.map(item => ({
                id: item.product?._id || item.product,
                name: item.name || 'Unknown Product',
                price: item.price || 0,
                image: item.image || '',
                quantity: item.quantity
              })),
              shippingAddress: order.shippingAddress,
              subtotal: order.subtotal,
              gst: order.gst,
              total: order.total,
              totalAmount: order.total,
              paymentMethod: order.paymentMethod,
              timeline: order.timeline || []
            }))
            setOrders(convertedOrders)
          }
        } catch (error) {
          console.error('Failed to load orders from backend:', error)
          // Fall back to localStorage
          try {
            const savedOrders = localStorage.getItem('userOrders')
            if (savedOrders) {
              setOrders(JSON.parse(savedOrders))
            }
          } catch (e) {
            console.error('Failed to load orders from localStorage:', e)
          }
        } finally {
          setIsLoading(false)
        }
      } else {
        // Load from localStorage if not logged in
        try {
          const savedOrders = localStorage.getItem('userOrders')
          if (savedOrders) {
            setOrders(JSON.parse(savedOrders))
          }
        } catch (e) {
          console.error('Failed to load orders from localStorage:', e)
        }
      }
    }
    loadOrders()
  }, [])

  // Sync orders with localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userOrders', JSON.stringify(orders))
  }, [orders])

  // Create new order
  const createOrder = useCallback(async (orderData) => {
    const token = localStorage.getItem('token')
    const newOrder = {
      id: 'ORD' + Date.now(),
      orderDate: new Date().toISOString(),
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCESS,
      ...orderData,
      items: orderData.items.map(item => ({
        ...item,
        price: item.price || 0
      })),
      subtotal: orderData.subtotal || orderData.totalAmount || 0,
      gst: orderData.gst || 0,
      total: orderData.total || orderData.totalAmount || orderData.subtotal || 0,
      totalAmount: orderData.total || orderData.totalAmount || orderData.subtotal || 0,
      timeline: [
        {
          status: OrderStatus.CONFIRMED,
          date: new Date().toISOString(),
          message: 'Order confirmed'
        }
      ]
    }

    // Use backend if logged in
    if (token) {
      try {
        setIsLoading(true)
        const backendOrder = await ordersAPI.create(token, {
          items: orderData.items.map(item => {
            // Check if it's a MongoDB ObjectId (24 char hex) or a local string ID
            const id = item._id || item.id
            const isMongoId = id && /^[0-9a-fA-F]{24}$/.test(id)
            
            return {
              product: isMongoId ? id : null, // Don't reference MongoDB for local products
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
              localId: isMongoId ? null : id // Store local ID if not MongoDB
            }
          }),
          shippingAddress: orderData.shippingAddress,
          subtotal: orderData.subtotal || orderData.totalAmount || 0,
          gst: orderData.gst || 0,
          total: orderData.totalAmount || orderData.total || 0,
          paymentMethod: orderData.paymentMethod || 'card',
          paymentStatus: 'success',
          status: 'confirmed'
        })
        
        // Reload orders from backend
        const ordersData = await ordersAPI.getMyOrders(token)
        if (ordersData && Array.isArray(ordersData)) {
          const convertedOrders = ordersData.map(order => ({
            id: order._id,
            orderDate: order.createdAt,
            status: order.status,
            paymentStatus: order.paymentStatus,
            items: order.items.map(item => ({
              id: item.product?._id || item.product,
              name: item.name || 'Unknown Product',
              price: item.price || 0,
              image: item.image || '',
              quantity: item.quantity
            })),
            shippingAddress: order.shippingAddress,
            subtotal: order.subtotal,
            gst: order.gst,
            total: order.total,
            totalAmount: order.total,
            paymentMethod: order.paymentMethod,
            timeline: order.timeline || []
          }))
          setOrders(convertedOrders)
        }
        return { ...newOrder, id: backendOrder._id }
      } catch (error) {
        console.error('Failed to create order on backend:', error)
        // Fall back to local state
        setOrders(prev => [...prev, newOrder])
        return newOrder
      } finally {
        setIsLoading(false)
      }
    } else {
      // Use local state for non-logged in users
      setOrders(prev => [...prev, newOrder])
      return newOrder
    }
  }, [])

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, status, message) => {
    const token = localStorage.getItem('token')
    
    if (token) {
      try {
        setIsLoading(true)
        await ordersAPI.updateStatus(token, orderId, status)
        
        // Reload orders from backend
        const ordersData = await ordersAPI.getMyOrders(token)
        if (ordersData && Array.isArray(ordersData)) {
          const convertedOrders = ordersData.map(order => ({
            id: order._id,
            orderDate: order.createdAt,
            status: order.status,
            paymentStatus: order.paymentStatus,
            items: order.items.map(item => ({
              id: item.product?._id || item.product,
              name: item.name || 'Unknown Product',
              price: item.price || 0,
              image: item.image || '',
              quantity: item.quantity
            })),
            shippingAddress: order.shippingAddress,
            subtotal: order.subtotal,
            gst: order.gst,
            total: order.total,
            totalAmount: order.total,
            paymentMethod: order.paymentMethod,
            timeline: order.timeline || []
          }))
          setOrders(convertedOrders)
        }
      } catch (error) {
        console.error('Failed to update order on backend:', error)
        // Fall back to local state
        setOrders(prev => prev.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status,
              timeline: [
                ...order.timeline,
                {
                  status,
                  date: new Date().toISOString(),
                  message: message || `Order status updated to ${status}`
                }
              ]
            }
          }
          return order
        }))
      } finally {
        setIsLoading(false)
      }
    } else {
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status,
            timeline: [
              ...order.timeline,
              {
                status,
                date: new Date().toISOString(),
                message: message || `Order status updated to ${status}`
              }
            ]
          }
        }
        return order
      }))
    }
  }, [])

  // Update payment status
  const updatePaymentStatus = useCallback((orderId, paymentStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          paymentStatus
        }
      }
      return order
    }))
  }, [])

  // Get order by ID
  const getOrderById = useCallback((orderId) => {
    return orders.find(order => order.id === orderId)
  }, [orders])

  // Get user orders
  const getUserOrders = useCallback((userEmail) => {
    return orders.filter(order => order.userEmail === userEmail)
  }, [orders])

  // Cancel order
  const cancelOrder = useCallback(async (orderId) => {
    await updateOrderStatus(orderId, OrderStatus.CANCELLED, 'Order cancelled by customer')
    updatePaymentStatus(orderId, PaymentStatus.REFUNDED)
  }, [updateOrderStatus, updatePaymentStatus])

  return (
    <OrderContext.Provider value={{
      orders,
      createOrder,
      updateOrderStatus,
      updatePaymentStatus,
      getOrderById,
      getUserOrders,
      cancelOrder,
      OrderStatus,
      PaymentStatus,
      isLoading
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder must be used within OrderProvider')
  return ctx
}
