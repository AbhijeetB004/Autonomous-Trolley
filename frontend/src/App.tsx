import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminTrolleys from './pages/admin/AdminTrolleys'
import AdminCategories from './pages/admin/AdminCategories'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLogin from './pages/auth/AdminLogin'
import ConnectTrolley from './pages/ConnectTrolley'

function App() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
      <Route path="/admin-login" element={!user ? <AdminLogin /> : <Navigate to="/" replace />} />
      
      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Customer routes */}
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="connect-trolley" element={<ConnectTrolley />} />
        
        {/* Admin routes */}
        <Route path="admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/products" element={
          <ProtectedRoute requireAdmin>
            <AdminProducts />
          </ProtectedRoute>
        } />
        <Route path="admin/orders" element={
          <ProtectedRoute requireAdmin>
            <AdminOrders />
          </ProtectedRoute>
        } />
        <Route path="admin/trolleys" element={
          <ProtectedRoute requireAdmin>
            <AdminTrolleys />
          </ProtectedRoute>
        } />
        <Route path="admin/categories" element={
          <ProtectedRoute requireAdmin>
            <AdminCategories />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App