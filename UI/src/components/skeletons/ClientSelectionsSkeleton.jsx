import React from 'react';

export function ClientSelectionsSkeleton() {
  return (
    <div style={{ maxWidth: '1180px', width: '100%', margin: '0 auto', paddingBottom: '30px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          <div className="skeleton-box" style={{ width: '320px', height: '24px', marginBottom: '6px' }} />
          <div className="skeleton-box" style={{ width: '480px', height: '14px' }} />
        </div>

        {/* Top-Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="skeleton-box" style={{ width: '140px', height: '30px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '160px', height: '30px', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Filter and Date Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          backgroundColor: '#ffffff',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #ece7de',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="skeleton-box" style={{ width: '130px', height: '30px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '130px', height: '30px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '130px', height: '30px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '110px', height: '30px', borderRadius: '4px' }} />
        </div>
        <div className="skeleton-box" style={{ width: '220px', height: '30px', borderRadius: '4px' }} />
      </div>

      {/* Table Skeleton */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          border: '1px solid #ece7de',
          overflow: 'hidden',
        }}
      >
        {/* Table Head */}
        <div
          style={{
            display: 'flex',
            padding: '10px 16px',
            backgroundColor: '#f6f3eb',
            borderBottom: '1px solid #ede8df',
            gap: '16px',
          }}
        >
          <div className="skeleton-box" style={{ width: '170px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '160px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '220px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '130px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '100px', height: '14px' }} />
          <div style={{ flex: 1 }} />
          <div className="skeleton-box" style={{ width: '80px', height: '14px' }} />
        </div>

        {/* Rows */}
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              padding: '12px 16px',
              borderBottom: i === 7 ? 'none' : '1px solid #f6f3eb',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div>
              <div className="skeleton-box" style={{ width: '140px', height: '16px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '90px', height: '12px' }} />
            </div>
            <div>
              <div className="skeleton-box" style={{ width: '130px', height: '16px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '70px', height: '12px' }} />
            </div>
            <div>
              <div className="skeleton-box" style={{ width: '200px', height: '14px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '140px', height: '12px' }} />
            </div>
            <div className="skeleton-box" style={{ width: '90px', height: '18px', borderRadius: '4px' }} />
            <div className="skeleton-box" style={{ width: '80px', height: '18px', borderRadius: '4px' }} />
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              <div className="skeleton-box" style={{ width: '26px', height: '26px', borderRadius: '3px' }} />
              <div className="skeleton-box" style={{ width: '55px', height: '26px', borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClientSelectionsSkeleton;
