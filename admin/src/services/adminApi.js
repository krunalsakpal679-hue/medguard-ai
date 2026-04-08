import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

// Interceptor to attach admin JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const adminApi = {
    // Stats & Health
    getDashboardStats: () => api.get('/admin/stats'),
    getSystemHealth: () => api.get('/admin/health'),
    
    // User Management
    getUsers: (params) => api.get('/admin/users', { params }),
    getUserDetails: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    
    // Drug & Molecular Data
    getDrugs: (params) => api.get('/drugs', { params }),
    createDrug: (data) => api.post('/drugs', data),
    updateDrug: (id, data) => api.put(`/drugs/${id}`, data),
    deleteDrug: (id) => api.delete(`/drugs/${id}`),
    
    // Audit & Prediction Logs
    getPredictions: (params) => api.get('/admin/predictions', { params }),
    getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
