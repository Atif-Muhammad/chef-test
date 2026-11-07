import React from 'react';

export function SystemOverviewSkeleton() {
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
      <div className="skeleton-box" style={{ width: '120px', height: '18px', marginBottom: '16px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'space-around' }}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="skeleton-box" style={{ width: '45%', height: '13px' }} />
            <div className="skeleton-box" style={{ width: '20px', height: '13px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemOverviewSkeleton;
