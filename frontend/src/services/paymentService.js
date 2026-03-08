import api from './api';

export const getPayments = async () => {
  const response = await api.get('/payments/landlord');
  return response.data;
};

export const getTenantPayments = async () => {
  const response = await api.get('/payments/tenant');
  return response.data;
};

export const processPayment = async (paymentData) => {
  const response = await api.post('/payments/tenant/pay', paymentData);
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await api.get(`/payments/landlord/${id}`);
  return response.data;
};

export const getPaymentStats = async () => {
  const response = await api.get('/payments/landlord/stats');
  return response.data;
};