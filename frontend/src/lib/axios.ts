import axios from 'axios';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const normalizedApiUrl = configuredApiUrl.replace(/\/$/, '');

export const axiosInstance = axios.create({
  baseURL:
    normalizedApiUrl ||
    (import.meta.env.MODE === 'development' ? 'http://localhost:3000/api' : '/api'),
  withCredentials: true,
});
