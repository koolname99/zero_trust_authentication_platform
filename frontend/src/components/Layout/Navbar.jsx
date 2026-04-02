import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiUser } from 'react-icons/fi';

const Navbar = () => {
  return (
    <nav className="glass-panel" style={styles.navbar}>
      <div style={styles.brand}>
        <FiShield style={styles.icon} />
        <Link to="/" style={styles.brandLink}>ZeroTrust</Link>
      </div>
      <div style={styles.navLinks}>
        <Link to="/login" style={styles.link} className="glass-panel">Login</Link>
        <Link to="/register" style={{...styles.link, ...styles.primaryBtn}}>Register</Link>
        <FiUser style={styles.userIcon} />
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderRadius: '0',
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
    borderBottomWidth: '1px'
  },
  brand: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  icon: { color: 'var(--accent-cyan)', fontSize: '1.5rem' },
  brandLink: { color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '1rem' },
  link: { color: 'var(--text-primary)', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem', transition: 'var(--transition-fast)' },
  primaryBtn: { backgroundColor: 'var(--accent-purple)', color: 'white', fontWeight: '500' },
  userIcon: { color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer', marginLeft: '1rem' }
};

export default Navbar;
