import React from 'react';
import { FiTrendingUp, FiActivity, FiCpu, FiClock } from 'react-icons/fi';

const MetricsCards = () => {
  const metrics = [
    { label: 'Brute-Force Mitigation', value: '99.8%', trend: '+0.2%', icon: <FiTrendingUp />, color: 'var(--accent-emerald)' },
    { label: 'False Positive Rate', value: '1.2%', trend: '-0.4%', icon: <FiActivity />, color: 'var(--accent-cyan)' },
    { label: 'Token Compromise Detection', value: '< 2s', trend: 'Stable', icon: <FiClock />, color: 'var(--accent-purple)' },
    { label: 'System Load Response', value: '45ms', trend: '-5ms', icon: <FiCpu />, color: 'var(--accent-rose)' },
  ];

  return (
    <div style={styles.grid}>
      {metrics.map((m, i) => (
        <div key={i} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{m.label}</span>
            <div style={{ color: m.color }}>{m.icon}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
             <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{m.value}</h3>
             <span style={{ fontSize: '0.75rem', color: m.color }}>{m.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem'
  }
};

export default MetricsCards;
