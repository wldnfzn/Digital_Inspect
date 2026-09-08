import axios from 'axios';

// Gunakan URL API Server lokal (Hono) untuk development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan JWT Token dari localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor untuk handling token expired / unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Jika Unauthorized, hapus token dan kembali ke halaman login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Uncomment baris di bawah jika ingin auto-redirect:
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
