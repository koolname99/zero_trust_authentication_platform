import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/useAuth';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Simple visual strength calculation
  const getStrength = () => {
    let score = 0;
    if (password.length > 7) score += 33;
    if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) score += 33;
    if (/[^A-Za-z0-9]/.test(password)) score += 34;
    return score;
  };

  const strength = getStrength();
  const strengthColor = strength > 66 ? 'var(--accent-emerald)' : strength > 33 ? '#eab308' : 'var(--accent-rose)';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    const result = await register(email, password);
    if (result.success) {
      navigate('/login');
    }
    setIsSubmitting(false);
  };

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
        />
        <div style={styles.strengthBarContainer}>
          <div style={{ ...styles.strengthBar, width: `${strength}%`, background: strengthColor }} />
        </div>
      </div>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Confirm Password</label>
        <input 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          style={styles.input} 
          required 
        />
      </div>
      <button 
        type="submit" 
        style={{...styles.button, opacity: isSubmitting ? 0.7 : 1}} 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Registering...' : 'Create Account'}
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
  },
  strengthBarContainer: { height: '4px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' },
  strengthBar: { height: '100%', transition: 'all 0.3s ease' },
  button: {
    padding: '0.85rem',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--accent-emerald)',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
  }
};

export default RegisterForm;
