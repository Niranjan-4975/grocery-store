import axios from 'axios';
import { useToastStore } from './stores/toastStore';
import { useAuth } from './composables/useAuth';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_API_URL,
});

// 1. Request Interceptor (Token bhejne ke liye)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['user-payload'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
// 2. Response Interceptor (Success aur Error messages handle karne ke liye)
api.interceptors.response.use(
    (response) => {
        const toastStore = useToastStore();
        const { success, message, data } = response.data;
        if (success && message) {
            toastStore.showToast(message, 'success');
        }
        return data;
    },
    (error) => {
        const toastStore = useToastStore();
        if (error.response && error.response?.status === 401) {
            toastStore.showToast('Session expired. Please log in again.', 'error');
            const { logout } = useAuth();
            logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;