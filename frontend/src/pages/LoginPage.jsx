import React from 'react';
import LoginForm from '../components/Auth/LoginForm';
import { Link } from 'react-router-dom';

const LoginPage = () => (
  <div className="animate-slide-up" style={{ maxWidth: '400px', margin: '4rem auto', width: '100%' }}>
    <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--accent-purple)' }}>Welcome Back</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Enter your credentials to access the dashboard</p>
      <LoginForm />
      <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>Register here</Link>
      </p>
    </div>
  </div>
);

export default LoginPage;
