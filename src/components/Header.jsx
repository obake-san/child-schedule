import React from 'react';
import FloatingMenuButton from './FloatingMenuButton';

const Header = ({ childrenCount = 0 }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '48px',
    background: 'linear-gradient(135deg, #E8B896 0%, #B57C56 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    zIndex: 1200,
    boxShadow: '0 2px 8px rgba(181,124,86,0.15)',
    padding: '0 12px',
  }}>
    <span
      style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.05em', textAlign: 'left', cursor: 'pointer', flex: 1 }}
      onClick={() => { window.location.href = '/'; }}
    >
      楽々キッズかれんだぁ
    </span>
      <nav style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', marginLeft: 0 }}>
          <FloatingMenuButton childrenCount={childrenCount} />
        </div>
      </nav>
  </div>
);

export default Header;
