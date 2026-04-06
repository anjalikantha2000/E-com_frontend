import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  discountPercent: {
    type: Number,
    default: 0
  },
  profitPercent: {
    type: Number,
    default: 0
  },
  gstPercent: {
    type: Number,
    default: 18
  },
  finalPrice: {
    type: Number
  },
  image: {
    type: String
  },
  brand: {
    type: String,
    default: 'AnJaliCart'
  },
  rating: {
    type: Number,
    default: 4.5
  },
  reviews: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Calculate final price before saving
productSchema.pre('save', function(next) {
  const discountAmount = (this.basePrice * this.discountPercent) / 100
  const priceAfterDiscount = this.basePrice - discountAmount
  const gstAmount = (priceAfterDiscount * this.gstPercent) / 100
  this.finalPrice = priceAfterDiscount + gstAmount
  this.updatedAt = Date.now()
  next()
})

const Product = mongoose.model('Product', productSchema)

export default Product
