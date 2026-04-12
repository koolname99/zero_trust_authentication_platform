import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel" style={styles.navbar}>
      <div style={styles.brand}>
        <FiShield style={styles.icon} />
        <Link to="/" style={styles.brandLink}>ZeroTrust</Link>
      </div>
      <div style={styles.navLinks}>
        {isAuthenticated ? (
          <>
            <span style={styles.userInfo}><FiUser /> {user?.email}</span>
            <button onClick={handleLogout} style={styles.logoutBtn} className="glass-panel">
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link} className="glass-panel">Login</Link>
            <Link to="/register" style={{...styles.link, ...styles.primaryBtn}}>Register</Link>
          </>
        )}
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
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginRight: '1rem' },
  logoutBtn: { 
    display: 'flex', alignItems: 'center', gap: '0.5rem', 
    color: 'var(--accent-rose)', background: 'transparent',
    border: '1px solid var(--border-color)', padding: '0.5rem 1rem', 
    borderRadius: '4px', cursor: 'pointer', transition: 'var(--transition-fast)'
  }
};

export default Navbar;
