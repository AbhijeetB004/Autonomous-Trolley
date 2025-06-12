const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customerId: String,
  storeId: String,
  trolleyId: String,
  orderType: String,
  items: [
    {
      productId: String,
      name: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number,
      shelfLocation: {
        aisle: String,
        coordinates: {
          x: Number,
          y: Number,
        },
      },
      status: String,
      collectedAt: Date,
      notes: String,
    },
  ],
  pricing: {
    subtotal: Number,
    tax: Number,
    discount: Number,
    total: Number,
  },
  status: { type: String, enum: ['pending', 'in_progress', 'collecting', 'completed', 'cancelled'], default: 'pending' },
  timeline: {
    orderedAt: Date,
    assignedAt: Date,
    startedAt: Date,
    completedAt: Date,
    estimatedCompletion: Date,
  },
  trolleyAssignment: {
    assignedAt: Date,
    estimatedTime: Number,
    route: [String],
    priority: { type: String, enum: ['high', 'normal', 'low'], default: 'normal' },
  },
  communication: {
    mqttTopic: String,
    lastStatusUpdate: Date,
    messagesSent: Number,
    messagesReceived: Number,
  },
  metadata: {
    deviceInfo: String,
    sessionId: String,
    ipAddress: String,
  },
});

module.exports = mongoose.model('Order', orderSchema); 