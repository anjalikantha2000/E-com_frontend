import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  localId: {
    type: String,
    default: null
  },
  name: String,
  price: Number,
  quantity: Number,
  image: String
})

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  subtotal: {
    type: Number,
    required: true
  },
  gst: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'cod', 'wallet', 'razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'confirmed'
  },
  timeline: [{
    status: String,
    message: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Generate order ID before saving
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000)
  }
  this.updatedAt = Date.now()
  next()
})

const Order = mongoose.model('Order', orderSchema)

export default Order
