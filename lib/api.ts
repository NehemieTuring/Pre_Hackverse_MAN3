import axios from 'axios';
import { getToken, clearAuth } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://pre-hackverse-man3.onrender.com/api',
});

// Request interceptor — attaches JWT token + Logging
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // LOGGING: Show outgoing request
  console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
  
  return config;
});

// Response interceptor — handles 401 silently + Logging
api.interceptors.response.use(
  (response) => {
    // LOGGING: Show successful response
    console.log(`✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // LOGGING: Show error response
    console.error(`❌ [API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);

    if (error.response?.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
