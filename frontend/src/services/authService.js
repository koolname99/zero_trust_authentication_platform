import api from './api';

const authService = {
  register: async (email, password) => {
    const response = await api.post('/api/auth/register', { email, password });
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.accessToken && !response.data.mfaRequired) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  verifyMFA: async (mfaToken, code) => {
    // Send barebone request since Interceptor would normally try to attach missing true-access tokens
    const response = await api.post('/api/mfa/verify', { token: code }, {
      headers: { Authorization: `Bearer ${mfaToken}` }
    });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  setupMFA: async () => {
    const response = await api.get('/api/mfa/setup');
    return response.data;
  },

  enableMFA: async (token) => {
    const response = await api.post('/api/mfa/enable', { token });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data.user;
  }
};

export default authService;
