import axios from 'axios'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'

// For local development on Android emulator, use 10.0.2.2.
// For iOS or real devices, replace with your backend's actual reachable IP.
const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
})

// Request Interceptor: Attach JWT token from SecureStore if available
api.interceptors.request.use(
  async (config) => {
    // Note: The key should match what the auth store uses or be a common 'token' key
    const token = await SecureStore.getItemAsync('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Global error handling (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and potentially inform the auth store
      await SecureStore.deleteItemAsync('token')
      // Optional: useAuthStore.getState().logout() can be called here if needed
    }
    return Promise.reject(error)
  }
)

/**
 * Service API methods
 */
export const loginWithGoogle = async (token) => {
  return api.post('/auth/google', { token })
}

export const uploadPrescription = async (formData) => {
  return api.post('/analysis/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const predictInteraction = async (medData) => {
  return api.post('/analysis/predict', medData)
}

export const getChatResponse = async (query) => {
  return api.get('/chat', { params: { query } })
}

export default api
