import axios from 'axios';

// The api instance points securely to our Express backend.
// We enable withCredentials to automatically send the HTTP-only JWT cookie.
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Optionally, intercept responses to detect 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Logic for handling unauthorized, e.g., redirecting to login
      // Event dispatch or similar can broadcast this.
      console.warn('Unauthorized. Please login.');
    }
    return Promise.reject(error);
  }
);
