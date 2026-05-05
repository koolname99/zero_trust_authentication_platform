import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiLock } from 'react-icons/fi';

const Sidebar = () => {
  return (
    <aside className="glass-panel" style={styles.sidebar}>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <Link to="/dashboard" style={styles.link}>
            <FiHome style={styles.icon} /> Dashboard
          </Link>
        </li>
        <li style={styles.listItem}>
          <Link to="/auth/mfa" style={styles.link}>
            <FiLock style={styles.icon} /> Security
          </Link>
        </li>

      </ul>
    </aside>
  );
};

const styles = {
  sidebar: { width: '250px', padding: '1.5rem', borderTop: 'none', borderBottom: 'none', borderLeft: 'none', borderRadius: '0' },
  list: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  listItem: { display: 'flex' },
  link: { display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', color: 'var(--text-secondary)', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'var(--transition-fast)' },
  icon: { fontSize: '1.25rem', color: 'var(--accent-emerald)' }
};

export default Sidebar;
