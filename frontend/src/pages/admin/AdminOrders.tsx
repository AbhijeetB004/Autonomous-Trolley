import React, { useEffect, useState } from 'react'
import { Eye, Search, Truck, Package } from 'lucide-react'
import { ordersApi, trolleysApi } from '../../services/api'
import { Order, Trolley } from '../../types'
import { formatCurrency, formatDate, getStatusColor } from '../../utils/format'
import toast from 'react-hot-toast'

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [trolleys, setTrolleys] = useState<Trolley[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus) {
      filtered = filtered.filter(order => order.status === selectedStatus)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, selectedStatus])

  const fetchData = async () => {
    try {
      const [ordersResponse, trolleysResponse] = await Promise.all([
        ordersApi.getAll(),
        trolleysApi.getAll(),
      ])

      setOrders(ordersResponse.data)
      setTrolleys(trolleysResponse.data)
      setFilteredOrders(ordersResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, status: string, trolleyId?: string) => {
    try {
      const updateData: any = { status }
      if (trolleyId) {
        updateData.trolleyId = trolleyId
        updateData.trolleyAssignment = {
          assignedAt: new Date().toISOString(),
          estimatedTime: 30, // Default 30 minutes
          priority: 'normal',
        }
      }

      await ordersApi.updateStatus(orderId, updateData)
      toast.success('Order status updated successfully')
      fetchData()
      setShowAssignModal(false)
      setSelectedOrder(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order status')
    }
  }

  const handleAssignTrolley = (order: Order) => {
    setSelectedOrder(order)
    setShowAssignModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    )
  }

  const availableTrolleys = trolleys.filter(trolley => 
    trolley.status.operational === 'active' && !trolley.currentOrder?.orderId
  )

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              className="input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="collecting">Collecting</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trolley
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.pricing.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className={`badge badge-${getStatusColor(order.status)} border-0 text-xs`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="collecting">Collecting</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.trolleyId ? (
                        <span className="badge badge-success">{order.trolleyId}</span>
                      ) : (
                        <button
                          onClick={() => handleAssignTrolley(order)}
                          className="btn-secondary text-xs"
                          disabled={order.status === 'completed' || order.status === 'cancelled'}
                        >
                          <Truck className="w-3 h-3 mr-1" />
                          Assign
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.timeline.orderedAt || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Trolley Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Trolley to Order #{selectedOrder.orderId}
            </h3>
            
            {availableTrolleys.length === 0 ? (
              <div className="text-center py-4">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No available trolleys</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableTrolleys.map((trolley) => (
                  <button
                    key={trolley._id}
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'in_progress', trolley.trolleyId)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{trolley.name}</p>
                        <p className="text-sm text-gray-600">ID: {trolley.trolleyId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Battery: {trolley.status.battery.level}%
                        </p>
                        <span className="badge badge-success">Available</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedOrder(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders