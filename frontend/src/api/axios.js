import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getStoredToken = () =>
  localStorage.getItem('apexbazaar_token') || localStorage.getItem('hayroo_token');

// Request Interceptor: Attach bearer token and guest session ID
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    let guestSessionId = localStorage.getItem('hayroo_guest_session_id');
    if (!guestSessionId) {
      guestSessionId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('hayroo_guest_session_id', guestSessionId);
    }
    config.headers['X-Guest-Session-Id'] = guestSessionId;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto token refresh & global error reporting
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    // Auto token refresh attempt on 401 for authenticated sessions
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true, timeout: 10000 });
        const newToken = res.data?.data?.accessToken || res.data?.data?.token;
        if (newToken) {
          localStorage.setItem('apexbazaar_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        localStorage.removeItem('apexbazaar_token');
        localStorage.removeItem('hayroo_token');
      }
    }

    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const isSilentEndpoint =
      originalRequest.url?.includes('/auth/me') ||
      originalRequest.silentError === true;

    if (!isSilentEndpoint) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
