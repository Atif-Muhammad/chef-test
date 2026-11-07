import React from 'react';

export function ManageDishesSkeleton() {
  return (
    <div style={{ maxWidth: '1180px', width: '100%', margin: '0 auto', paddingBottom: '30px' }}>
      {/* Header Skeleton */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <div className="skeleton-box" style={{ width: '180px', height: '24px', marginBottom: '6px' }} />
          <div className="skeleton-box" style={{ width: '420px', height: '14px' }} />
        </div>
        <div className="skeleton-box" style={{ width: '130px', height: '32px', borderRadius: '4px' }} />
      </div>

      {/* Filter Bar Skeleton */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '12px',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #ece7de',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div className="skeleton-box" style={{ width: '220px', height: '30px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '140px', height: '30px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '130px', height: '30px', borderRadius: '4px' }} />
        </div>
        <div className="skeleton-box" style={{ width: '70px', height: '30px', borderRadius: '4px' }} />
      </div>

      {/* Dishes Table Skeleton */}
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
          <div className="skeleton-box" style={{ width: '220px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '110px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '90px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '180px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '80px', height: '14px' }} />
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
            {/* Dish Photo + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '220px' }}>
              <div className="skeleton-box" style={{ width: '36px', height: '36px', borderRadius: '4px', flexShrink: 0 }} />
              <div>
                <div className="skeleton-box" style={{ width: '130px', height: '16px', marginBottom: '4px' }} />
                <div className="skeleton-box" style={{ width: '80px', height: '12px' }} />
              </div>
            </div>

            {/* Category */}
            <div className="skeleton-box" style={{ width: '85px', height: '18px', borderRadius: '4px' }} />

            {/* Prep Time */}
            <div className="skeleton-box" style={{ width: '65px', height: '14px' }} />

            {/* Allergens & Dietary */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <div className="skeleton-box" style={{ width: '50px', height: '18px', borderRadius: '4px' }} />
              <div className="skeleton-box" style={{ width: '60px', height: '18px', borderRadius: '4px' }} />
            </div>

            {/* Status */}
            <div className="skeleton-box" style={{ width: '60px', height: '18px', borderRadius: '4px' }} />

            <div style={{ flex: 1 }} />

            {/* Actions */}
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

export default ManageDishesSkeleton;
