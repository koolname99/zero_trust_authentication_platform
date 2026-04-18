import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { useAuth } from '../../context/useAuth';

const MFASetup = () => {
  const { user } = useAuth();
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!user || user.mfaEnabled) return;
    const loadMFA = async () => {
      try {
        const data = await authService.setupMFA();
        setSetupData(data);
      } catch (err) {
        toast.error('Failed to load MFA setup');
      }
    };
    loadMFA();
  }, [user]);

  const handleEnable = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return;
    
    setLoading(true);
    try {
      await authService.enableMFA(code);
      toast.success('MFA successfully enabled!');
      setIsSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid code. Try again.');
    }
    setLoading(false);
  };

  if (isSuccess || user?.mfaEnabled) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--accent-emerald)' }}>MFA is Enabled</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Your account is strongly protected.</p>
      </div>
    );
  }

  if (!setupData) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading MFA configuration...</div>;
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}>Set Up Authenticator</h3>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            1. Open an authenticator app (like Google Authenticator or Authy)<br/>
            2. Scan the QR code below
          </p>
          <img src={setupData.qrDataUrl} alt="MFA QR Code" style={{ background: 'white', padding: '0.5rem', borderRadius: '8px' }} />
          
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Secret Key (Manual Entry): <br/>
            <code style={{ color: 'var(--accent-purple)' }}>{setupData.secretValidation}</code>
          </p>
        </div>
        
        <div style={{ flex: '1', minWidth: '200px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            3. Enter the 6-digit code to verify setup
          </p>
          <form onSubmit={handleEnable} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              maxLength="6"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--accent-cyan)', background: 'rgba(0,0,0,0.3)', color: 'white', textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem', outline: 'none' }}
            />
            <button type="submit" disabled={loading} style={{ padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'var(--accent-cyan)', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Verifying...' : 'Enable MFA'}
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent-rose)', fontWeight: 'bold' }}>Recovery Codes</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Save these in a secure place. They can bypass MFA if you lose your device.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              {setupData.recoveryCodes.slice(0,4).map((rc, i) => (
                 <code key={i} style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>Hidden for security</code>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>*The 10 codes were hashed into your secure profile.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFASetup;
