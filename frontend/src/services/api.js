import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_URL_PROD ||
  import.meta.env.REACT_APP_API_URL ||
  import.meta.env.REACT_APP_API_URL_PROD ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s timeout to allow Render free tier cold-start wakeups
  headers: {
    'Content-Type': 'application/json'
  }
});

export const searchProducts = (query) =>
  api.get('/search', { params: { query } });

export const getTrackedProducts = () =>
  api.get('/tracks');

export const trackProduct = (store_product_id, product_name, selected_option) =>
  api.post('/tracks', { store_product_id, product_name, selected_option });

export const stopTrackingProduct = (productId) =>
  api.delete(`/tracks/${productId}`);

export const triggerScrapeRunNow = () =>
  api.post('/scrape/run-now');

export const getPriceHistory = (productId, days = 7) =>
  api.get(`/history/${productId}`, { params: { days } });

export const getScrapeLogs = (productId, limit = 50) =>
  api.get(`/logs/${productId}`, { params: { limit } });

export const exportCSV = () =>
  api.get('/export/csv', { responseType: 'blob' });

export default api;
