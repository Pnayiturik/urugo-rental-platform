import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
});

// ── Request interceptor – attach token ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('userInfo');
  let token = localStorage.getItem('token') || '';

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      token = parsed?.token || parsed?.accessToken || parsed?.user?.token || token;
    } catch {
      console.warn('Failed to parse userInfo from localStorage');
    }
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor – auto-logout on expired/invalid token ───────────────
// AuthContext registers its logout function here so this file stays dependency-free
let _logoutHandler = null;

export const registerLogoutHandler = (fn) => {
  _logoutHandler = fn;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    // Only auto-logout on 401 (unauthenticated). 403 = forbidden but still logged in.
    if (status === 401 && _logoutHandler) {
      console.warn('🔒 Session expired – logging out automatically');
      _logoutHandler();
    }
    return Promise.reject(error);
  }
);

export default api;
