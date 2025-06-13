import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { trolleysApi } from '../../services/api'
import { Trolley } from '../../types'
import toast from 'react-hot-toast'
import { ChevronLeft, Save } from 'lucide-react'

// Define a type for the form state that flattens some nested objects
// and handles type conversions for form inputs (e.g., string for sensors array)
interface TrolleyFormState {
  _id: string;
  trolleyId: string;
  name: string;
  storeId?: string;
  
  hardware: {
    serialNumber: string;
    model: string;
    firmwareVersion: string;
    sensors: string; // Stored as comma-separated string for input
    batteryCapacity: string;
    maxPayload: number;
  };
  status: {
    operational: 'active' | 'maintenance' | 'offline' | 'error' | string; // Allow string for flexibility in form
  };
  communication: {
    mqttTopic: string;
  };
  maintenance: {
    lastService: string; // Stored as YYYY-MM-DD for date input
    nextService: string; // Stored as YYYY-MM-DD for date input
    serviceHistory: any[]; // Include serviceHistory here
  };
  // Other fields from Trolley that are not directly editable in the form
  // but need to be preserved when sending back to API
  battery?: Trolley['status']['battery'];
  currentOrder?: Trolley['currentOrder'];
  qrCode?: Trolley['qrCode'];
  createdAt?: string;
  updatedAt?: string;
}

const EditTrolley: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trolleyForm, setTrolleyForm] = useState<TrolleyFormState | null>(null)
  const [originalTrolley, setOriginalTrolley] = useState<Trolley | null>(null); // To preserve non-editable fields
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTrolley()
  }, [id])

  const fetchTrolley = async () => {
    try {
      const response = await trolleysApi.getById(id!)
      const data: Trolley = response.data

      // Map API data to form state
      const formattedTrolleyForm: TrolleyFormState = {
        _id: data._id,
        trolleyId: data.trolleyId,
        name: data.name,
        storeId: data.storeId,
        hardware: {
          serialNumber: data.hardware.serialNumber,
          model: data.hardware.model,
          firmwareVersion: data.hardware.firmwareVersion,
          sensors: data.hardware.sensors.join(','), // Convert array to string
          batteryCapacity: data.hardware.batteryCapacity,
          maxPayload: data.hardware.maxPayload,
        },
        status: {
          operational: data.status.operational,
        },
        communication: {
          mqttTopic: data.communication.mqttTopic,
        },
        maintenance: {
          lastService: data.maintenance.lastService ? new Date(data.maintenance.lastService).toISOString().split('T')[0] : '',
          nextService: data.maintenance.nextService ? new Date(data.maintenance.nextService).toISOString().split('T')[0] : '',
          serviceHistory: data.maintenance.serviceHistory || [], // Map serviceHistory
        },
        // Preserve other fields for later submission
        battery: data.status.battery,
        currentOrder: data.currentOrder,
        qrCode: data.qrCode,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }
      setTrolleyForm(formattedTrolleyForm)
      setOriginalTrolley(data); // Store original data
    } catch (error) {
      console.error('Error fetching trolley:', error)
      toast.error('Failed to load trolley details')
      navigate(-1) // Go back if trolley not found or error
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setTrolleyForm(prev => {
      if (!prev) return null;

      const newFormState = { ...prev };

      if (name.startsWith('hardware.')) {
        newFormState.hardware = {
          ...newFormState.hardware,
          [name.split('.')[1]]: name === 'hardware.maxPayload' ? parseInt(value) || 0 : value,
        };
      } else if (name.startsWith('communication.')) {
        newFormState.communication = {
          ...newFormState.communication,
          [name.split('.')[1]]: value,
        };
      } else if (name.startsWith('maintenance.')) {
        newFormState.maintenance = {
          ...newFormState.maintenance,
          [name.split('.')[1]]: value,
        };
      } else if (name === 'status.operational') {
        newFormState.status = {
          ...newFormState.status,
          operational: value as Trolley['status']['operational'],
        };
      } else {
        (newFormState as any)[name] = value; 
      }
      return newFormState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trolleyForm || !id || !originalTrolley) return

    setIsSubmitting(true)
    try {
      // Map form state back to API expected Trolley type
      const trolleyPayload: Trolley = {
        ...originalTrolley, // Start with original to preserve non-editable fields
        _id: trolleyForm._id,
        trolleyId: trolleyForm.trolleyId,
        name: trolleyForm.name,
        storeId: trolleyForm.storeId,
        hardware: {
          ...originalTrolley.hardware, // Preserve existing hardware fields
          serialNumber: trolleyForm.hardware.serialNumber,
          model: trolleyForm.hardware.model,
          firmwareVersion: trolleyForm.hardware.firmwareVersion,
          sensors: trolleyForm.hardware.sensors.split(',').map(s => s.trim()).filter(s => s !== ''), // Convert string back to array
          batteryCapacity: trolleyForm.hardware.batteryCapacity,
          maxPayload: trolleyForm.hardware.maxPayload,
        },
        status: {
          ...originalTrolley.status, // Preserve existing status fields
          operational: trolleyForm.status.operational as Trolley['status']['operational'],
        },
        communication: {
          ...originalTrolley.communication, // Preserve existing communication fields
          mqttTopic: trolleyForm.communication.mqttTopic,
        },
        maintenance: {
          ...originalTrolley.maintenance, // Preserve existing maintenance fields
          lastService: trolleyForm.maintenance.lastService ? new Date(trolleyForm.maintenance.lastService).toISOString() : '',
          nextService: trolleyForm.maintenance.nextService ? new Date(trolleyForm.maintenance.nextService).toISOString() : '',
          serviceHistory: originalTrolley.maintenance.serviceHistory, // Preserve original service history
        },
      };
      
      await trolleysApi.update(id, trolleyPayload)
      toast.success('Trolley updated successfully')
      navigate(-1) // Go back to trolleys list
    } catch (error: any) {
      console.error('Error updating trolley:', error)
      toast.error(error.response?.data?.message || 'Failed to update trolley')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    )
  }

  if (!trolleyForm) {
    return <div className="text-center py-12 text-gray-600">Trolley not found.</div>
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 flex items-center">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-lg font-medium">Edit Trolley</span>
        </button>
        <button type="submit" form="edit-trolley-form" className="btn-primary" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Trolley Form */}
      <form id="edit-trolley-form" onSubmit={handleSubmit} className="card space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Trolley Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="label">Trolley Name</label>
            <input type="text" id="name" name="name" value={trolleyForm.name} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="trolleyId" className="label">Trolley ID</label>
            <input type="text" id="trolleyId" name="trolleyId" value={trolleyForm.trolleyId} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="storeId" className="label">Store ID</label>
            <input type="text" id="storeId" name="storeId" value={trolleyForm.storeId || ''} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="status.operational" className="label">Operational Status</label>
            <select id="status.operational" name="status.operational" value={trolleyForm.status.operational} onChange={handleChange} className="input" required>
              <option value="active">Active</option>
              <option value="in-use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 pt-4 border-t border-gray-200">Hardware</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="hardware.serialNumber" className="label">Serial Number</label>
            <input type="text" id="hardware.serialNumber" name="hardware.serialNumber" value={trolleyForm.hardware.serialNumber} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="hardware.model" className="label">Model</label>
            <input type="text" id="hardware.model" name="hardware.model" value={trolleyForm.hardware.model} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="hardware.firmwareVersion" className="label">Firmware Version</label>
            <input type="text" id="hardware.firmwareVersion" name="hardware.firmwareVersion" value={trolleyForm.hardware.firmwareVersion} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="hardware.sensors" className="label">Sensors (comma-separated)</label>
            <textarea id="hardware.sensors" name="hardware.sensors" value={trolleyForm.hardware.sensors} onChange={handleChange} className="input" rows={3} />
          </div>
          <div>
            <label htmlFor="hardware.batteryCapacity" className="label">Battery Capacity</label>
            <input type="text" id="hardware.batteryCapacity" name="hardware.batteryCapacity" value={trolleyForm.hardware.batteryCapacity} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="hardware.maxPayload" className="label">Max Payload (kg)</label>
            <input type="number" id="hardware.maxPayload" name="hardware.maxPayload" value={trolleyForm.hardware.maxPayload} onChange={handleChange} className="input" required min="0" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 pt-4 border-t border-gray-200">Communication</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="communication.mqttTopic" className="label">MQTT Topic</label>
            <input type="text" id="communication.mqttTopic" name="communication.mqttTopic" value={trolleyForm.communication.mqttTopic} onChange={handleChange} className="input" required />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 pt-4 border-t border-gray-200">Maintenance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="maintenance.lastService" className="label">Last Service Date</label>
            <input type="date" id="maintenance.lastService" name="maintenance.lastService" value={trolleyForm.maintenance.lastService} onChange={handleChange} className="input" />
          </div>
          <div>
            <label htmlFor="maintenance.nextService" className="label">Next Service Date</label>
            <input type="date" id="maintenance.nextService" name="maintenance.nextService" value={trolleyForm.maintenance.nextService} onChange={handleChange} className="input" />
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditTrolley 