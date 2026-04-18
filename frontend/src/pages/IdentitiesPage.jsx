import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import dashboardService from '../services/dashboardService';
import { useAuth } from '../context/useAuth';

const abbreviate = (fp) => {
  if (!fp || fp.length <= 10) return fp || 'unknown';
  return `${fp.slice(0, 4)}...${fp.slice(-4)}`;
};

const IdentitiesPage = () => {
  const { user: currentUser } = useAuth();
  const [identities, setIdentities] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dashboardService.getIdentities()
      .then(setIdentities)
      .catch(() => toast.error('Failed to load identities'));
  }, []);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await dashboardService.deleteUser(pendingDelete._id);
      setIdentities((prev) => prev.filter((u) => u._id !== pendingDelete._id));
      toast.success(`Deleted ${pendingDelete.email}`);
      setPendingDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Registered Identities</h1>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {!identities ? (
          <p style={styles.muted}>Loading identities...</p>
        ) : identities.length === 0 ? (
          <p style={{ ...styles.muted, textAlign: 'center', padding: '1rem' }}>No identities registered.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Registered</th>
                <th style={styles.th}>Known IPs</th>
                <th style={styles.th}>Known Fingerprints</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {identities.map((u) => {
                const ips = u.knownIPs || [];
                const fps = u.knownDevices || [];
                const isSelf = currentUser && (currentUser.id === u._id || currentUser._id === u._id);
                return (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={styles.td}>{u.email}</td>
                    <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>
                      {new Date(u.createdAt).toLocaleString()}
                    </td>
                    <td style={styles.td}>
                      {ips.length === 0 ? (
                        <span style={styles.muted}>—</span>
                      ) : (
                        <div style={styles.chipWrap}>
                          {ips.map((ip) => (
                            <span key={ip} style={styles.chip}>{ip}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {fps.length === 0 ? (
                        <span style={styles.muted}>—</span>
                      ) : (
                        <div style={styles.chipWrap}>
                          {fps.map((fp) => (
                            <span key={fp} style={{ ...styles.chip, fontFamily: 'monospace', cursor: 'help' }} title={fp}>
                              {abbreviate(fp)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => setPendingDelete(u)}
                        disabled={isSelf}
                        title={isSelf ? 'You cannot delete yourself' : 'Delete user and all associated records'}
                        style={{ ...styles.deleteBtn, opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {pendingDelete && (
        <div style={styles.modalBackdrop} onClick={() => !deleting && setPendingDelete(null)}>
          <div className="glass-panel" style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--accent-rose)' }}>Delete identity?</h3>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
              This will permanently remove <strong>{pendingDelete.email}</strong> along with
              their sessions, risk profile, and audit logs. This cannot be undone.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={styles.confirmBtn}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heading: {
    color: 'var(--text-primary)',
    margin: '0 0 2rem 0',
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
    verticalAlign: 'top',
  },
  chipWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  chip: {
    padding: '0.2rem 0.55rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
  },
  muted: {
    color: 'var(--text-secondary)',
  },
  deleteBtn: {
    padding: '0.4rem 0.8rem',
    background: 'transparent',
    border: '1px solid var(--accent-rose)',
    color: 'var(--accent-rose)',
    borderRadius: '4px',
    fontSize: '0.8rem',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    padding: '1.5rem',
    maxWidth: '440px',
    width: '90%',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  confirmBtn: {
    padding: '0.5rem 1rem',
    background: 'var(--accent-rose)',
    border: '1px solid var(--accent-rose)',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
  },
};

export default IdentitiesPage;
