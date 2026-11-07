import React from 'react';

export function HomeSkeleton() {
  return (
    <div style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', paddingBottom: '36px' }}>
      {/* Hero Banner Skeleton */}
      <div
        className="skeleton-box"
        style={{
          width: '100%',
          height: '210px',
          borderRadius: '14px',
          marginBottom: '22px',
        }}
      />

      {/* KPI Stats Strip Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '22px',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #ece7de',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div className="skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-box" style={{ width: '70px', height: '12px', marginBottom: '6px' }} />
              <div className="skeleton-box" style={{ width: '110px', height: '18px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Boards Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '22px' }}>
        {/* Left Column: Upcoming Visit Skeleton */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #ece7de',
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="skeleton-box" style={{ width: '180px', height: '20px' }} />
            <div className="skeleton-box" style={{ width: '80px', height: '14px' }} />
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
            <div className="skeleton-box" style={{ width: '60px', height: '60px', borderRadius: '10px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-box" style={{ width: '160px', height: '18px', marginBottom: '6px' }} />
              <div className="skeleton-box" style={{ width: '120px', height: '14px', marginBottom: '6px' }} />
              <div className="skeleton-box" style={{ width: '90px', height: '18px', borderRadius: '4px' }} />
            </div>
          </div>

          <div className="skeleton-box" style={{ width: '100%', height: '40px', borderRadius: '8px', marginBottom: '16px' }} />
          <div className="skeleton-box" style={{ width: '100%', height: '36px', borderRadius: '999px' }} />
        </div>

        {/* Right Column: Favourites Skeleton */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #ece7de',
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="skeleton-box" style={{ width: '150px', height: '20px' }} />
            <div className="skeleton-box" style={{ width: '70px', height: '14px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="skeleton-box" style={{ width: '56px', height: '56px', borderRadius: '8px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton-box" style={{ width: '70%', height: '14px', marginBottom: '6px' }} />
                  <div className="skeleton-box" style={{ width: '40%', height: '12px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeSkeleton;
