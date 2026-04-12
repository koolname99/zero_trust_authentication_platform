import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // Crucial for sending/receiving secure cookies
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 and attempt Silent Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't intercept refresh/login endpoints
      if (originalRequest.url.includes('/api/auth/login') || originalRequest.url.includes('/api/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const { data } = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
        
        // Save new token
        localStorage.setItem('accessToken', data.accessToken);
        
        // Replay request
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (cookie expired, or blacklisted)
        localStorage.removeItem('accessToken');
        // Let the AuthContext handle redirecting by throwing
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
