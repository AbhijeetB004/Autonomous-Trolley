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
    <div className="space-y-6 fade-in p-4 sm:p-6 lg:p-8 pt-12 overflow-x-hidden max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 w-full max-w-full flex-wrap">
        <div className="flex flex-col min-w-0 flex-grow">
          <Link
            to="/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors w-fit mb-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1 max-w-full overflow-hidden">
            <h1 className="text-2xl font-bold text-gray-900 overflow-hidden min-w-0 break-words">Order #{order.orderId}</h1>
            <p className="text-gray-600 mt-1 text-sm whitespace-nowrap overflow-hidden text-ellipsis">Placed on {formatDate(order.timeline.orderedAt || '')}</p>
          </div>
        </div>
        {order.trolleyId && order.status !== 'completed' && (
          <Link to={`/trolley/${order.trolleyId}`} className="btn-secondary-sm w-full sm:w-auto mt-4 sm:mt-0 flex-shrink-0">
            <Truck className="w-4 h-4 mr-2" />
            Track Trolley
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-full">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 w-full min-w-0 max-w-full">
          {/* Order Status */}
          <div className="card w-full max-w-full overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-2 sm:space-y-0 w-full flex-wrap max-w-full">
              <span className={`badge badge-${getStatusColor(order.status)} text-sm px-3 py-1 flex-shrink-0 max-w-full text-ellipsis overflow-hidden block`}> {order.status.replace('_', ' ').toUpperCase()} </span>
              {order.trolleyId && (
                <div className="flex items-center text-sm text-gray-600 flex-wrap min-w-0 flex-shrink-0 max-w-full">
                  <Truck className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0">Trolley: {order.trolleyId}</span>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="relative max-w-full overflow-hidden">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6 w-full max-w-full">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="relative flex items-start min-w-0 w-full max-w-full">
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.isActive ? (step.isCurrent ? 'bg-primary-600 text-white' : 'bg-success-600 text-white') : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <p className={`font-medium ${step.isActive ? 'text-gray-900' : 'text-gray-500'}`}> {step.label} </p>
                      {step.isCurrent && (<p className="text-sm text-primary-600 whitespace-nowrap overflow-hidden text-ellipsis">Current status</p>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card w-full max-w-full overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4 w-full max-w-full">
              {order.items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0 w-full min-w-0 max-w-full overflow-hidden">
                  <div className="flex items-center space-x-4 flex-grow min-w-0 max-w-full">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink0">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-600 min-w-0 mt-1 w-full">
                        <span className="whitespace-nowrap flex-shrink-0 min-w-0 overflow-hidden text-ellipsis">Qty: {item.quantity}</span>
                        <span className="hidden sm:inline flex-shrink-0">•</span>
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis flex-shrink-0 min-w-0">{formatCurrency(item.unitPrice)} each</span>
                        {item.shelfLocation && (
                          <>
                            <span className="hidden sm:inline flex-shrink-0">•</span>
                            <div className="flex items-center whitespace-nowrap overflow-hidden text-ellipsis flex-shrink-0 min-w-0">
                              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                              Aisle {item.shelfLocation.aisle}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto min-w-0">
                    <p className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{formatCurrency(item.totalPrice)}</p>
                    {item.status && (<span className={`badge badge-${getStatusColor(item.status)} text-xs mt-1 sm:mt-0 block max-w-full text-ellipsis overflow-hidden`}>{item.status}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (Order Summary, Trolley Assignment, Timeline) */}
        <div className="lg:col-span-1 space-y-6 w-full min-w-0 max-w-full">
          {/* Order Summary */}
          <div className="card w-full max-w-full overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 w-full max-w-full">
              <div className="flex justify-between text-sm w-full min-w-0 max-w-full">
                <span className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">Subtotal</span>
                <span className="text-gray-900 whitespace-nowrap flex-shrink-0">{formatCurrency(order.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm w-full min-w-0 max-w-full">
                <span className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">Tax</span>
                <span className="text-gray-900 whitespace-nowrap flex-shrink-0">{formatCurrency(order.pricing.tax)}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-sm w-full min-w-0 max-w-full">
                  <span className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">Discount</span>
                  <span className="text-success-600 whitespace-nowrap flex-shrink-0">-{formatCurrency(order.pricing.discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 w-full min-w-0 max-w-full">
                <div className="flex justify-between w-full min-w-0 max-w-full">
                  <span className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">Total</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap flex-shrink-0">{formatCurrency(order.pricing.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trolley Assignment */}
          {order.trolleyAssignment && (
            <div className="card w-full max-w-full overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trolley Assignment</h2>
              <div className="space-y-3 w-full max-w-full">
                <div className="flex justify-between text-sm w-full min-w-0 max-w-full">
                  <span className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">Priority</span>
                  <span className={`badge badge-${
                    order.trolleyAssignment.priority === 'high' ? 'error' :
                    order.trolleyAssignment.priority === 'normal' ? 'primary' : 'gray'
                  }`}>
                    {order.trolleyAssignment.priority}
                  </span>
                </div>
                {order.trolleyAssignment.estimatedTime && (
                  <div className="flex justify-between text-sm w-full min-w-0 max-w-full">
                    <span className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">Est. Time</span>
                    <span className="text-gray-900 whitespace-nowrap flex-shrink-0">{order.trolleyAssignment.estimatedTime} min</span>
                  </div>
                )}
                {order.trolleyAssignment.assignedAt && (
                  <div className="flex justify-between text-sm w-full min-w-0 max-w-full">
                    <span className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">Assigned</span>
                    <span className="text-gray-900 whitespace-nowrap flex-shrink-0">
                      {formatDate(order.trolleyAssignment.assignedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card w-full max-w-full overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="relative pl-4 w-full max-w-full">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-4 w-full max-w-full">
                {Object.entries(order.timeline).map(([key, value]) => {
                  if (!value) return null
                  let label = ''
                  switch (key) {
                    case 'orderedAt': label = 'Order Placed'; break;
                    case 'processedAt': label = 'Order Processed'; break;
                    case 'pickedUpAt': label = 'Picked Up by Trolley'; break;
                    case 'deliveredAt': label = 'Delivered'; break;
                    case 'cancelledAt': label = 'Cancelled'; break;
                    default: label = key;
                  }
                  return (
                    <div key={key} className="relative flex items-center w-full min-w-0 max-w-full">
                      <div className="absolute -left-2.5 w-5 h-5 rounded-full bg-primary-600 z-10 flex-shrink-0"></div>
                      <div className="flex flex-col ml-2 min-w-0">
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{formatDate(value)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails