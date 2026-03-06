
import api from './api';

const getAuthToken = () => {
  const raw = localStorage.getItem('userInfo');
  const parsed = raw ? JSON.parse(raw) : {};
  return parsed?.token || parsed?.accessToken || parsed?.user?.token || localStorage.getItem('token') || '';
};

const authConfig = () => {
  const token = getAuthToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Tenant: get my requests
export const getTenantRequests = async () => {
  const { data } = await api.get('/rental-requests/tenant', authConfig());
  return data;
};

// Backward-compatible: old callers now use new public endpoint
export const createRentalRequest = async (payload) => {
  const fullName = (payload.tenantName || payload.fullName || '').trim();
  const parts = fullName ? fullName.split(/\s+/) : [];

  const body = {
    firstName: payload.firstName || parts[0] || '',
    lastName: payload.lastName || parts.slice(1).join(' ') || 'N/A',
    email: payload.email || payload.tenantEmail || '',
    phone: payload.phone || payload.tenantPhone || payload.phoneNumber || '',
    nationalId: payload.nationalId || payload.idNumber || payload.passportNumber || '',
    propertyId: payload.propertyId || payload.property || payload.property_id || '',
    requestedUnit: payload.requestedUnit || payload.unitId || '',
    message: payload.message || ''
  };

  const { data } = await api.post('/rental-requests/public', body);
  return data;
};

// Backward-compatible landlord inbox mapping
export const getLandlordInbox = async () => {
  const { data } = await api.get('/rental-requests/landlord/pending', authConfig());
  return data;
};

// Backward-compatible approve mapping
export const approveRentalRequest = async (id) => {
  const { data } = await api.post(`/rental-requests/${id}/assign`, {}, authConfig());
  return data;
};

export const rejectRentalRequest = async (id) => {
  const { data } = await api.patch(`/rental-requests/${id}/reject`, {}, authConfig());
  return data;
};

// New explicit names
export const sendPublicRentalRequest = async (payload) => {
  const { data } = await api.post('/rental-requests/public', payload);
  return data;
};

export const getLandlordPendingRequests = async () => {
  const { data } = await api.get('/rental-requests/landlord/pending', authConfig());
  return data;
};

export const assignRentalRequest = async (id) => {
  const { data } = await api.post(`/rental-requests/${id}/assign`, {}, authConfig());
  return data;
};