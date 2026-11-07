import React from 'react';

export function ChartSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--border-radius-md, 12px)',
        border: '1px solid var(--color-border)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="skeleton-box" style={{ width: '130px', height: '18px' }} />
        <div className="skeleton-box" style={{ width: '90px', height: '14px' }} />
      </div>

      <div style={{ position: 'relative', width: '100%', height: '130px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0' }}>
        <div className="skeleton-box" style={{ width: '100%', height: '100%', opacity: 0.5 }} />
      </div>
    </div>
  );
}

export default ChartSkeleton;
