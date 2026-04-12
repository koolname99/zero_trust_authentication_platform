import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import SecurityOverview from '../components/Dashboard/SecurityOverview';
import RiskScoreChart from '../components/Dashboard/RiskScoreChart';
import AttackLogTable from '../components/Dashboard/AttackLogTable';
import SessionMonitor from '../components/Dashboard/SessionMonitor';
import MetricsCards from '../components/Dashboard/MetricsCards';
import VulnerabilityPanel from '../components/Dashboard/VulnerabilityPanel';
import MFASetup from '../components/Auth/MFASetup';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [logs, setLogs] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  const fetchData = async () => {
    try {
      const [overviewData, logsData, sessionsData] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getAuditLogs(),
        dashboardService.getSessions()
      ]);
      setOverview(overviewData);
      setLogs(logsData);
      setSessions(sessionsData);
    } catch (err) {
      toast.error('Failed to load real-time telemetry.');
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 30 seconds for live feel
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Security Center</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Welcome back, <strong style={{ color: 'var(--accent-cyan)' }}>{userEmailName(user)}</strong>
          </p>
        </div>
        
        <div style={styles.tabs}>
           <button style={activeTab === 'DASHBOARD' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('DASHBOARD')}>Telemetry</button>
           <button style={activeTab === 'MFA' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('MFA')}>MFA Config</button>
        </div>
      </div>

      {activeTab === 'DASHBOARD' && (
        <div style={styles.dashboardGrid}>
          {/* Top Row: Aggregates */}
          <div style={{ gridColumn: '1 / -1' }}>
            <SecurityOverview data={overview} />
          </div>

          {/* Middle Row: Left=Chart, Right=AttackTable */}
          <div style={{ gridColumn: 'span 8' }}>
            <RiskScoreChart logs={logs} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
             <VulnerabilityPanel />
             <MetricsCards />
          </div>

          {/* Bottom Row: Logs and Sessions */}
          <div style={{ gridColumn: 'span 6' }}>
            <AttackLogTable logs={logs} />
          </div>
          <div style={{ gridColumn: 'span 6' }}>
             <SessionMonitor sessions={sessions} onUpdate={fetchData} />
          </div>
        </div>
      )}

      {activeTab === 'MFA' && (
         <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <MFASetup />
         </div>
      )}

    </div>
  );
};

const userEmailName = (u) => {
  if (!u || !u.email) return 'Admin';
  return u.email.split('@')[0];
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    animation: 'fade-in 0.5s ease-out'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    padding: '0.3rem',
    borderRadius: '8px'
  },
  tab: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '0.6rem 1.2rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'var(--transition-fast)'
  },
  tabActive: {
    background: 'var(--accent-purple)',
    border: 'none',
    color: 'white',
    padding: '0.6rem 1.2rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'var(--transition-fast)'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '1.5rem'
  }
};

export default DashboardPage;
