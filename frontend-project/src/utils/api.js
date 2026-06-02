import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('epms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('epms_token');
      localStorage.removeItem('epms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
