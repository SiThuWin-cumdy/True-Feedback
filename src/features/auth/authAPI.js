import axiosInstance from '../../api/axiosInstance';

export const authAPI = {
  register: (userData) => axiosInstance.post('/auth/register', userData, { anonymous: true }),

  login: (credentials) => axiosInstance.post('/auth/login', credentials, { anonymous: true }),

  getMe: () => axiosInstance.get('/auth/me', { suppressToast: true }),
};
