import axios from 'axios';

// Production: backend Cloudflare Tunnel (HTTPS) orqali ulanadi.
// VITE_API_URL env o'rnatilsa, o'sha ishlatiladi (masalan local dev'da '/api').
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://garbage-spy-brighton-empire.trycloudflare.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
