import api from './api';

const getAuthToken = () => {
  const raw = localStorage.getItem('userInfo');
  const parsed = raw ? JSON.parse(raw) : {};
  return parsed?.firstLoginToken || parsed?.token || parsed?.accessToken || parsed?.user?.token || localStorage.getItem('token') || '';
};

const authConfig = () => {
  const token = getAuthToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};


export const createLease = async (leaseData) => {
  const response = await api.post('/leases', leaseData, authConfig());
  return response.data;
};

export const getMyLeases = async () => {
  const response = await api.get('/leases', authConfig()); // Calls Landlord route
  return response.data;
};

export const getTenantLease = async () => {
  const response = await api.get('/leases/my-lease', authConfig()); // Calls Tenant route
  return response.data;
};