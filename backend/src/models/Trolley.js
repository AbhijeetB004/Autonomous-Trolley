const mongoose = require('mongoose');

const trolleySchema = new mongoose.Schema({
  trolleyId: { type: String, unique: true },
  name: String,
  storeId: String,
  hardware: {
    serialNumber: String,
    model: String,
    firmwareVersion: String,
    sensors: [String],
    batteryCapacity: String,
    maxPayload: Number,
  },
  status: {
    operational: { type: String, enum: ['active', 'maintenance', 'offline', 'error'], default: 'active' },
    battery: {
      level: Number,
      voltage: Number,
      estimatedRuntime: Number,
      chargingStatus: String,
    },
    location: {
      current: {
        x: Number,
        y: Number,
        heading: Number,
      },
      lastKnown: {
        x: Number,
        y: Number,
        timestamp: Date,
      },
      isMoving: Boolean,
    },
    sensors: {
      lidarStatus: String,
      cameraStatus: String,
      motorsStatus: String,
      lastHealthCheck: Date,
    },
    availableForConnection: { type: Boolean, default: true },
  },
  currentOrder: {
    orderId: String,
    assignedAt: Date,
    currentTask: String,
    progress: Number,
  },
  communication: {
    mqttTopic: String,
    lastSeen: Date,
    connectionStatus: String,
    messageLatency: Number,
  },
  qrCode: {
    code: String,
    generatedAt: Date,
    expiresAt: Date,
  },
  maintenance: {
    lastService: Date,
    nextService: Date,
    totalOrders: Number,
    totalDistance: Number,
    serviceHistory: [mongoose.Schema.Types.Mixed],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trolley', trolleySchema); 