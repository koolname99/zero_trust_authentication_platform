import React from 'react';
import RegisterForm from '../components/Auth/RegisterForm';
import { Link } from 'react-router-dom';

const RegisterPage = () => (
  <div className="animate-slide-up" style={{ maxWidth: '400px', margin: '4rem auto', width: '100%' }}>
    <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--accent-emerald)' }}>Create Account</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Set up your secure profile</p>
      <RegisterForm />
      <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  </div>
);

export default RegisterPage;
