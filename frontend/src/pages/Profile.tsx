import React, { useEffect, useState } from 'react'
import { User, Mail, Calendar, Award, ShoppingBag, Settings } from 'lucide-react'
// import { useAuthStore } from '../stores/authStore'
import { authApi, ordersApi } from '../services/api'
import { Order } from '../types'
import { formatCurrency, formatDate } from '../utils/format'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const Profile: React.FC = () => {
  // const { user } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileResponse, ordersResponse] = await Promise.all([
          authApi.getProfile(),
          ordersApi.getUserOrders(),
        ])

        setProfile(profileResponse.data)
        setRecentOrders(ordersResponse.data.slice(0, 5))
      } catch (error) {
        console.error('Error fetching profile data:', error)
        toast.error('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    )
  }

  const totalSpent = recentOrders.reduce((sum, order) => sum + order.pricing.total, 0)
  const completedOrders = recentOrders.filter(order => order.status === 'completed').length

  return (
    <div className="space-y-6 fade-in pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        <Link to="/profile/edit" className="btn-secondary">
          <Settings className="w-4 h-4 mr-2" />
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="text-gray-600 flex items-center justify-center mt-1">
                <Mail className="w-4 h-4 mr-1" />
                {profile?.email}
              </p>
              <div className="flex items-center justify-center mt-2">
                <span className={`badge badge-${profile?.role === 'admin' ? 'primary' : 'success'}`}>
                  {profile?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Account Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Total Orders</span>
                </div>
                <span className="font-semibold text-gray-900">{recentOrders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="font-semibold text-gray-900">{completedOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Total Spent</span>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(totalSpent)}</span>
              </div>
            </div>
          </div>

          {/* Loyalty Info */}
          {profile?.loyalty && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Loyalty Program</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Tier</span>
                  <span className={`badge badge-${
                    profile.loyalty.tier === 'platinum' ? 'primary' :
                    profile.loyalty.tier === 'gold' ? 'warning' :
                    profile.loyalty.tier === 'silver' ? 'gray' : 'success'
                  }`}>
                    {profile.loyalty.tier}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Points</span>
                  <span className="font-semibold text-gray-900">{profile.loyalty.points || 0}</span>
                </div>
                {profile.loyalty.joinDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm text-gray-900">{formatDate(profile.loyalty.joinDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
            
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors space-y-2 sm:space-y-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">#{order.orderId}</p>
                      <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <span>•</span>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(order.timeline.orderedAt || '')}
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(order.pricing.total)}
                      </p>
                      <span className={`badge badge-${
                        order.status === 'completed' ? 'success' :
                        order.status === 'pending' ? 'warning' :
                        order.status === 'cancelled' ? 'error' : 'primary'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
            
            {profile?.preferences ? (
              <div className="space-y-4">
                {profile.preferences.favoriteStore && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Favorite Store</label>
                    <p className="text-sm text-gray-900 mt-1">{profile.preferences.favoriteStore}</p>
                  </div>
                )}
                
                {profile.preferences.dietaryRestrictions?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dietary Restrictions</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.preferences.dietaryRestrictions.map((restriction: string, index: number) => (
                        <span key={index} className="badge badge-gray">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {profile.preferences.preferredCategories?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Preferred Categories</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.preferences.preferredCategories.map((category: string, index: number) => (
                        <span key={index} className="badge badge-primary">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {profile.preferences.language && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Language</label>
                    <p className="text-sm text-gray-900 mt-1">{profile.preferences.language}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No preferences set</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile