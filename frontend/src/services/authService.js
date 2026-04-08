import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response Interceptor: Handling global auth failures
api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      // Clear local session on unauthenticated response
      localStorage.removeItem('token')
      // Optional: redirect to login or trigger store logout
      // window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authService = {
  loginWithGoogleToken: (token) => api.post('/auth/google', { token }),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: (token) => api.post('/auth/refresh', { token }),
  logoutUser: () => api.post('/auth/logout')
}

export default api
