import { create } from 'zustand'
import { authService } from '../services/authService'

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    /**
     * Initializes the app by restoring an existing session from SecureStore.
     */
    loadStoredAuth: async () => {
        try {
            const token = await authService.getToken()
            if (token) {
                const user = await authService.getCurrentUser(token)
                set({ user, token, isAuthenticated: true })
            }
        } catch (err) {
            console.warn("Stored token invalid or expired, clearing session.")
            await authService.removeToken()
            set({ user: null, token: null, isAuthenticated: false })
        } finally {
            set({ isLoading: false })
        }
    },

    /**
     * Completes identity synchronization between Google and MedGuard.
     */
    login: async (token, user) => {
        set({ isLoading: true })
        try {
            await authService.saveToken(token)
            set({ 
                user, 
                token, 
                isAuthenticated: true, 
                isLoading: false,
                error: null 
            })
        } catch (err) {
            set({ error: "Failed to persist identity", isLoading: false })
        }
    },

    /**
     * Terminates session and wipes security identifiers.
     */
    logout: async () => {
        const { token } = get()
        set({ isLoading: true })
        try {
            if (token) await authService.logout(token)
        } catch (err) {
            console.warn("Backend logout failed, proceeding with local clear")
        } finally {
            await authService.removeToken()
            set({ 
                user: null, 
                token: null, 
                isAuthenticated: false, 
                isLoading: false 
            })
        }
    },

    setError: (error) => set({ error }),
    clearError: () => set({ error: null })
}))
