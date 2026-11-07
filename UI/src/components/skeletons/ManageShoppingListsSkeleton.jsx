import React from 'react';

export function ManageShoppingListsSkeleton() {
  return (
    <div style={{ maxWidth: '1180px', width: '100%', margin: '0 auto', paddingBottom: '30px' }}>
      {/* Header Skeleton */}
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
          <div className="skeleton-box" style={{ width: '240px', height: '24px', marginBottom: '6px' }} />
          <div className="skeleton-box" style={{ width: '450px', height: '14px' }} />
        </div>
        <div className="skeleton-box" style={{ width: '190px', height: '32px', borderRadius: '4px' }} />
      </div>

      {/* Tabs Skeleton */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid #ece7de',
          marginBottom: '12px',
        }}
      >
        <div className="skeleton-box" style={{ width: '140px', height: '32px', borderRadius: '4px 4px 0 0' }} />
        <div className="skeleton-box" style={{ width: '120px', height: '32px', borderRadius: '4px 4px 0 0' }} />
        <div className="skeleton-box" style={{ width: '90px', height: '32px', borderRadius: '4px 4px 0 0' }} />
      </div>

      {/* Filter and Date Bar Skeleton */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div className="skeleton-box" style={{ width: '130px', height: '30px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '130px', height: '30px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '110px', height: '30px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '130px', height: '30px', borderRadius: '4px' }} />
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
            alignItems: 'center',
          }}
        >
          <div className="skeleton-box" style={{ width: '16px', height: '16px', borderRadius: '3px' }} />
          <div className="skeleton-box" style={{ width: '160px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '180px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '190px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '120px', height: '14px' }} />
          <div style={{ flex: 1 }} />
          <div className="skeleton-box" style={{ width: '90px', height: '14px' }} />
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
            <div className="skeleton-box" style={{ width: '16px', height: '16px', borderRadius: '3px' }} />
            <div>
              <div className="skeleton-box" style={{ width: '130px', height: '16px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '80px', height: '12px' }} />
            </div>
            <div>
              <div className="skeleton-box" style={{ width: '140px', height: '16px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '100px', height: '12px' }} />
            </div>
            <div>
              <div className="skeleton-box" style={{ width: '160px', height: '14px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '110px', height: '12px' }} />
            </div>
            <div className="skeleton-box" style={{ width: '85px', height: '20px', borderRadius: '4px' }} />
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              <div className="skeleton-box" style={{ width: '28px', height: '28px', borderRadius: '3px' }} />
              <div className="skeleton-box" style={{ width: '60px', height: '28px', borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageShoppingListsSkeleton;
