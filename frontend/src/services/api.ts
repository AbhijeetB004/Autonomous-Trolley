import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
}

// Products API
export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  getByCategory: (category: string) => api.get(`/products/category/${category}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  updateInventory: (id: string, data: any) => api.put(`/products/${id}/inventory`, data),
  getLowStock: () => api.get('/products/low-stock'),
}

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// Orders API
export const ordersApi = {
  // Customer endpoints
  create: (data: any) => api.post('/orders', data),
  getUserOrders: () => api.get('/orders/user'),
  getUserOrderById: (id: string) => api.get(`/orders/user/${id}`),
  
  // Admin endpoints
  getAll: (status?: string) => api.get(`/orders${status ? `?status=${status}` : ''}`),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
  delete: (id: string) => api.delete(`/orders/${id}`),
}

// Trolleys API
export const trolleysApi = {
  getAll: () => api.get('/trolleys'),
  getById: (id: string) => api.get(`/trolleys/${id}`),
  create: (data: any) => api.post('/trolleys', data),
  update: (id: string, data: any) => api.put(`/trolleys/${id}`, data),
  updateStatus: (id: string, data: any) => api.put(`/trolleys/${id}/status`, data),
}

export default api