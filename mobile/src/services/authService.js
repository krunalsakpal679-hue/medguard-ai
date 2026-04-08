import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

// Base URL configuration favoring Expo extra constants for dynamic multi-platform development
const API_BASE = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api/v1'

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const authService = {
    /**
     * Persist JWT locally for session restoration.
     */
    saveToken: async (token) => {
        await SecureStore.setItemAsync('jwt_token', token)
    },

    /**
     * Retrieve local JWT identifier.
     */
    getToken: async () => {
        return await SecureStore.getItemAsync('jwt_token')
    },

    /**
     * Wipe local session data.
     */
    removeToken: async () => {
        await SecureStore.deleteItemAsync('jwt_token')
    },

    /**
     * Exchange a Google ID token for a MedGuard system identity.
     */
    googleSignIn: async (idToken) => {
        const response = await api.post('/auth/google', { token: idToken })
        return response.data
    },

    /**
     * Fetch profile of the currently clinical user.
     */
    getCurrentUser: async (token) => {
        const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    /**
     * Formal logout notification to backend and local session clearing.
     */
    logout: async (token) => {
        try {
            await api.post('/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
        } finally {
            await SecureStore.deleteItemAsync('jwt_token')
        }
    }
}

export default authService
