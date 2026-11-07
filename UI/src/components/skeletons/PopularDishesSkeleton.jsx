import React from 'react';

export function PopularDishesSkeleton() {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div className="skeleton-box" style={{ width: '100px', height: '18px' }} />
        <div className="skeleton-box" style={{ width: '50px', height: '14px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3].map((idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="skeleton-box" style={{ width: '34px', height: '34px', borderRadius: '6px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-box" style={{ width: '75%', height: '13px', marginBottom: '5px' }} />
              <div className="skeleton-box" style={{ width: '45%', height: '10px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PopularDishesSkeleton;
