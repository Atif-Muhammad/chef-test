import React from 'react';

export default function Loader({ size = 'md', message = 'Loading...', fullScreen = false }) {
  const sizePx = { sm: 18, md: 28, lg: 40 }[size] || 28;

  const spinnerStyle = {
    width: `${sizePx}px`,
    height: `${sizePx}px`,
    border: `2px solid #e2dacd`,
    borderTop: `2px solid var(--color-primary)`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  const containerStyle = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(250, 247, 242, 0.85)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '30px 0',
        width: '100%',
        minHeight: '120px',
      };

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle} />
      {message && (
        <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
          {message}
        </span>
      )}
    </div>
  );
}
