import React from 'react';

const AttackLogTable = ({ logs }) => {
  if (!logs) return <div className="glass-panel" style={{ padding: '2rem' }}>Loading Audit Logs...</div>;

  const getRiskBadge = (score) => {
    if (!score && score !== 0) return <span style={{...styles.badge, background: 'rgba(255,255,255,0.1)'}}>N/A</span>;
    if (score < 25) return <span style={{...styles.badge, color: '#000', background: 'var(--accent-emerald)'}}>Low ({score})</span>;
    if (score < 75) return <span style={{...styles.badge, color: '#000', background: 'var(--accent-cyan)'}}>Med ({score})</span>;
    return <span style={{...styles.badge, color: '#fff', background: 'var(--accent-rose)'}}>High ({score})</span>;
  };

  const truncate = (str, len) => str ? (str.length > len ? str.substring(0, len) + '...' : str) : 'N/A';

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
      <h3 style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }}>Global Audit Logs</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Timestamp</th>
            <th style={styles.th}>Event / Action</th>
            <th style={styles.th}>User / Target</th>
            <th style={styles.th}>Source IP</th>
            <th style={styles.th}>Risk Score</th>
          </tr>
        </thead>
        <tbody style={styles.tbody}>
          {logs.map((log) => (
            <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={styles.td}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' })}</td>
              <td style={styles.td}>{log.action}</td>
              <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>{log.userId?.email || 'Unknown'}</td>
              <td style={styles.td}>{log.ipAddress}</td>
              <td style={styles.td}>{getRiskBadge(log.riskScore)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>No telemetry documented.</p>}
    </div>
  );
};

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' },
  th: { padding: '1rem 0.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' },
  td: { padding: '1rem 0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' },
  badge: { padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }
};

export default AttackLogTable;
