import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Package,
  ShoppingBag,
  ShoppingCart,
  User,
  Settings,
  BarChart3,
  Truck,
  Tags,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../utils/cn'

const Sidebar: React.FC = () => {
  const { user } = useAuthStore()

  const customerNavItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/orders', icon: ShoppingBag, label: 'My Orders' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  const adminNavItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/categories', icon: Tags, label: 'Categories' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/admin/trolleys', icon: Truck, label: 'Trolleys' },
  ]

  const navItems = user?.role === 'admin' ? adminNavItems : customerNavItems

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar