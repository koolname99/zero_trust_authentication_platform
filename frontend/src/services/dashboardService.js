import api from './api';

const dashboardService = {
  getOverview: async () => {
    const response = await api.get('/api/dashboard/overview');
    return response.data;
  },
  getAuditLogs: async () => {
    const response = await api.get('/api/dashboard/audit-logs');
    return response.data;
  },
  getSessions: async () => {
    const response = await api.get('/api/dashboard/sessions');
    return response.data;
  },
  terminateSession: async (id) => {
    const response = await api.delete(`/api/dashboard/sessions/${id}`);
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/api/dashboard/users');
    return response.data;
  },
  getIdentities: async () => {
    const response = await api.get('/api/dashboard/identities');
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/api/dashboard/users/${id}`);
    return response.data;
  },
  removeUserMfa: async (id) => {
    const response = await api.delete(`/api/dashboard/users/${id}/mfa`);
    return response.data;
  },
};

export default dashboardService;
