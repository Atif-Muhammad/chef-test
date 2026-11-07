import React from 'react';

export function DonutSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--border-radius-md, 12px)',
        border: '1px solid var(--color-border)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="skeleton-box" style={{ width: '130px', height: '18px', marginBottom: '16px' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
        <div className="skeleton-box" style={{ width: '88px', height: '88px', borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton-box" style={{ width: '55%', height: '11px' }} />
              <div className="skeleton-box" style={{ width: '22%', height: '11px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DonutSkeleton;
