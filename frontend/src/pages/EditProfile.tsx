import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'
// import { User as UserType } from '../types' // Renamed to avoid conflict with local User component

const EditProfile: React.FC = () => {
  const navigate = useNavigate()
  const { user, checkAuth } = useAuthStore()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [favoriteStore, setFavoriteStore] = useState(user?.preferences?.favoriteStore || '')
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(user?.preferences?.dietaryRestrictions || [])
  const [isLoading, setIsLoading] = useState(false)

  // Effect to update form fields if user data changes (e.g., after initial load or re-auth)
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
      setEmail(user.email || '')
      setFavoriteStore(user.preferences?.favoriteStore || '')
      setDietaryRestrictions(user.preferences?.dietaryRestrictions || [])
    }
  }, [user])

  const handleDietaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setDietaryRestrictions(prev =>
      checked ? [...prev, value] : prev.filter(item => item !== value)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const updatedProfile = {
        firstName,
        lastName,
        // Email update might require re-verification or specific backend logic. Handle with care.
        // For now, we'll assume email is not directly editable through this form to keep it simple.
        // If backend allows, uncomment below:
        // email,
        preferences: {
          favoriteStore,
          dietaryRestrictions,
        },
      }
      await authApi.updateProfile(updatedProfile)
      await checkAuth() // Refresh user data in store
      toast.success('Profile updated successfully!')
      navigate('/profile')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 fade-in pt-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-1">Update your personal information and preferences</p>
      </div>

      <div className="card max-w-2xl mx-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  className="input mt-1"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  className="input mt-1"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                className="input mt-1 bg-gray-100 cursor-not-allowed"
                value={email}
                disabled // Email usually cannot be directly changed this way
              />
              <p className="mt-1 text-sm text-gray-500">Email address cannot be changed directly.</p>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
            <div>
              <label htmlFor="favoriteStore" className="block text-sm font-medium text-gray-700">Favorite Store ID</label>
              <input
                type="text"
                id="favoriteStore"
                className="input mt-1"
                value={favoriteStore}
                onChange={(e) => setFavoriteStore(e.target.value)}
                placeholder="e.g., ST001"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Dietary Restrictions</label>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    value="vegetarian"
                    checked={dietaryRestrictions.includes('vegetarian')}
                    onChange={handleDietaryChange}
                  />
                  <span className="ml-2 text-sm text-gray-700">Vegetarian</span>
                </label>
                <label className="inline-flex items-center ml-4">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    value="vegan"
                    checked={dietaryRestrictions.includes('vegan')}
                    onChange={handleDietaryChange}
                  />
                  <span className="ml-2 text-sm text-gray-700">Vegan</span>
                </label>
                <label className="inline-flex items-center ml-4">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    value="gluten-free"
                    checked={dietaryRestrictions.includes('gluten-free')}
                    onChange={handleDietaryChange}
                  />
                  <span className="ml-2 text-sm text-gray-700">Gluten-Free</span>
                </label>
                {/* Add more dietary restrictions as needed */}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfile 