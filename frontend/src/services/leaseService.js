import api from './api';

export const createLease = async (leaseData) => {
  const response = await api.post('/leases', leaseData);
  return response.data;
};

export const getMyLeases = async () => {
  const response = await api.get('/leases'); // Calls Landlord route
  return response.data;
};

export const getTenantLease = async () => {
  const response = await api.get('/leases/my-lease'); // Calls Tenant route
  return response.data;
};