/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { login, register, getMe } from '../services/authService';

const AuthContext = createContext(null);

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

  useEffect(() => {
    const storedInfo = parseStoredUserInfo();
    const token = localStorage.getItem('token') || extractToken(storedInfo);

    if (!localStorage.getItem('token') && token) {
      localStorage.setItem('token', token);
    }

    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
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
      const token = extractToken(data);
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
      localStorage.setItem('userInfo', JSON.stringify(data || {}));
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
  };

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