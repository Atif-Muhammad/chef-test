import React from 'react';

export function ClientDetailSkeleton() {
  return (
    <div style={{ maxWidth: '1020px', width: '100%', margin: '0 auto', paddingBottom: '30px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '14px' }}>
        <div className="skeleton-box" style={{ width: '130px', height: '14px' }} />
      </div>

      {/* Client Profile Header Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          border: '1px solid #ece7de',
          padding: '16px 20px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Left client details */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div className="skeleton-box" style={{ width: '180px', height: '22px' }} />
            <div className="skeleton-box" style={{ width: '70px', height: '18px', borderRadius: '4px' }} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '8px 16px',
              marginTop: '10px',
            }}
          >
            <div>
              <div className="skeleton-box" style={{ width: '50px', height: '10px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '140px', height: '14px' }} />
            </div>
            <div>
              <div className="skeleton-box" style={{ width: '50px', height: '10px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '110px', height: '14px' }} />
            </div>
            <div>
              <div className="skeleton-box" style={{ width: '70px', height: '10px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '160px', height: '14px' }} />
            </div>
            <div>
              <div className="skeleton-box" style={{ width: '60px', height: '10px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '120px', height: '14px' }} />
            </div>
          </div>
        </div>

        {/* Right status toggle button & visits counter */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div className="skeleton-box" style={{ width: '140px', height: '28px', borderRadius: '4px' }} />
          <div
            style={{
              padding: '5px 14px',
              backgroundColor: '#fbf9f5',
              borderRadius: '4px',
              border: '1px solid #ece7de',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div className="skeleton-box" style={{ width: '32px', height: '18px' }} />
            <div className="skeleton-box" style={{ width: '60px', height: '10px' }} />
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '1px solid #ece7de',
          marginBottom: '14px',
          paddingBottom: '4px',
        }}
      >
        <div className="skeleton-box" style={{ width: '140px', height: '28px', borderRadius: '4px' }} />
        <div className="skeleton-box" style={{ width: '180px', height: '28px', borderRadius: '4px' }} />
        <div className="skeleton-box" style={{ width: '140px', height: '28px', borderRadius: '4px' }} />
      </div>

      {/* Date Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          backgroundColor: '#ffffff',
          padding: '6px 12px',
          borderRadius: '4px',
          border: '1px solid #ece7de',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="skeleton-box" style={{ width: '140px', height: '28px', borderRadius: '3px' }} />
          <div className="skeleton-box" style={{ width: '140px', height: '28px', borderRadius: '3px' }} />
        </div>
        <div className="skeleton-box" style={{ width: '120px', height: '14px' }} />
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
          <div className="skeleton-box" style={{ width: '200px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '140px', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '90px', height: '14px' }} />
          <div style={{ flex: 1 }} />
          <div className="skeleton-box" style={{ width: '80px', height: '14px' }} />
        </div>

        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              padding: '12px 16px',
              borderBottom: i === 5 ? 'none' : '1px solid #f6f3eb',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div>
              <div className="skeleton-box" style={{ width: '130px', height: '16px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '90px', height: '12px' }} />
            </div>
            <div>
              <div className="skeleton-box" style={{ width: '140px', height: '14px', marginBottom: '4px' }} />
              <div className="skeleton-box" style={{ width: '180px', height: '12px' }} />
            </div>
            <div className="skeleton-box" style={{ width: '90px', height: '18px', borderRadius: '4px' }} />
            <div className="skeleton-box" style={{ width: '70px', height: '18px', borderRadius: '4px' }} />
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              <div className="skeleton-box" style={{ width: '24px', height: '24px', borderRadius: '3px' }} />
              <div className="skeleton-box" style={{ width: '55px', height: '24px', borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClientDetailSkeleton;
