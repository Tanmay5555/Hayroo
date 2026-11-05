import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hayroo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const guestSessionId = localStorage.getItem('hayroo_guest_session_id') || `guest-${Date.now()}`;
    if (!localStorage.getItem('hayroo_guest_session_id')) {
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
    const originalRequest = error.config;

    // Auto token refresh attempt on 401
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        if (res.data?.data?.token) {
          localStorage.setItem('hayroo_token', res.data.data.token);
          originalRequest.headers.Authorization = `Bearer ${res.data.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('hayroo_token');
      }
    }

    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    // Don't toast for silent 401 profile checks
    if (!originalRequest.url?.includes('/auth/me')) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
