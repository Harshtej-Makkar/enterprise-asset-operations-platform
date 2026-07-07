import axios, { AxiosError, type AxiosInstance } from 'axios';
import { authStorage } from '@/lib/utils';

/**
 * EAOP API client.
 *
 * Wraps axios with:
 *   - VITE_API_BASE_URL (default `/api`, proxied to backend in dev)
 *   - Request interceptor: attaches `Authorization: Bearer <jwt>` if a token
 *     is in localStorage (simplified auth flow — see FSMOD §16).
 *   - Response interceptor: on 401, clears the stored token + user and
 *     redirects to /login. Other errors bubble up to the calling code
 *     (services + hooks) for the standard loading/error/empty pattern.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStorage.clear();
      // Avoid an import cycle by using window.location for the redirect
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);
