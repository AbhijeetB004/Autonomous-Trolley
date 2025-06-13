import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '../types'
import toast from 'react-hot-toast'

interface CartState {
  items: CartItem[]
  trolleyId: string | null
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setTrolleyId: (id: string) => void
  clearTrolleyId: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      trolleyId: null,

      addItem: (product: Product, quantity = 1) => {
        const { items } = get()
        const existingItem = items.find(item => item.product._id === product._id)

        if (existingItem) {
          set({
            items: items.map(item =>
              item.product._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
        } else {
          set({ items: [...items, { product, quantity }] })
        }

        toast.success(`${product.name} added to cart`)
      },

      removeItem: (productId: string) => {
        const { items } = get()
        const item = items.find(item => item.product._id === productId)
        
        set({ items: items.filter(item => item.product._id !== productId) })
        
        if (item) {
          toast.success(`${item.product.name} removed from cart`)
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set({
          items: get().items.map(item =>
            item.product._id === productId
              ? { ...item, quantity }
              : item
          )
        })
      },

      clearCart: () => {
        set({ items: [] })
        toast.success('Cart cleared')
      },

      setTrolleyId: (id: string) => {
        set({ trolleyId: id })
      },

      clearTrolleyId: () => {
        set({ trolleyId: null })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.price.onSale && item.product.price.discountPrice
            ? item.product.price.discountPrice
            : item.product.price.amount
          return total + (price * item.quantity)
        }, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)