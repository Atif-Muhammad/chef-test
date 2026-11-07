import React from 'react';

export function KpiSkeleton() {
  return (
    <>
      {[1, 2, 3].map((idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--border-radius-md, 12px)',
            border: '1px solid var(--color-border)',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div className="skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-box" style={{ width: '70px', height: '12px', marginBottom: '8px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="skeleton-box" style={{ width: '45px', height: '22px' }} />
              <div className="skeleton-box" style={{ width: '65px', height: '12px' }} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default KpiSkeleton;
