const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  city: {
    type: String,
    required: true,
    maxlength: 100
  },
  state: {
    type: String,
    required: true,
    maxlength: 2
  },
  country: {
    type: String,
    required: true,
    maxlength: 100
  },
  property_type: {
    type: String,
    required: true,
    maxlength: 50
  },
  price_per_night: {
    type: Number,
    required: true,
    min: 0
  },
  bedrooms: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  bathrooms: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  max_guests: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: {
    type: String,
    default: null
  },
  main_image: {
    type: String,
    default: null,
    maxlength: 255
  },
  tax_rate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    comment: 'Tax rate percentage based on city/location'
  }
}, {
  timestamps: true
});

// Index for faster queries
propertySchema.index({ owner_id: 1 });
propertySchema.index({ city: 1, state: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
