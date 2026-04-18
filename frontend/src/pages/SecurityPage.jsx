import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import dashboardService from '../services/dashboardService';
import MFASetup from '../components/Auth/MFASetup';

const SecurityPage = () => {
  const [users, setUsers] = useState(null);
  const [removing, setRemoving] = useState(null);

  const handleRemoveMfa = async (id) => {
    setRemoving(id);
    try {
      await dashboardService.removeUserMfa(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, mfaEnabled: false } : u));
      toast.success('MFA removed');
    } catch {
      toast.error('Failed to remove MFA');
    }
    setRemoving(null);
  };

  useEffect(() => {
    dashboardService.getUsers()
      .then(setUsers)
      .catch(() => toast.error('Failed to load user list'));
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Security</h1>

      <section style={styles.section}>
        <h2 style={styles.subheading}>Your MFA Configuration</h2>
        <MFASetup />
      </section>

      <section style={styles.section}>
        <h2 style={styles.subheading}>User MFA Status</h2>
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          {!users ? (
            <p style={styles.muted}>Loading users...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>MFA</th>
                  <th style={styles.th}>Registered</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={styles.td}>{u.email}</td>
                    <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>{u.role}</td>
                    <td style={styles.td}>
                      <span style={u.mfaEnabled ? styles.badgeOn : styles.badgeOff}>
                        {u.mfaEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      {u.mfaEnabled && (
                        <button
                          onClick={() => handleRemoveMfa(u._id)}
                          disabled={removing === u._id}
                          style={styles.removeBtn}
                        >
                          {removing === u._id ? 'Removing...' : 'Remove MFA'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {users?.length === 0 && (
            <p style={{ ...styles.muted, textAlign: 'center', padding: '1rem' }}>No users found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  heading: {
    color: 'var(--text-primary)',
    margin: '0 0 2rem 0',
  },
  section: {
    marginBottom: '2.5rem',
  },
  subheading: {
    color: 'var(--accent-cyan)',
    fontSize: '1rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '0.75rem 0.5rem',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
  },
  td: {
    padding: '0.9rem 0.5rem',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
  },
  badgeOn: {
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
    background: 'rgba(52, 211, 153, 0.15)',
    color: 'var(--accent-emerald)',
    border: '1px solid var(--accent-emerald)',
  },
  badgeOff: {
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
    background: 'rgba(251, 113, 133, 0.15)',
    color: 'var(--accent-rose)',
    border: '1px solid var(--accent-rose)',
  },
  muted: {
    color: 'var(--text-secondary)',
  },
  removeBtn: {
    padding: '0.4rem 0.8rem',
    background: 'transparent',
    border: '1px solid var(--accent-rose)',
    color: 'var(--accent-rose)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
};

export default SecurityPage;
