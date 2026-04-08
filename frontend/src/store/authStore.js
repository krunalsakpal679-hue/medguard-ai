import { create } from 'zustand'
import { authService } from '../services/authService'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  
  /**
   * Primary Login Action: exchanges a Google credential for a system-level JWT.
   */
  loginWithGoogle: async (googleToken) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.loginWithGoogleToken(googleToken)
      
      // Persist clinical session
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
      // Notify backend if possible
      await authService.logoutUser()
    } catch (err) {
      console.warn("Logout request failed, clearing local state anyway", err)
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
    
    set({ isLoading: true })
    try {
      const user = await authService.getCurrentUser()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      // Token expired or invalid
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
  
  clearError: () => set({ error: null })
}))
