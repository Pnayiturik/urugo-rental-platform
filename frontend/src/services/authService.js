import api from './api';

export const register = async (payload) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return data;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.errors?.[0]?.msg ||
      'Registration failed';
    throw new Error(msg);
  }
};

export const login = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};