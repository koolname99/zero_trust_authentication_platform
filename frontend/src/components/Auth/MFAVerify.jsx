import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MFAVerify = ({ mfaToken }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { verifyMfa } = useAuth();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only accept numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tokenString = code.join('');
    if (tokenString.length !== 6) return;
    
    setIsSubmitting(true);
    const result = await verifyMfa(mfaToken, tokenString);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setIsSubmitting(false);
  };

  return (
    <div style={styles.container}>
      <h3 style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>Two-Factor Verification</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        A security policy requires you to enter the 6-digit code from your authenticator app.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.codeContainer}>
          {code.map((num, i) => (
            <input 
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              maxLength="1"
              value={num}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={styles.codeInput}
              required
            />
          ))}
        </div>
        
        <button 
          type="submit" 
          style={{...styles.button, opacity: isSubmitting ? 0.7 : 1}} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { textAlign: 'center', animation: 'fade-in 0.3s ease-out' },
  codeContainer: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' },
  codeInput: {
    width: '40px',
    height: '45px',
    fontSize: '1.5rem',
    textAlign: 'center',
    borderRadius: '8px',
    border: '1px solid var(--accent-purple)',
    background: 'rgba(0,0,0,0.3)',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  button: {
    padding: '0.85rem',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--accent-purple)',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'var(--transition-fast)'
  }
};

export default MFAVerify;
