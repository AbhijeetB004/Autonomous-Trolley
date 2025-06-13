import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, Clock, Truck } from 'lucide-react'
import { ordersApi } from '../services/api'
import { Order } from '../types'
import { formatCurrency, formatDate, getStatusColor } from '../utils/format'
import toast from 'react-hot-toast'

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return

      try {
        const response = await ordersApi.getUserOrderById(id)
        setOrder(response.data)
      } catch (error) {
        console.error('Error fetching order:', error)
        toast.error('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
        <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/orders" className="btn-primary">
          Back to Orders
        </Link>
      </div>
    )
  }

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Package },
      { key: 'in_progress', label: 'In Progress', icon: Clock },
      { key: 'collecting', label: 'Collecting Items', icon: Truck },
      { key: 'completed', label: 'Completed', icon: Package },
    ]

    const currentIndex = steps.findIndex(step => step.key === order.status)
    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentIndex,
      isCurrent: step.key === order.status,
    }))
  }

  const statusSteps = getStatusSteps()

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/orders"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.orderId}
          </h1>
          <p className="text-gray-600 mt-1">
            Placed on {formatDate(order.timeline.orderedAt || '')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            
            <div className="flex items-center justify-between mb-6">
              <span className={`badge badge-${getStatusColor(order.status)} text-sm px-3 py-1`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
              {order.trolleyId && (
                <div className="flex items-center text-sm text-gray-600">
                  <Truck className="w-4 h-4 mr-1" />
                  Trolley: {order.trolleyId}
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="relative flex items-center">
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.isActive
                          ? step.isCurrent
                            ? 'bg-primary-600 text-white'
                            : 'bg-success-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="ml-4">
                      <p className={`font-medium ${step.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {step.isCurrent && (
                        <p className="text-sm text-primary-600">Current status</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        <span>{formatCurrency(item.unitPrice)} each</span>
                        {item.shelfLocation && (
                          <>
                            <span>•</span>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              Aisle {item.shelfLocation.aisle}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.totalPrice)}
                    </p>
                    {item.status && (
                      <span className={`badge badge-${getStatusColor(item.status)} text-xs`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">{formatCurrency(order.pricing.tax)}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-success-600">-{formatCurrency(order.pricing.discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(order.pricing.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trolley Assignment */}
          {order.trolleyAssignment && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trolley Assignment</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Priority</span>
                  <span className={`badge badge-${
                    order.trolleyAssignment.priority === 'high' ? 'error' :
                    order.trolleyAssignment.priority === 'normal' ? 'primary' : 'gray'
                  }`}>
                    {order.trolleyAssignment.priority}
                  </span>
                </div>
                {order.trolleyAssignment.estimatedTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Est. Time</span>
                    <span className="text-gray-900">{order.trolleyAssignment.estimatedTime} min</span>
                  </div>
                )}
                {order.trolleyAssignment.assignedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Assigned</span>
                    <span className="text-gray-900">
                      {formatDate(order.trolleyAssignment.assignedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              {order.timeline.orderedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ordered</span>
                  <span className="text-gray-900">{formatDate(order.timeline.orderedAt)}</span>
                </div>
              )}
              {order.timeline.assignedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned</span>
                  <span className="text-gray-900">{formatDate(order.timeline.assignedAt)}</span>
                </div>
              )}
              {order.timeline.startedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Started</span>
                  <span className="text-gray-900">{formatDate(order.timeline.startedAt)}</span>
                </div>
              )}
              {order.timeline.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="text-gray-900">{formatDate(order.timeline.completedAt)}</span>
                </div>
              )}
              {order.timeline.estimatedCompletion && !order.timeline.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Completion</span>
                  <span className="text-gray-900">{formatDate(order.timeline.estimatedCompletion)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails