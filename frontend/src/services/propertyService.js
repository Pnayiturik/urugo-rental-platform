import api from './api';

export const getPublicProperties = async () => (await api.get('/properties/public')).data;
export const getPublicPropertyById = async (id) => (await api.get(`/properties/public/${id}`)).data;
export const getProperties = async () => {
  const { data } = await api.get('/properties/my');
  return data;
};
export const getPropertyById = async (id) => (await api.get(`/properties/${id}`)).data;
export const createProperty = async (payload) => (await api.post('/properties', payload)).data;
export const deleteProperty = async (id) => (await api.delete(`/properties/${id}`)).data;
export const uploadPropertyImages = async (files) => {
  const form = new FormData();
  files.forEach((f) => form.append('images', f)); // field name must be "images"

  const { data } = await api.post('/properties/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  // normalize backend response
  return data?.urls || data?.images || [];
};