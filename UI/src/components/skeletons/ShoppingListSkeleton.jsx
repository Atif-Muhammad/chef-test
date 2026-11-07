import React from 'react';

export function ShoppingListSkeleton() {
  return (
    <div style={{ maxWidth: '1180px', width: '100%', margin: '0 auto', paddingBottom: '30px' }}>
      {/* Top Navigation Links Skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div className="skeleton-box" style={{ width: '170px', height: '14px' }} />
        <div className="skeleton-box" style={{ width: '150px', height: '14px' }} />
      </div>

      {/* Client & Visit Header Card Skeleton */}
      <div
        style={{
          backgroundColor: '#fbf9f5',
          borderRadius: '4px',
          border: '1px solid #ece7de',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div className="skeleton-box" style={{ width: '220px', height: '22px', marginBottom: '8px' }} />
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div className="skeleton-box" style={{ width: '120px', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '140px', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '90px', height: '14px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="skeleton-box" style={{ width: '90px', height: '26px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '110px', height: '26px', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Action Toolbar Skeleton */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="skeleton-box" style={{ width: '100px', height: '30px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '140px', height: '30px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '150px', height: '30px', borderRadius: '4px' }} />
        </div>
        <div className="skeleton-box" style={{ width: '110px', height: '30px', borderRadius: '4px' }} />
      </div>

      {/* Checklist Category Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '16px',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((cat) => (
          <div
            key={cat}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              border: '1px solid #ece7de',
              overflow: 'hidden',
            }}
          >
            {/* Category Header */}
            <div
              style={{
                backgroundColor: '#f6f3eb',
                padding: '10px 14px',
                borderBottom: '1px solid #ede8df',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div className="skeleton-box" style={{ width: '110px', height: '16px' }} />
              <div className="skeleton-box" style={{ width: '45px', height: '14px', borderRadius: '999px' }} />
            </div>

            {/* Checklist items */}
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3, 4].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="skeleton-box" style={{ width: '16px', height: '16px', borderRadius: '3px' }} />
                  <div className="skeleton-box" style={{ flex: 1, height: '14px' }} />
                  <div className="skeleton-box" style={{ width: '55px', height: '14px' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShoppingListSkeleton;
