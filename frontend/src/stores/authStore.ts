import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const response = await authApi.login({ email, password })
          const { token, user } = response.data
          
          set({ user, token, isLoading: false })
          toast.success(`Welcome back, ${user.firstName}!`)
          return true
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Login failed')
          return false
        }
      },

      register: async (data) => {
        try {
          await authApi.register(data)
          toast.success('Registration successful! Please login.')
          return true
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Registration failed')
          return false
        }
      },

      logout: () => {
        set({ user: null, token: null, isLoading: false })
        toast.success('Logged out successfully')
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ isLoading: false })
          return
        }

        try {
          const response = await authApi.getProfile()
          set({ user: response.data, isLoading: false })
        } catch (error) {
          set({ user: null, token: null, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)

// Initialize auth check
useAuthStore.getState().checkAuth()