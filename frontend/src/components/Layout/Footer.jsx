import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Zero Trust Auth Platform. All rights reserved.</p>
    </footer>
  );
};

const styles = {
  footer: { textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', borderTop: 'var(--glass-border)', marginTop: 'auto' }
};

export default Footer;
