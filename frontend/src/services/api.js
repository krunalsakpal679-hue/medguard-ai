import axios from 'axios';
import { apiUrl } from '../utils/environment';

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('medguard_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('medguard_token');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const loginWithGoogle = (token) => api.post('/auth/google', { token });
export const getCurrentUser = () => api.get('/auth/me');
export const searchDrugs = (q, limit = 10) => api.get(`/drugs/search?q=${q}&limit=${limit}`);
export const getDrugById = (id) => api.get(`/drugs/${id}`);
export const checkInteractions = (drugIds, context) => api.post('/predictions/check', { drug_ids: drugIds, context });
export const getPredictionHistory = (page = 1, limit = 10) => api.get(`/predictions/history?page=${page}&limit=${limit}`);
export const uploadPrescription = (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/prescription', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total))
    });
};
export const parseText = (text) => api.post('/upload/text', { text });
export const getUploadStatus = (id) => api.get(`/upload/${id}/status`);
export const sendChatMessage = (message, language, conversation_id) => api.post('/chat/message', { message, language, conversation_id });
export const getConversations = () => api.get('/chat/conversations');
export const deleteConversation = (id) => api.delete(`/chat/conversations/${id}`);

export default api;
