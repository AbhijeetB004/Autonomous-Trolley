const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  profile: {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    phone: String,
    dateOfBirth: Date,
  },
  authentication: {
    passwordHash: String,
    lastLogin: Date,
    loginCount: Number,
    accountStatus: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
  },
  preferences: {
    favoriteStore: String,
    dietaryRestrictions: [String],
    preferredCategories: [String],
    language: String,
    notifications: {
      orderUpdates: Boolean,
      promotions: Boolean,
      newProducts: Boolean,
    },
  },
  orderHistory: {
    totalOrders: Number,
    totalSpent: Number,
    averageOrderValue: Number,
    lastOrderDate: Date,
    favoriteItems: [String],
  },
  loyalty: {
    points: Number,
    tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
    joinDate: Date,
  },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
