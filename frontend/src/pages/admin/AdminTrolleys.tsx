import React, { useEffect, useState } from 'react'
import { Plus, Search, Edit, Truck, Battery, MapPin, Activity } from 'lucide-react'
import { trolleysApi } from '../../services/api'
import { Trolley } from '../../types'
import { formatDate, getStatusColor } from '../../utils/format'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const AdminTrolleys: React.FC = () => {
  const [trolleys, setTrolleys] = useState<Trolley[]>([])
  const [filteredTrolleys, setFilteredTrolleys] = useState<Trolley[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrolleys()
  }, [])

  useEffect(() => {
    let filtered = trolleys

    if (searchTerm) {
      filtered = filtered.filter(trolley =>
        trolley.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trolley.trolleyId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus) {
      filtered = filtered.filter(trolley => trolley.status.operational === selectedStatus)
    }

    setFilteredTrolleys(filtered)
  }, [trolleys, searchTerm, selectedStatus])

  const fetchTrolleys = async () => {
    try {
      const response = await trolleysApi.getAll()
      setTrolleys(response.data)
      setFilteredTrolleys(response.data)
    } catch (error) {
      console.error('Error fetching trolleys:', error)
      toast.error('Failed to load trolleys')
    } finally {
      setIsLoading(false)
    }
  }

  

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-success-600'
    if (level > 30) return 'text-warning-600'
    return 'text-error-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trolleys Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage smart trolleys</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          <span onClick={() => navigate('/admin/trolleys/new')}>Add Trolley</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search trolleys..."
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
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredTrolleys.length} of {trolleys.length} trolleys
          </p>
        </div>
      </div>

      {/* Trolleys Grid */}
      {filteredTrolleys.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trolleys found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrolleys.map((trolley) => (
            <div key={trolley._id} className="card hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{trolley.name}</h3>
                    <p className="text-sm text-gray-600">ID: {trolley.trolleyId}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600" onClick={() => navigate(`/admin/trolleys/${trolley._id}/edit`)}>
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {/* Status */}
              <div className="mb-4">
                <span className={`badge badge-${getStatusColor(trolley.status.operational)}`}>
                  {trolley.status.operational}
                </span>
              </div>

              {/* Battery */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Battery className={`w-4 h-4 ${getBatteryColor(trolley.status.battery.level)}`} />
                    <span className="text-sm font-medium text-gray-700">Battery</span>
                  </div>
                  <span className={`text-sm font-semibold ${getBatteryColor(trolley.status.battery.level)}`}>
                    {trolley.status.battery.level}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      trolley.status.battery.level > 60 ? 'bg-success-600' :
                      trolley.status.battery.level > 30 ? 'bg-warning-600' : 'bg-error-600'
                    }`}
                    style={{ width: `${trolley.status.battery.level}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Runtime: {trolley.status.battery.estimatedRuntime}h</span>
                  <span>{trolley.status.battery.chargingStatus}</span>
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Location</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>X: {trolley.status.location.current.x}, Y: {trolley.status.location.current.y}</p>
                  <p>Heading: {trolley.status.location.current.heading}°</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Activity className={`w-3 h-3 ${trolley.status.location.isMoving ? 'text-success-600' : 'text-gray-400'}`} />
                    <span className="text-xs">
                      {trolley.status.location.isMoving ? 'Moving' : 'Stationary'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Order */}
              {trolley.currentOrder ? (
                <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-900">Current Order</span>
                    <span className="text-xs text-primary-700">{trolley.currentOrder.progress}%</span>
                  </div>
                  <p className="text-sm text-primary-800">#{trolley.currentOrder.orderId}</p>
                  <p className="text-xs text-primary-700">{trolley.currentOrder.currentTask}</p>
                  <div className="w-full bg-primary-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-primary-600 h-1.5 rounded-full"
                      style={{ width: `${trolley.currentOrder.progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">No active order</p>
                </div>
              )}

              {/* Hardware Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Model: {trolley.hardware.model}</p>
                <p>Firmware: {trolley.hardware.firmwareVersion}</p>
                <p>Last Seen: {formatDate(trolley.communication.lastSeen)}</p>
              </div>

              {/* Sensors Status */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-gray-500">LIDAR</p>
                    <span className={`badge ${trolley.status.sensors?.lidarStatus === 'online' ? 'badge-success' : 'badge-error'}`}>
                      {trolley.status.sensors?.lidarStatus || 'N/A'}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Camera</p>
                    <span className={`badge ${trolley.status.sensors?.cameraStatus === 'online' ? 'badge-success' : 'badge-error'}`}>
                      {trolley.status.sensors?.cameraStatus || 'N/A'}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Motors</p>
                    <span className={`badge ${trolley.status.sensors?.motorsStatus === 'online' ? 'badge-success' : 'badge-error'}`}>
                      {trolley.status.sensors?.motorsStatus || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminTrolleys