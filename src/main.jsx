import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './routes/routes'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { OrderProvider } from './context/OrderContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <OrderProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </OrderProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
