import axios from 'axios';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const withProtocol = (url: string): string =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;
const normalizedApiUrl = configuredApiUrl ? withProtocol(configuredApiUrl).replace(/\/$/, '') : '';
const resolvedApiUrl =
  normalizedApiUrl && !normalizedApiUrl.endsWith('/api')
    ? `${normalizedApiUrl}/api`
    : normalizedApiUrl;

export const axiosInstance = axios.create({
  baseURL:
    resolvedApiUrl ||
    (import.meta.env.MODE === 'development' ? 'http://localhost:3000/api' : '/api'),
  withCredentials: true,
});
