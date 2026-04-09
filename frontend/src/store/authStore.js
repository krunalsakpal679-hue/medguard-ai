import { create } from 'zustand';
import api, { getCurrentUser, loginWithGoogle as loginWithGoogleApi } from '../services/api';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('medguard_token'),
    isAuthenticated: !!localStorage.getItem('medguard_token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('medguard_token', data.access_token);
            set({ 
                user: data.user, 
                token: data.access_token, 
                isAuthenticated: true, 
                isLoading: false 
            });
            return true;
        } catch (err) {
            set({ error: err.response?.data?.detail || "Login Failed", isLoading: false });
            return false;
        }
    },

    loginWithGoogle: async (googleToken) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await loginWithGoogleApi(googleToken);
            localStorage.setItem('medguard_token', data.access_token);
            set({ 
                user: data.user, 
                token: data.access_token, 
                isAuthenticated: true, 
                isLoading: false 
            });
            return true;
        } catch (err) {
            set({ error: err.response?.data?.detail || err.response?.data?.error || "Login Failed", isLoading: false });
            return false;
        }
    },

    register: async (registerData) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/auth/register', registerData);
            localStorage.setItem('medguard_token', data.access_token);
            set({ 
                user: data.user, 
                token: data.access_token, 
                isAuthenticated: true, 
                isLoading: false 
            });
            return true;
        } catch (err) {
            set({ error: err.response?.data?.detail || err.response?.data?.error || "Registration Failed", isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('medguard_token');
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = '/login';
    },

    checkAuth: async () => {
        const token = localStorage.getItem('medguard_token');
        if (!token) return;
        
        set({ isLoading: true });
        try {
            const { data } = await getCurrentUser();
            set({ user: data, isAuthenticated: true, isLoading: false });
        } catch (err) {
            localStorage.removeItem('medguard_token');
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
    },

    setLoading: (val) => set({ isLoading: val }),
    clearError: () => set({ error: null })
}));
