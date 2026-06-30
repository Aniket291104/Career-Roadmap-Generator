import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept responses to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If unauthorized and we haven't retried yet, the backend auto-refreshes tokens if cookie is set.
    // If it still returns 401, redirect to login.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Let the browser retry once since authenticateJWT middleware rotations happen automatically
      try {
        return await api(originalRequest);
      } catch (err) {
        if (typeof window !== 'undefined') {
          // If login page is not current, clear local user details and redirect
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
            window.location.href = '/login?expired=true';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
