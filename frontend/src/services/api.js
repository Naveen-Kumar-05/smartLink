import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

/* ─── Auth ─────────────────────────────────────────── */
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }).then(r => r.data),
  register: (name, email, password, plan) => api.post('/api/auth/register', { name, email, password, plan }).then(r => r.data),
  getProfile: () => api.get('/api/auth/profile').then(r => r.data),
};

/* ─── Links ─────────────────────────────────────────── */
export const urlAPI = {
  create: (payload) => api.post('/api/urls', payload).then(r => r.data),
  list: (params) => api.get('/api/urls', { params }).then(r => r.data),
  getById: (id) => api.get(`/api/urls/${id}`).then(r => r.data),
  update: (id, payload) => api.put(`/api/urls/${id}`, payload).then(r => r.data),
  delete: (id) => api.delete(`/api/urls/${id}`).then(r => r.data),
  getStatsSummary: () => api.get('/api/urls/stats/summary').then(r => r.data),
  bulkCreate: (items) => api.post('/api/urls/bulk', { items }).then(r => r.data),
};

/* ─── Analytics ─────────────────────────────────────── */
export const analyticsAPI = {
  getOverview: () => api.get('/api/analytics/overview').then(r => r.data),
  getLinkAnalytics: (id) => api.get(`/api/analytics/links/${id}`).then(r => r.data),
  getLinkVisits: (id, params) => api.get(`/api/analytics/links/${id}/visits`, { params }).then(r => r.data),
  getLinkTrend: (id, days = 7) => api.get(`/api/analytics/links/${id}/trend`, { params: { days } }).then(r => r.data),
  getByShortCode: (shortCode) => api.get(`/api/analytics/${shortCode}`).then(r => r.data),
  getPublicStats: (shortCode) => api.get(`/api/analytics/public/${shortCode}`).then(r => r.data),
};

/* ─── Campaigns ─────────────────────────────────────── */
export const campaignAPI = {
  list: () => api.get('/api/campaigns').then(r => r.data),
  getById: (id) => api.get(`/api/campaigns/${id}`).then(r => r.data),
  create: (payload) => api.post('/api/campaigns', payload).then(r => r.data),
  update: (id, payload) => api.put(`/api/campaigns/${id}`, payload).then(r => r.data),
  delete: (id) => api.delete(`/api/campaigns/${id}`).then(r => r.data),
  getStats: (id) => api.get(`/api/campaigns/${id}/stats`).then(r => r.data),
};

/* ─── Bio Pages ─────────────────────────────────────── */
export const bioAPI = {
  getMyPage: () => api.get('/api/bio').then(r => r.data),
  getPublicPage: (slug) => api.get(`/api/bio/public/${slug}`).then(r => r.data),
  create: (payload) => api.post('/api/bio', payload).then(r => r.data),
  update: (payload) => api.put('/api/bio', payload).then(r => r.data),
  delete: () => api.delete('/api/bio').then(r => r.data),
};

/* ─── QR Studio ─────────────────────────────────────── */
export const qrAPI = {
  getAll: () => api.get('/api/qr').then(r => r.data),
  getByUrlId: (urlId) => api.get(`/api/qr/link/${urlId}`).then(r => r.data),
  generate: (payload) => api.post('/api/qr/generate', payload).then(r => r.data),
  delete: (id) => api.delete(`/api/qr/${id}`).then(r => r.data),
};

/* ─── Settings ───────────────────────────────────────── */
export const settingsAPI = {
  getProfile: () => api.get('/api/settings/profile').then(r => r.data),
  updateProfile: (payload) => api.put('/api/settings/profile', payload).then(r => r.data),
  changePassword: (payload) => api.put('/api/settings/password', payload).then(r => r.data),
  getApiKey: () => api.get('/api/settings/api-key').then(r => r.data),
  regenerateApiKey: () => api.post('/api/settings/api-key/regenerate').then(r => r.data),
};
