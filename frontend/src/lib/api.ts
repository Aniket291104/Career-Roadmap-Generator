import axios from 'axios';

export let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Handle configuration fallback: if NEXT_PUBLIC_API_URL was set without the '/api' suffix, append it automatically
if (API_BASE_URL && !API_BASE_URL.endsWith('/api') && !API_BASE_URL.endsWith('/api/')) {
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api';
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer and refresh token headers if present in localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      config.headers['x-refresh-token'] = refreshToken;
    }
  }
  return config;
});

// Intercept responses to handle auth errors and update rotated tokens
api.interceptors.response.use(
  (response) => {
    // Save rotated access token if returned in response headers
    if (typeof window !== 'undefined' && response.headers) {
      const newAccessToken = response.headers['x-new-access-token'];
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Catch rotated access token if returned in response/error headers
    if (typeof window !== 'undefined' && error.response?.headers) {
      const newAccessToken = error.response.headers['x-new-access-token'];
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
        if (originalRequest && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
      }
    }
    
    // If unauthorized and we haven't retried yet, retry the request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        return await api(originalRequest);
      } catch (err) {
        if (typeof window !== 'undefined') {
          // If login page is not current, clear local user details and redirect
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login?expired=true';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
