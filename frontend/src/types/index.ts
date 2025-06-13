export interface User {
  userId: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'customer'
  preferences?: {
    favoriteStore?: string
    dietaryRestrictions?: string[]
    preferredCategories?: string[]
    language?: string
    notifications?: {
      orderUpdates: boolean
      promotions: boolean
      newProducts: boolean
    }
  }
}

export interface Product {
  _id: string
  productId: string
  name: string
  description: string
  category: string
  subcategory?: string
  brand: string
  price: {
    amount: number
    currency: string
    discountPrice?: number
    onSale: boolean
  }
  images: string[]
  nutritionInfo?: {
    calories: number
    protein: string
    fat: string
    carbs: string
  }
  barcodes: string[]
  shelfLocation: {
    storeId: string
    aisle: string
    section: string
    shelf: string
    coordinates: {
      x: number
      y: number
      z: number
    }
  }
  inventory: {
    inStock: boolean
    quantity: number
    minThreshold?: number
    maxCapacity?: number
  }
  tags: string[]
  allergens: string[]
  status: 'active' | 'discontinued' | 'out-of-season'
  createdAt: string
  updatedAt: string
}

export interface Category {
  _id: string
  name: string
  subcategories: string[]
}

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  shelfLocation: {
    aisle: string
    coordinates: {
      x: number
      y: number
    }
  }
  status?: string
  collectedAt?: string
  notes?: string
}

export interface Order {
  _id: string
  orderId: string
  customerId: string
  storeId?: string
  trolleyId?: string
  orderType?: string
  items: OrderItem[]
  pricing: {
    subtotal: number
    tax: number
    discount: number
    total: number
  }
  status: 'pending' | 'in_progress' | 'collecting' | 'completed' | 'cancelled'
  timeline: {
    orderedAt?: string
    assignedAt?: string
    startedAt?: string
    completedAt?: string
    estimatedCompletion?: string
  }
  trolleyAssignment?: {
    assignedAt?: string
    estimatedTime?: number
    route?: string[]
    priority: 'high' | 'normal' | 'low'
  }
  communication?: {
    mqttTopic?: string
    lastStatusUpdate?: string
    messagesSent?: number
    messagesReceived?: number
  }
  metadata?: {
    deviceInfo?: string
    sessionId?: string
    ipAddress?: string
  }
}

export interface Trolley {
  _id: string
  trolleyId: string
  name: string
  storeId?: string
  hardware: {
    serialNumber: string
    model: string
    firmwareVersion: string
    sensors: string[]
    batteryCapacity: string
    maxPayload: number
  }
  status: {
    operational: 'active' | 'maintenance' | 'offline' | 'error'
    battery: {
      level: number
      voltage: number
      estimatedRuntime: number
      chargingStatus: string
    }
    location: {
      current: {
        x: number
        y: number
        heading: number
      }
      lastKnown: {
        x: number
        y: number
        timestamp: string
      }
      isMoving: boolean
    }
    sensors: {
      lidarStatus: string
      cameraStatus: string
      motorsStatus: string
      lastHealthCheck: string
    }
  }
  currentOrder?: {
    orderId: string
    assignedAt: string
    currentTask: string
    progress: number
  }
  communication: {
    mqttTopic: string
    lastSeen: string
    connectionStatus: string
    messageLatency: number
  }
  qrCode?: {
    code: string
    generatedAt: string
    expiresAt: string
  }
  maintenance: {
    lastService: string
    nextService: string
    totalOrders: number
    totalDistance: number
    serviceHistory: any[]
  }
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}