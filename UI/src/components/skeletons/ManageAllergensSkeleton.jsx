import React from 'react';

export function ManageAllergensSkeleton() {
  return (
    <div style={{ maxWidth: '1180px', width: '100%', margin: '0 auto', paddingBottom: '30px' }}>
      {/* Header Skeleton */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div className="skeleton-box" style={{ width: '250px', height: '24px', marginBottom: '6px' }} />
          <div className="skeleton-box" style={{ width: '460px', height: '14px' }} />
        </div>
        <div className="skeleton-box" style={{ width: '130px', height: '32px', borderRadius: '4px' }} />
      </div>

      {/* Filter / Search Bar */}
      <div
        style={{
          backgroundColor: '#fbf9f5',
          borderRadius: '4px',
          border: '1px solid #ece7de',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="skeleton-box" style={{ width: '240px', height: '30px' }} />
          <div className="skeleton-box" style={{ width: '140px', height: '30px' }} />
        </div>
        <div className="skeleton-box" style={{ width: '140px', height: '14px' }} />
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
          <div className="skeleton-box" style={{ width: '180px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '100px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '220px', height: '14px' }} />
          <div style={{ flex: 1 }} />
          <div className="skeleton-box" style={{ width: '70px', height: '14px' }} />
        </div>

        {/* Rows */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              padding: '12px 16px',
              borderBottom: i === 6 ? 'none' : '1px solid #f6f3eb',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '180px' }}>
              <div className="skeleton-box" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
              <div className="skeleton-box" style={{ width: '120px', height: '16px' }} />
            </div>
            <div className="skeleton-box" style={{ width: '70px', height: '18px', borderRadius: '4px' }} />
            <div className="skeleton-box" style={{ width: '240px', height: '14px' }} />
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              <div className="skeleton-box" style={{ width: '26px', height: '26px', borderRadius: '3px' }} />
              <div className="skeleton-box" style={{ width: '26px', height: '26px', borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageAllergensSkeleton;
