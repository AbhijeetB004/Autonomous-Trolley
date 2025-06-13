import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, Clock, TrendingUp, Wifi } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { ordersApi, productsApi } from '../services/api'
import { Order, Product } from '../types'
import { formatCurrency, formatRelativeTime, getStatusColor } from '../utils/format'
import { useCartStore } from '../stores/cartStore'

const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const { trolleyId: connectedTrolleyId, clearTrolleyId } = useCartStore()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersResponse, productsResponse] = await Promise.all([
          ordersApi.getUserOrders(),
          productsApi.getAll(),
        ])

        const orders = ordersResponse.data
        setRecentOrders(orders.slice(0, 5))
        
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: Order) => o.status === 'pending').length,
          completedOrders: orders.filter((o: Order) => o.status === 'completed').length,
        })

        // Get featured products (first 6 active products)
        const products = productsResponse.data.filter((p: Product) => p.status === 'active')
        setFeaturedProducts(products.slice(0, 6))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white mt-4">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-primary-100 mt-1">
          Ready for your next shopping experience?
        </p>
      </div>

      {/* Trolley Connection Status */}
      <div className="card p-4 sm:p-6 flex items-center justify-between">
        {connectedTrolleyId ? (
          <div className="flex items-center space-x-2 text-primary-600">
            <Wifi className="w-5 h-5" />
            <p className="font-semibold">Connected to Trolley: <span className="font-bold">{connectedTrolleyId}</span></p>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-gray-600">
            <Wifi className="w-5 h-5" />
            <p>Not connected to any trolley.</p>
          </div>
        )}
        {connectedTrolleyId ? (
          <button onClick={clearTrolleyId} className="btn-secondary text-error-600 hover:text-error-700">
            Disconnect
          </button>
        ) : (
          <Link to="/connect-trolley" className="btn-primary">
            Connect to Trolley
          </Link>
        )}
      </div>

      {/* Stats Cards - Only for admin */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 rounded-lg">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              to="/orders"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <Link to="/products" className="btn-primary mt-3">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderId}</p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} items • {formatRelativeTime(order.timeline.orderedAt || '')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(order.pricing.total)}
                    </p>
                    <span className={`badge badge-${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Featured Products</h2>
            <Link
              to="/products"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products`}
                className="group block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <h3 className="font-medium text-sm text-gray-900 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm font-semibold text-primary-600">
                  {formatCurrency(product.price.amount)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard