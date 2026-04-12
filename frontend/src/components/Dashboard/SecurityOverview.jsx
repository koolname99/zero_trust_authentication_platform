import React from 'react';
import { FiUsers, FiActivity, FiAlertTriangle, FiShield } from 'react-icons/fi';

const SecurityOverview = ({ data }) => {
  if (!data) return <div className="glass-panel" style={{ padding: '2rem' }}>Loading Overview...</div>;

  const cards = [
    { title: 'Total Identities', value: data.totalUsers, icon: <FiUsers />, color: 'var(--accent-cyan)' },
    { title: 'Active Sessions', value: data.activeSessions, icon: <FiActivity />, color: 'var(--accent-emerald)' },
    { title: '24h Anomalies', value: data.anomalies, icon: <FiAlertTriangle />, color: 'var(--accent-rose)' },
    { title: 'Avg Risk Score', value: `${data.avgRiskScore}/100`, icon: <FiShield />, color: 'var(--accent-purple)' },
  ];

  return (
    <div style={styles.grid}>
      {cards.map((card, idx) => (
        <div key={idx} className="glass-panel" style={styles.card}>
          <div style={{ ...styles.iconWrapper, color: card.color }}>
            {card.icon}
          </div>
          <div style={styles.content}>
            <h4 style={styles.title}>{card.title}</h4>
            <h2 style={{ ...styles.value, color: card.color }}>{card.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  card: {
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    animation: 'slide-up 0.4s ease-out'
  },
  iconWrapper: {
    fontSize: '2.5rem',
    background: 'rgba(255,255,255,0.05)',
    padding: '1rem',
    borderRadius: '12px'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0
  },
  value: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 'bold',
  }
};

export default SecurityOverview;
