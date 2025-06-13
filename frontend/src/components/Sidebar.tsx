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
  X,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../utils/cn'

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
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
    <>
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto z-50 transition-transform transform lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button for mobile */}
        <div className="flex justify-end p-4 lg:hidden">
          <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
        </div>
        
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
                onClick={toggleSidebar} // Close sidebar on nav item click
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar