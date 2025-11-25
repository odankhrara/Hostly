const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  traveler_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  }
}, {
  timestamps: true
});

// Unique constraint: one user can favorite a property only once
favoriteSchema.index({ traveler_id: 1, property_id: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
