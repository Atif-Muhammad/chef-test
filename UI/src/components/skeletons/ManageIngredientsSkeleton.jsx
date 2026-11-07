import React from 'react';

export function ManageIngredientsSkeleton() {
  return (
    <div style={{ maxWidth: '1180px', width: '100%', margin: '0 auto', paddingBottom: '30px' }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: '16px' }}>
        <div className="skeleton-box" style={{ width: '260px', height: '24px', marginBottom: '6px' }} />
        <div className="skeleton-box" style={{ width: '480px', height: '14px' }} />
      </div>

      {/* Form Card Skeleton */}
      <div
        style={{
          backgroundColor: '#fbf9f5',
          borderRadius: '4px',
          border: '1px solid #ece7de',
          padding: '16px 20px',
          marginBottom: '16px',
        }}
      >
        <div className="skeleton-box" style={{ width: '170px', height: '16px', marginBottom: '14px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
          <div className="skeleton-box" style={{ height: '32px' }} />
          <div className="skeleton-box" style={{ height: '32px' }} />
          <div className="skeleton-box" style={{ height: '32px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <div className="skeleton-box" style={{ width: '120px', height: '30px', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Search & Filter Bar */}
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
        <div className="skeleton-box" style={{ width: '260px', height: '30px' }} />
        <div className="skeleton-box" style={{ width: '160px', height: '14px' }} />
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
            <div className="skeleton-box" style={{ width: '150px', height: '16px' }} />
            <div className="skeleton-box" style={{ width: '60px', height: '18px', borderRadius: '4px' }} />
            <div className="skeleton-box" style={{ width: '200px', height: '14px' }} />
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

export default ManageIngredientsSkeleton;
