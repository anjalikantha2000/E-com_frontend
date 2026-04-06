import { createBrowserRouter, redirect } from 'react-router-dom'
import App from '../App'
import Home from '../pages/Home'
import About from '../pages/About'
import Products from '../pages/Products'
import ProductDetail from '../pages/ProductDetail'
import Blog from '../pages/Blog'
import Contact from '../pages/Contact'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import CartPage from '../pages/CartPage'
import WishlistPage from '../pages/WishlistPage'
import NotFound from '../pages/NotFound'
import Admin from '../pages/Admin'
import Profile from '../pages/Profile'
import OrderHistory from '../pages/OrderHistory'

// Route access protection based on user's access pages
const requireAccessLoader = (requiredPage) => () => {
  const userData = localStorage.getItem('userData')
  const userLoggedIn = localStorage.getItem('userLoggedIn')
  
  // For public routes like home - no login required
  if (requiredPage === 'home' && !userLoggedIn) {
    return null
  }
  
  // For all other routes, require login and specific access
  if (!userData || userLoggedIn !== 'true') {
    return redirect('/login')
  }
  
  let user = null
  try {
    user = JSON.parse(userData)
  } catch (e) {
    console.error('Error parsing userData:', e)
    return redirect('/login')
  }
  
  const isAdmin = user.role === 'admin' || user.email === 'admin@anjalicart.com'
  
  // Admin has access to all pages
  if (isAdmin) {
    return null
  }
  
  // If user access is undefined or not an array, allow access to basic pages
  if (!user.access || !Array.isArray(user.access)) {
    // Default access - allow basic pages
    return null
  }
  
  // Check if user has access to the required page
  if (user.access && user.access.includes(requiredPage)) {
    return null
  }
  
  // If user doesn't have access, redirect to home with a message
  return redirect('/')
}

// Admin route protection
const adminLoader = () => {
  const userData = localStorage.getItem('userData')
  const userLoggedIn = localStorage.getItem('userLoggedIn')
  
  if (!userData || userLoggedIn !== 'true') {
    return redirect('/login')
  }
  
  let user = null
  try {
    user = JSON.parse(userData)
  } catch (e) {
    console.error('Error parsing userData:', e)
    return redirect('/login')
  }
  
  const isAdmin = user.role === 'admin' || user.email === 'admin@anjalicart.com'
  
  if (!isAdmin) {
    return redirect('/')
  }
  
  return null
}

// Auth route protection (redirect to home if already logged in)
const authLoader = () => {
  const userLoggedIn = localStorage.getItem('userLoggedIn')
  if (userLoggedIn === 'true') {
    return redirect('/')
  }
  return null
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About />, loader: requireAccessLoader('about') },
      { path: 'products', element: <Products />, loader: requireAccessLoader('products') },
      { path: 'products/:id', element: <ProductDetail />, loader: requireAccessLoader('products') },
      { path: 'product/:id', element: <ProductDetail />, loader: requireAccessLoader('products') },
      { path: 'blog', element: <Blog />, loader: requireAccessLoader('blog') },
      { path: 'contact', element: <Contact />, loader: requireAccessLoader('contact') },
      { path: 'cart', element: <CartPage />, loader: requireAccessLoader('cart') },
      { path: 'wishlist', element: <WishlistPage />, loader: requireAccessLoader('wishlist') },
      { path: 'orders', element: <OrderHistory />, loader: requireAccessLoader('orders') },
      { 
        path: 'admin', 
        element: <Admin />,
        loader: adminLoader
      },
      { path: 'profile', element: <Profile />, loader: requireAccessLoader('profile') },
    ],
  },
  { 
    path: '/login', 
    element: <Login />,
    loader: authLoader
  },
  { 
    path: '/signup', 
    element: <Signup />,
    loader: authLoader
  },
  { path: '*', element: <NotFound /> },
])

export default router
