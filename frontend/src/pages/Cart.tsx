import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Trash2, Package } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { ordersApi } from '../services/api'
import { formatCurrency } from '../utils/format'
import toast from 'react-hot-toast'

const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const navigate = useNavigate()

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsCheckingOut(true)

    try {
      const orderData = {
        orderId: `ORDER_${Date.now()}`,
        orderType: 'pickup',
        items: items.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price.onSale && item.product.price.discountPrice
            ? item.product.price.discountPrice
            : item.product.price.amount,
          totalPrice: (item.product.price.onSale && item.product.price.discountPrice
            ? item.product.price.discountPrice
            : item.product.price.amount) * item.quantity,
          shelfLocation: {
            aisle: item.product.shelfLocation.aisle,
            coordinates: {
              x: item.product.shelfLocation.coordinates.x,
              y: item.product.shelfLocation.coordinates.y,
            },
          },
        })),
        pricing: {
          subtotal: getTotalPrice(),
          tax: getTotalPrice() * 0.08, // 8% tax
          discount: 0,
          total: getTotalPrice() * 1.08,
        },
        timeline: {
          orderedAt: new Date().toISOString(),
        },
      }

      const response = await ordersApi.create(orderData)
      
      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/orders/${response.data._id}`)
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">Your cart is currently empty</p>
        </div>

        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <Link to="/products" className="btn-primary">
            <Package className="w-4 h-4 mr-2" />
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
        <button
          onClick={clearCart}
          className="btn-secondary text-error-600 hover:text-error-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product._id} className="card">
              <div className="flex items-center space-x-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {item.product.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-medium text-primary-600">
                      {formatCurrency(
                        item.product.price.onSale && item.product.price.discountPrice
                          ? item.product.price.discountPrice
                          : item.product.price.amount
                      )}
                    </span>
                    {item.product.price.onSale && item.product.price.discountPrice && (
                      <span className="text-xs text-gray-500 line-through">
                        {formatCurrency(item.product.price.amount)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Total Price */}
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(
                      (item.product.price.onSale && item.product.price.discountPrice
                        ? item.product.price.discountPrice
                        : item.product.price.amount) * item.quantity
                    )}
                  </p>
                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="text-sm text-error-600 hover:text-error-700 mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({items.length} items)</span>
                <span className="text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (8%)</span>
                <span className="text-gray-900">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="btn-primary w-full mt-6"
            >
              {isCheckingOut ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Proceed to Checkout'
              )}
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Your order will be prepared by our smart trolley system
            </p>
          </div>

          {/* Continue Shopping */}
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-2">Need more items?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Continue browsing our products to add more items to your cart.
            </p>
            <Link to="/products" className="btn-secondary w-full">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart