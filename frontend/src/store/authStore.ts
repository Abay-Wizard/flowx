import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios, { AxiosError } from 'axios'

interface AuthState {
  token: string | null
  username: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<boolean>
  demoLogin: () => Promise<void>
  logout: () => void
  clearError: () => void
}

function extractError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    return err.response?.data?.detail ?? fallback
  }
  return fallback
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await axios.post('/auth/login', { username, password })
          set({ token: data.access_token, username: data.username, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ error: extractError(err, 'Login failed'), isLoading: false })
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true, error: null })
        try {
          await axios.post('/auth/register', { username, email, password })
          set({ isLoading: false })
          return true
        } catch (err) {
          set({ error: extractError(err, 'Registration failed'), isLoading: false })
          return false
        }
      },

      demoLogin: async () => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await axios.post('/auth/demo-login')
          set({ token: data.access_token, username: data.username, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ error: extractError(err, 'Demo login failed'), isLoading: false })
        }
      },

      logout: () => set({ token: null, username: null, isAuthenticated: false }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'flowx-auth',
      partialize: (s) => ({ token: s.token, username: s.username, isAuthenticated: s.isAuthenticated }),
    }
  )
)
