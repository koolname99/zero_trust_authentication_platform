import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import MFAVerify from './MFAVerify';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await login(email, password);
    if (result.success) {
      if (result.mfaRequired) {
        setMfaToken(result.mfaToken);
      } else {
        navigate('/dashboard');
      }
    }
    
    setIsSubmitting(false);
  };

  if (mfaToken) {
    return <MFAVerify mfaToken={mfaToken} />;
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Email Address</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={styles.input} 
          required 
          placeholder="admin@example.com"
        />
      </div>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={styles.input} 
          required 
          placeholder="••••••••"
        />
      </div>
      <button 
        type="submit" 
        style={{...styles.button, opacity: isSubmitting ? 0.7 : 1}} 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Authenticating...' : 'Sign In'}
      </button>
    </form>
  );
};

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem', textAlign: 'left' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { color: 'var(--text-secondary)', fontSize: '0.85rem' },
  input: { 
    padding: '0.75rem', 
    borderRadius: '8px', 
    border: '1px solid var(--border-color)', 
    background: 'rgba(0,0,0,0.2)', 
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'var(--transition-fast)'
  },
  button: {
    padding: '0.85rem',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--accent-purple)',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'var(--transition-fast)'
  }
};

export default LoginForm;
