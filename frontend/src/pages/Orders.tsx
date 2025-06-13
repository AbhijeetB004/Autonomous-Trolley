import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Eye, Calendar, Package } from 'lucide-react'
import { ordersApi } from '../services/api'
import { Order } from '../types'
import { formatCurrency, formatDate, getStatusColor } from '../utils/format'
import toast from 'react-hot-toast'

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersApi.getUserOrders()
        const fetchedOrders: Order[] = response.data

        // Separate and sort orders: Running orders first, then completed/cancelled
        const runningStatuses = ['pending', 'in_progress', 'collecting']
        const running = fetchedOrders
          .filter(order => runningStatuses.includes(order.status))
          .sort((a, b) => new Date(b.timeline.orderedAt || '').getTime() - new Date(a.timeline.orderedAt || '').getTime())

        const completed = fetchedOrders
          .filter(order => !runningStatuses.includes(order.status))
          .sort((a, b) => new Date(b.timeline.orderedAt || '').getTime() - new Date(a.timeline.orderedAt || '').getTime())

        setOrders([...running, ...completed])

      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error('Failed to load orders')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    )
  }

  // Filter orders for display
  const runningOrders = orders.filter(order => ['pending', 'in_progress', 'collecting'].includes(order.status));
  const completedOrders = orders.filter(order => !['pending', 'in_progress', 'collecting'].includes(order.status));

  return (
    <div className="space-y-6 fade-in w-full p-4 sm:p-6 lg:p-8 pt-12 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage your orders</p>
        </div>
        <Link to="/products" className="btn-primary mt-4 sm:mt-0 w-full sm:w-auto">
          <Package className="w-4 h-4 mr-2" />
          Continue Shopping
        </Link>
      </div>

      {/* Filters - Removed for customer view
      <div className="card">
        <div className="flex items-center justify-end">
          <p className="text-sm text-gray-600">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div> */}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 w-full">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start shopping to create your first order
          </p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {/* Running Orders Section */}
          {runningOrders.length > 0 && (
            <h2 className="text-xl font-bold text-gray-900 mt-6">Running Orders</h2>
          )}
          {runningOrders.map((order) => (
            <div key={order._id} className="card hover:shadow-lg transition-shadow p-4 sm:p-6 w-full max-w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 w-full flex-wrap">
                <div className="flex items-start sm:items-center space-x-0 sm:space-x-4 flex-grow min-w-0 w-full sm:w-auto">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      Order #{order.orderId}
                    </h3>
                    <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mt-1 text-sm text-gray-600 min-w-0">
                      <div className="flex items-center flex-shrink-0">
                        <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{formatDate(order.timeline.orderedAt || '')}</span>
                      </div>
                      <span>•</span>
                      <span className="whitespace-nowrap flex-shrink-0">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0 w-full sm:w-auto min-w-0 flex-shrink-0">
                  <div className="text-left sm:text-right w-full sm:w-auto flex-shrink-0">
                    <p className="font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(order.pricing.total)}
                    </p>
                    <span className={`badge badge-${getStatusColor(order.status)} mt-1 sm:mt-0 inline-block`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn-secondary mt-2 sm:mt-0 w-full sm:w-auto flex-shrink-0"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="border-t border-gray-200 pt-4 mt-4 w-full overflow-hidden">
                <h4 className="font-semibold text-gray-800 mb-3">Order Items:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg w-full min-w-0">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity} • {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex items-center justify-center p-2 bg-gray-100 rounded-lg border border-gray-200 w-full min-w-0">
                      <span className="text-sm text-gray-600 font-medium">
                        +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trolley Info */}
              {order.trolleyId && order.status !== 'completed' && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between w-full overflow-hidden flex-wrap">
                  <div className="min-w-0 w-full sm:w-auto">
                    <p className="text-sm font-medium text-primary-900 truncate">
                      Assigned to Trolley: <span className="font-bold">{order.trolleyId}</span>
                    </p>
                    {order.trolleyAssignment?.estimatedTime && (
                      <p className="text-xs text-primary-700 mt-1 truncate">
                        Estimated completion: <span className="font-semibold">{order.trolleyAssignment.estimatedTime} minutes</span>
                      </p>
                    )}
                  </div>
                  <Link to={`/trolley/${order.trolleyId}`} className="btn-secondary-sm mt-3 sm:mt-0 flex-shrink-0 w-full sm:w-auto">Track Trolley</Link>
                </div>
              )}
            </div>
          ))}

          {/* Completed Orders Section */}
          {completedOrders.length > 0 && (
            <h2 className="text-xl font-bold text-gray-900 mt-6">Completed Orders</h2>
          )}
          {completedOrders.map((order) => (
            <div key={order._id} className="card hover:shadow-lg transition-shadow p-4 sm:p-6 w-full max-w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 w-full flex-wrap">
                <div className="flex items-start sm:items-center space-x-0 sm:space-x-4 flex-grow min-w-0 w-full sm:w-auto">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      Order #{order.orderId}
                    </h3>
                    <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mt-1 text-sm text-gray-600 min-w-0">
                      <div className="flex items-center flex-shrink-0">
                        <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{formatDate(order.timeline.orderedAt || '')}</span>
                      </div>
                      <span>•</span>
                      <span className="whitespace-nowrap flex-shrink-0">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0 w-full sm:w-auto min-w-0 flex-shrink-0">
                  <div className="text-left sm:text-right w-full sm:w-auto flex-shrink-0">
                    <p className="font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(order.pricing.total)}
                    </p>
                    <span className={`badge badge-${getStatusColor(order.status)} mt-1 sm:mt-0 max-w-full text-ellipsis overflow-hidden block`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn-secondary mt-2 sm:mt-0 w-full sm:w-auto flex-shrink-0"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="border-t border-gray-200 pt-4 mt-4 w-full overflow-hidden">
                <h4 className="font-semibold text-gray-800 mb-3">Order Items:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg w-full min-w-0">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity} • {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex items-center justify-center p-2 bg-gray-100 rounded-lg border border-gray-200 w-full min-w-0">
                      <span className="text-sm text-gray-600 font-medium">
                        +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders