// API Service for connecting to MongoDB backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['x-auth-token'] = token
  }
  
  const options = {
    method,
    headers
  }
  
  if (body) {
    options.body = JSON.stringify(body)
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed. Please try again.')
    }
    
    return data
  } catch (error) {
    // Re-throw with a user-friendly message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to server. Please check your internet connection and try again.')
    }
    throw error
  }
}

// Auth API
export const authAPI = {
  register: (userData) => apiCall('/auth/register', 'POST', userData),
  login: (credentials) => apiCall('/auth/login', 'POST', credentials),
  getMe: (token) => apiCall('/auth/me', 'GET', null, token),
  updateProfile: (token, data) => apiCall('/auth/profile', 'PUT', data, token),
  getAllUsers: (token) => apiCall('/auth/users', 'GET', null, token),
  getUserById: (token, id) => apiCall(`/auth/users/${id}`, 'GET', null, token),
  updateUser: (token, id, data) => apiCall(`/auth/users/${id}`, 'PUT', data, token),
  deleteUser: (token, id) => apiCall(`/auth/users/${id}`, 'DELETE', null, token),
  updateUserAccess: (token, id, access) => apiCall(`/auth/users/${id}/access`, 'PUT', { access }, token),
  // Wishlist API
  getWishlist: (token) => apiCall('/auth/wishlist', 'GET', null, token),
  addToWishlist: (token, productId) => apiCall('/auth/wishlist/add', 'POST', { productId }, token),
  removeFromWishlist: (token, productId) => apiCall(`/auth/wishlist/remove/${productId}`, 'DELETE', null, token)
}

// Products API
export const productsAPI = {
  getAll: () => apiCall('/products'),
  getById: (id) => apiCall(`/products/${id}`),
  getByCategory: (category) => apiCall(`/products/category/${category}`),
  search: (query) => apiCall(`/products/search/${query}`),
  create: (token, productData) => apiCall('/products', 'POST', productData, token),
  update: (token, id, productData) => apiCall(`/products/${id}`, 'PUT', productData, token),
  delete: (token, id) => apiCall(`/products/${id}`, 'DELETE', null, token)
}

// Orders API
export const ordersAPI = {
  create: (token, orderData) => apiCall('/orders', 'POST', orderData, token),
  getMyOrders: (token) => apiCall('/orders/my-orders', 'GET', null, token),
  getAll: (token) => apiCall('/orders', 'GET', null, token),
  getById: (token, id) => apiCall(`/orders/${id}`, 'GET', null, token),
  updateStatus: (token, id, status) => apiCall(`/orders/${id}/status`, 'PUT', { status }, token),
  updatePayment: (token, id, paymentStatus) => apiCall(`/orders/${id}/payment`, 'PUT', { paymentStatus }, token),
  cancel: (token, id) => apiCall(`/orders/${id}/cancel`, 'PUT', {}, token)
}

// Cart API
export const cartAPI = {
  getCart: (token) => apiCall('/cart', 'GET', null, token),
  addItem: (token, productId, quantity) => apiCall('/cart/add', 'POST', { productId, quantity }, token),
  updateItem: (token, productId, quantity) => apiCall(`/cart/update/${productId}`, 'PUT', { quantity }, token),
  removeItem: (token, productId) => apiCall(`/cart/remove/${productId}`, 'DELETE', null, token),
  clearCart: (token) => apiCall('/cart/clear', 'DELETE', null, token)
}

// Chat API
export const chatAPI = {
  // User: Get or create chat session
  getOrCreateSession: (sessionId, userId) => apiCall('/chat/session', 'POST', { sessionId, userId }),
  
  // User: Send message and get auto-response
  sendMessage: (sessionId, userId, text) => apiCall('/chat/message', 'POST', { sessionId, userId, text }),
  
  // Admin: Get all chat sessions
  getAllSessions: (token) => apiCall('/chat/sessions', 'GET', null, token),
  
  // Admin: Get chat by session ID
  getChatBySession: (token, sessionId) => apiCall(`/chat/session/${sessionId}`, 'GET', null, token),
  
  // Admin: Reply to chat
  replyToChat: (token, sessionId, text) => apiCall('/chat/reply', 'POST', { sessionId, text }, token),
  
  // Admin: Close chat
  closeChat: (token, sessionId) => apiCall(`/chat/close/${sessionId}`, 'PUT', {}, token),
  
  // Admin: Delete chat
  deleteChat: (token, sessionId) => apiCall(`/chat/${sessionId}`, 'DELETE', null, token)
}

// Content API (About, Blog, Contact)
export const contentAPI = {
  // About
  getAbout: () => apiCall('/content/about'),
  updateAbout: (token, data) => apiCall('/content/about', 'PUT', data, token),
  
  // Team
  getTeam: () => apiCall('/content/team'),
  createTeamMember: (token, data) => apiCall('/content/team', 'POST', data, token),
  updateTeamMember: (token, id, data) => apiCall(`/content/team/${id}`, 'PUT', data, token),
  deleteTeamMember: (token, id) => apiCall(`/content/team/${id}`, 'DELETE', null, token),
  
  // Blog
  getBlogs: () => apiCall('/content/blogs'),
  getBlogById: (id) => apiCall(`/content/blogs/${id}`),
  createBlog: (token, data) => apiCall('/content/blogs', 'POST', data, token),
  updateBlog: (token, id, data) => apiCall(`/content/blogs/${id}`, 'PUT', data, token),
  deleteBlog: (token, id) => apiCall(`/content/blogs/${id}`, 'DELETE', null, token),
  
  // Contact
  submitContact: (data) => apiCall('/content/contact', 'POST', data),
  getContacts: (token) => apiCall('/content/contact', 'GET', null, token),
  updateContact: (token, id, data) => apiCall(`/content/contact/${id}`, 'PUT', data, token),
  deleteContact: (token, id) => apiCall(`/content/contact/${id}`, 'DELETE', null, token)
}

export default {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  cart: cartAPI,
  chat: chatAPI,
  content: contentAPI
}
