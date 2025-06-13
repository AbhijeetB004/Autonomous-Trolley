import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trolleysApi } from '../../services/api'
import toast from 'react-hot-toast'
import { ChevronLeft, Save } from 'lucide-react'

const CreateTrolley: React.FC = () => {
  const navigate = useNavigate()
  const [trolley, setTrolley] = useState({
    name: '',
    trolleyId: '',
    status: 'active', // Default status
    storeId: '',
    hardware: {
      serialNumber: '',
      model: '',
      firmwareVersion: '',
      sensors: '', // Will be parsed from comma-separated string
      batteryCapacity: '',
      maxPayload: 0,
    },
    communication: {
      mqttTopic: '',
    },
    maintenance: {
      lastService: '',
      nextService: '',
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name.startsWith('hardware.')) {
      setTrolley(prev => ({
        ...prev,
        hardware: {
          ...prev.hardware,
          [name.split('.')[1]]: name === 'hardware.maxPayload' ? parseInt(value) || 0 : value,
        },
      }))
    } else if (name.startsWith('communication.')) {
      setTrolley(prev => ({
        ...prev,
        communication: {
          ...prev.communication,
          [name.split('.')[1]]: value,
        },
      }))
    } else if (name.startsWith('maintenance.')) {
      setTrolley(prev => ({
        ...prev,
        maintenance: {
          ...prev.maintenance,
          [name.split('.')[1]]: value,
        },
      }))
    } else {
      setTrolley(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trolley.name || !trolley.trolleyId) {
      toast.error('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    try {
      await trolleysApi.create({
        name: trolley.name,
        trolleyId: trolley.trolleyId,
        storeId: trolley.storeId,
        hardware: {
          ...trolley.hardware,
          sensors: trolley.hardware.sensors.split(',').map(s => s.trim()).filter(s => s !== ''), // Parse sensors string to array
        },
        status: {
          operational: trolley.status,
          battery: { level: 100, chargingStatus: 'Not Charging', estimatedRuntime: 24 }, // Default values
          location: { current: { x: 0, y: 0, heading: 0 }, lastUpdated: new Date().toISOString() }, // Default values
        },
        currentOrderId: null,
        history: [],
        communication: {
          mqttTopic: trolley.communication.mqttTopic,
          lastSeen: new Date().toISOString(), // Default value
          connectionStatus: 'disconnected', // Default value
          messageLatency: 0, // Default value
        },
        maintenance: {
          lastService: trolley.maintenance.lastService ? new Date(trolley.maintenance.lastService).toISOString() : new Date().toISOString(),
          nextService: trolley.maintenance.nextService ? new Date(trolley.maintenance.nextService).toISOString() : new Date().toISOString(),
          totalOrders: 0, // Default value
          totalDistance: 0, // Default value
          serviceHistory: [], // Default value
        },
      })
      toast.success('Trolley created successfully')
      navigate(-1) // Go back to trolleys list
    } catch (error: any) {
      console.error('Error creating trolley:', error)
      toast.error(error.response?.data?.message || 'Failed to create trolley')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 flex items-center">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-lg font-medium">Add New Trolley</span>
        </button>
        <button type="submit" form="create-trolley-form" className="btn-primary" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Adding...' : 'Add Trolley'}
        </button>
      </div>

      {/* Trolley Form */}
      <form id="create-trolley-form" onSubmit={handleSubmit} className="card space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Trolley Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="label">Trolley Name</label>
            <input type="text" id="name" name="name" value={trolley.name} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="trolleyId" className="label">Trolley ID</label>
            <input type="text" id="trolleyId" name="trolleyId" value={trolley.trolleyId} onChange={handleChange} className="input" required />
          </div>
          
          <div>
            <label htmlFor="status" className="label">Initial Status</label>
            <select id="status" name="status" value={trolley.status} onChange={handleChange} className="input" required>
              <option value="active">Active</option>
              <option value="in-use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div>
            <label htmlFor="storeId" className="label">Store ID</label>
            <input type="text" id="storeId" name="storeId" value={trolley.storeId} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="hardware.serialNumber" className="label">Serial Number</label>
            <input type="text" id="hardware.serialNumber" name="hardware.serialNumber" value={trolley.hardware.serialNumber} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="hardware.model" className="label">Model</label>
            <input type="text" id="hardware.model" name="hardware.model" value={trolley.hardware.model} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="hardware.firmwareVersion" className="label">Firmware Version</label>
            <input type="text" id="hardware.firmwareVersion" name="hardware.firmwareVersion" value={trolley.hardware.firmwareVersion} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="hardware.sensors" className="label">Sensors</label>
            <input type="text" id="hardware.sensors" name="hardware.sensors" value={trolley.hardware.sensors} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="hardware.batteryCapacity" className="label">Battery Capacity</label>
            <input type="text" id="hardware.batteryCapacity" name="hardware.batteryCapacity" value={trolley.hardware.batteryCapacity} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="hardware.maxPayload" className="label">Max Payload</label>
            <input type="text" id="hardware.maxPayload" name="hardware.maxPayload" value={trolley.hardware.maxPayload.toString()} onChange={handleChange} className="input" required />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 pt-4 border-t border-gray-200">Communication</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="communication.mqttTopic" className="label">MQTT Topic</label>
            <input type="text" id="communication.mqttTopic" name="communication.mqttTopic" value={trolley.communication.mqttTopic} onChange={handleChange} className="input" required />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 pt-4 border-t border-gray-200">Maintenance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="maintenance.lastService" className="label">Last Service Date</label>
            <input type="date" id="maintenance.lastService" name="maintenance.lastService" value={trolley.maintenance.lastService} onChange={handleChange} className="input" />
          </div>
          <div>
            <label htmlFor="maintenance.nextService" className="label">Next Service Date</label>
            <input type="date" id="maintenance.nextService" name="maintenance.nextService" value={trolley.maintenance.nextService} onChange={handleChange} className="input" />
          </div>
        </div>

      </form>
    </div>
  )
}

export default CreateTrolley 