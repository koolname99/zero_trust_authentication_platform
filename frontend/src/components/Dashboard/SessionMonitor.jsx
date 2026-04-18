import React, { useState } from 'react';
import dashboardService from '../../services/dashboardService';
import { toast } from 'react-toastify';

const SessionMonitor = ({ sessions, onUpdate }) => {
  const [terminating, setTerminating] = useState(null);

  if (!sessions) return <div className="glass-panel" style={{ padding: '2rem' }}>Loading Sessions...</div>;

  const abbreviateFingerprint = (fp) => {
    if (!fp || fp.length <= 10) return fp || 'unknown';
    return `${fp.slice(0, 4)}...${fp.slice(-4)}`;
  };

  const handleTerminate = async (id) => {
    setTerminating(id);
    try {
      await dashboardService.terminateSession(id);
      toast.success('Session terminated successfully');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to terminate session');
    }
    setTerminating(null);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', overflowX: 'auto' }}>
      <h3 style={{ color: 'var(--accent-purple)', marginBottom: '1rem' }}>Active Network Sessions</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Initiated</th>
            <th style={styles.th}>Identity</th>
            <th style={styles.th}>IP & Fingerprint</th>
            <th style={styles.th}>Risk At Creation</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody style={styles.tbody}>
          {sessions.map((session) => (
            <tr key={session._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={styles.td}>{new Date(session.createdAt).toLocaleString()}</td>
              <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>{session.userId?.email || 'Unknown'}</td>
              <td style={styles.td}>
                <div>{session.ipAddress}</div>
                <div
                  style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', cursor: 'help' }}
                  title={session.deviceFingerprint}
                >
                  {abbreviateFingerprint(session.deviceFingerprint)}
                </div>
              </td>
              <td style={styles.td}>{session.riskScoreAtCreation}</td>
              <td style={styles.td}>
                <button 
                  onClick={() => handleTerminate(session._id)} 
                  disabled={terminating === session._id}
                  style={styles.killBtn}
                >
                  {terminating === session._id ? 'Killing...' : 'Terminate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sessions.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>No active sessions found.</p>}
    </div>
  );
};

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' },
  th: { padding: '1rem 0.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' },
  td: { padding: '1rem 0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' },
  killBtn: { padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', borderRadius: '4px', cursor: 'pointer', transition: 'var(--transition-fast)' }
};

export default SessionMonitor;
