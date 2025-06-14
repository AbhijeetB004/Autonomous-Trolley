import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Package,
  ShoppingBag,
  ShoppingCart,
  User,
  // Settings,
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
    { to: '/', icon: Home, label: 'Dashboard', exactMatch: true },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/orders', icon: ShoppingBag, label: 'My Orders' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  const adminNavItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard', exactMatch: true },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/categories', icon: Tags, label: 'Categories' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/admin/trolleys', icon: Truck, label: 'Trolleys' },
  ]

  const navItems = user?.role === 'admin' ? adminNavItems : customerNavItems

  const handleNavItemClick = () => {
    // Only close sidebar on mobile when nav item is clicked
    if (window.innerWidth < 1024) {
      toggleSidebar()
    }
  }

  return (
    <>
      {/* Backdrop for mobile - only show when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out",
          // Mobile styles: fixed positioning with higher z-index
          "fixed h-full top-0 left-0 z-50",
          // Control visibility on mobile
          "lg:hidden", // Hide the mobile version on large screens
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button for mobile */}
        <div className="flex justify-end p-4 border-b border-gray-200">
          <button 
            onClick={toggleSidebar} 
            className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                {...(item.exactMatch && { end: true })}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
                onClick={handleNavItemClick}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Desktop sidebar - always visible */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 overflow-y-auto h-[calc(100vh-4rem)]">
        <div className="p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                {...(item.exactMatch && { end: true })}
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
    </>
  )
}

export default Sidebar