import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize session on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Interceptor handles the refresh silently. If it fully fails:
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for session expiry signalled by the API interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      toast.error('Session expired. Please log in again.');
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      
      if (data.mfaRequired) {
        return { success: true, mfaRequired: true, mfaToken: data.mfaToken };
      }

      setUser(data.user);
      setIsAuthenticated(true);
      toast.success('Successfully logged in');
      return { success: true, mfaRequired: false };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const verifyMfa = async (mfaToken, code) => {
    try {
      const data = await authService.verifyMFA(mfaToken, code);
      setUser(data.user);
      setIsAuthenticated(true);
      toast.success('Successfully verified');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid code');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const register = async (email, password) => {
    try {
      await authService.register(email, password);
      toast.success('Account created! Please login.');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, verifyMfa, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

