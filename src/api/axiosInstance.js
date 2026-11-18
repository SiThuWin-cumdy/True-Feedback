import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    const { status, message, data } = response.data || {};
    const suppressToast = response.config?.suppressToast;

    if (status === 'success') {
      if (message && !suppressToast) {
        toast.success(message);
      }
      return data;
    }

    if (status === 'error') {
      if (!suppressToast) {
        toast.error(message || 'An error occurred');
      }
      return Promise.reject(new Error(message || 'An error occurred'));
    }

    return response.data;
  },
  (error) => {
    const suppressToast = error.config?.suppressToast;
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    if (!suppressToast) {
      toast.error(message);
    }
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;