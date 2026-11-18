import axiosInstance from '../../api/axiosInstance';

export const authAPI = {
  register: (userData) => axiosInstance.post('/auth/register', userData),

  login: (credentials) => axiosInstance.post('/auth/login', credentials),

  getMe: () => axiosInstance.get('/auth/me', { suppressToast: true }),
};