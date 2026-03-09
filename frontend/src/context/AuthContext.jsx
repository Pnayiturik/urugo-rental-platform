/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, getMe } from '../services/authService';
import { registerLogoutHandler } from '../services/api';

const AuthContext = createContext(null);

// Decode JWT payload without a library
const decodeToken = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

// Returns ms until the token expires (negative if already expired)
const msUntilExpiry = (token) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return -1;
  return payload.exp * 1000 - Date.now();
};

const parseStoredUserInfo = () => {
  const raw = localStorage.getItem('userInfo');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const extractToken = (payload) =>
  payload?.token || payload?.accessToken || payload?.user?.token || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => parseStoredUserInfo()?.user || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const expiryTimerRef = useRef(null);

  // Clear any running expiry timer
  const clearExpiryTimer = () => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  };

  // Schedule auto-logout exactly when the token expires
  const scheduleExpiry = (token) => {
    clearExpiryTimer();
    const ms = msUntilExpiry(token);
    if (ms <= 0) {
      // Already expired – log out immediately on next tick
      setTimeout(() => performLogout(true), 0);
      return;
    }
    console.info(`🔒 Session expires in ${Math.round(ms / 60000)} min`);
    expiryTimerRef.current = setTimeout(() => performLogout(true), ms);
  };

  const performLogout = (expired = false) => {
    clearExpiryTimer();
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
    if (expired) {
      navigate('/login?reason=session_expired');
    }
  };

  useEffect(() => {
    const storedInfo = parseStoredUserInfo();
    const token = localStorage.getItem('token') || extractToken(storedInfo);

    if (!localStorage.getItem('token') && token) {
      localStorage.setItem('token', token);
    }

    if (token) {
      // Check expiry immediately on load
      if (msUntilExpiry(token) <= 0) {
        performLogout(true);
        return;
      }
      scheduleExpiry(token);
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // Register the logout handler so api.js can trigger it on 401/403
  useEffect(() => {
    registerLogoutHandler(() => performLogout(true));
    return () => registerLogoutHandler(null);
  }, []);

  const checkAuth = async () => {
    try {
      const data = await getMe();
      setUser(data.user);
      const token = localStorage.getItem('token');
      localStorage.setItem('userInfo', JSON.stringify({ token, user: data.user }));
    } catch (err) {
      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUser(null);
      } else {
        const storedInfo = parseStoredUserInfo();
        if (storedInfo?.user) {
          setUser(storedInfo.user);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    try {
      setError(null);
      const data = await register(userData);
      const token = extractToken(data);
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(data || {}));
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      setError(null);
      const data = await login(credentials);
      // For first-time tenant logins the server returns firstLoginToken instead of token
      const token = extractToken(data) || data?.firstLoginToken || '';
      if (token) {
        localStorage.setItem('token', token);
        scheduleExpiry(token);
      } else {
        localStorage.removeItem('token');
      }
      localStorage.setItem('userInfo', JSON.stringify(data || {}));
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => performLogout(false);


  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      handleRegister,
      handleLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};