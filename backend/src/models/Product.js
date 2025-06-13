const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, unique: true },
  name: String,
  description: String,
  category: String,
  subcategory: String,
  brand: String,
  price: {
    amount: Number,
    currency: { type: String, default: 'INR' },
    discountPrice: Number,
    onSale: Boolean,
  },
  images: [String],
  nutritionInfo: {
    calories: Number,
    protein: String,
    fat: String,
    carbs: String,
  },
  barcodes: [String],
  shelfLocation: {
    storeId: String,
    aisle: String,
    section: String,
    shelf: String,
    coordinates: {
      x: Number,
      y: Number,
      z: Number,
    },
  },
  inventory: {
    inStock: Boolean,
    quantity: Number,
    minThreshold: Number,
    maxCapacity: Number,
  },
  tags: [String],
  allergens: [String],
  status: { type: String, enum: ['active', 'discontinued', 'out-of-season'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
