import { create } from 'zustand'
import { authService } from '../services/authService'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  /**
   * Direct auth setter — used for Guest Mode and registration bypass.
   * This is the CRITICAL missing method that caused all redirect failures.
   */
  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true, isLoading: false, error: null })
  },

  /**
   * Primary Login Action: exchanges a Google credential for a system-level JWT.
   */
  loginWithGoogle: async (googleToken) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.loginWithGoogleToken(googleToken)
      localStorage.setItem('token', response.access_token)
      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false
      })
      return response.user
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Authentication failed'
      set({ error: errorMsg, isLoading: false })
      throw err
    }
  },

  /**
   * Destroys the current session and clears clinical identifiers from the browser.
   */
  logout: async () => {
    set({ isLoading: true })
    try {
      await authService.logoutUser()
    } catch (err) {
      console.warn('Logout request failed, clearing local state anyway', err)
    } finally {
      localStorage.removeItem('token')
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
    }
  },

  /**
   * Validates the existing localStorage token against the system's /me endpoint.
   */
  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    // Guest token — skip API check
    if (token === 'guest_token') {
      set({
        user: { id: 'guest', name: 'Medical Guest', email: 'guest@medguard.ai', role: 'guest' },
        isAuthenticated: true,
        isLoading: false
      })
      return
    }

    set({ isLoading: true })
    try {
      const user = await authService.getCurrentUser()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },

  clearError: () => set({ error: null })
}))
