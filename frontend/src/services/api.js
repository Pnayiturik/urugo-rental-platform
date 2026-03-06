import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('userInfo');
  let token = localStorage.getItem('token') || '';

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      token = parsed?.token || parsed?.accessToken || parsed?.user?.token || token;
    } catch {}
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;