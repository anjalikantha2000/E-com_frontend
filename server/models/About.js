import mongoose from 'mongoose'

const aboutSchema = new mongoose.Schema({
  story: {
    type: String,
    default: ''
  },
  stats: {
    happyCustomers: { type: String, default: '500K+' },
    products: { type: String, default: '50K+' },
    citiesServed: { type: String, default: '100+' },
    averageRating: { type: String, default: '4.8★' }
  },
  values: [{
    icon: String,
    title: String,
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

const About = mongoose.model('About', aboutSchema)

export default About
