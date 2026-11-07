import React from 'react';

export function TableSkeleton() {
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
        <div className="skeleton-box" style={{ width: '160px', height: '18px' }} />
        <div className="skeleton-box" style={{ width: '55px', height: '14px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8f6f2' }}>
            <div className="skeleton-box" style={{ width: '25%', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '20%', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '15%', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '18%', height: '16px', borderRadius: '10px' }} />
            <div className="skeleton-box" style={{ width: '20px', height: '14px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableSkeleton;
