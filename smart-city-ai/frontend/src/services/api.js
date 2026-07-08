import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const apiKey = import.meta.env.VITE_API_KEY;
if (apiKey) {
  api.defaults.headers.common['x-api-key'] = apiKey;
}

export const getDashboardStats = async () => {
  const response = await api.get('/api/dashboard');
  return response.data;
};

export const getReports = async () => {
  const response = await api.get('/api/reports');
  return response.data;
};

export const getReport = async (id) => {
  const response = await api.get(`/api/reports/${id}`);
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await api.delete(`/api/reports/${id}`);
  return response.data;
};

export const updateReportStatus = async (id, status) => {
  const response = await api.patch(`/api/reports/${id}`, { status });
  return response.data;
};

export const uploadImage = async (file, latitude = null, longitude = null) => {
  const formData = new FormData();
  formData.append('image', file);
  if (latitude !== null) formData.append('latitude', latitude);
  if (longitude !== null) formData.append('longitude', longitude);
  
  const response = await api.post('/api/detect', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const triggerEmail = async (id) => {
  const response = await api.post(`/api/send-email/${id}`);
  return response.data;
};

export const reverseGeocode = async (latitude, longitude) => {
  const response = await api.get(`/api/reverse-geocode`, {
    params: { latitude, longitude },
  });
  return response.data;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If the path starts with http, it is already a full url
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}/${imagePath}`;
};

export default api;
