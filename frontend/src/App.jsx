import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import DashboardPage from './pages/DashboardPage';
import SecurityPage from './pages/SecurityPage';
import IdentitiesPage from './pages/IdentitiesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';

function AppLayout() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-layout">
        {isAuthenticated && <Sidebar />}
        <main className="content-wrapper">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/auth/mfa" element={<SecurityPage />} />
              <Route path="/auth/identities" element={<IdentitiesPage />} />
            </Route>

            <Route path="*" element={<div className="glass-panel" style={{padding: '2rem'}}>404 Page Not Found</div>} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
        <ToastContainer theme="dark" position="bottom-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
