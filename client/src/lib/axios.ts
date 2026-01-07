import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor - Add auth token and log requests
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data,
      timestamp: new Date().toISOString(),
    });

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    toast.error('Failed to send request');
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally with detailed logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
      timestamp: new Date().toISOString(),
    });
    return response;
  },
  (error) => {
    // Detailed error logging
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      params: error.config?.params,
      data: error.response?.data,
      timestamp: new Date().toISOString(),
    };

    console.error('❌ API Error:', errorDetails);

    // Handle specific error codes
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - Clearing auth and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please login again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } else if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message;
      const displayMessage = Array.isArray(errorMessage)
        ? errorMessage.join(', ')
        : errorMessage || 'Invalid request';

      console.error('⚠️  Bad Request (400):', {
        message: displayMessage,
        validation: error.response?.data,
      });

      toast.error(`Validation Error: ${displayMessage}`);
    } else if (error.response?.status === 403) {
      console.error('🚫 Forbidden (403): Access denied');
      toast.error('Access denied');
    } else if (error.response?.status === 404) {
      console.error('🔍 Not Found (404):', error.config?.url);
      toast.error('Resource not found');
    } else if (error.response?.status === 500) {
      console.error('💥 Server Error (500):', error.response?.data);
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status >= 400) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error(`⚠️  Error ${error.response?.status}:`, errorMessage);
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏱️  Request Timeout');
      toast.error('Request timeout. Please try again.');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error: Cannot connect to server');
      toast.error('Network error. Cannot connect to server.');
    } else {
      console.error('❓ Unknown Error:', error);
      toast.error('An unexpected error occurred');
    }

    // Return a consistent error structure
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    });
  }
);

export default apiClient;
