import React from 'react';

export function DishDetailSkeleton() {
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '30px' }}>
      {/* Breadcrumb Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="skeleton-box" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '10px', height: '14px', borderRadius: '2px' }} />
          <div className="skeleton-box" style={{ width: '90px', height: '14px', borderRadius: '4px' }} />
          <div className="skeleton-box" style={{ width: '10px', height: '14px', borderRadius: '2px' }} />
          <div className="skeleton-box" style={{ width: '120px', height: '14px', borderRadius: '4px' }} />
        </div>
        <div className="skeleton-box" style={{ width: '90px', height: '14px', borderRadius: '4px' }} />
      </div>

      {/* TOP SECTION: Hero Showcase Skeleton (Equal Baseline) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '20px',
          alignItems: 'stretch',
        }}
      >
        {/* Left Column: Photo Skeleton */}
        <div
          className="skeleton-box"
          style={{
            minHeight: '360px',
            height: '100%',
            borderRadius: '8px',
            border: '1px solid #ece7de',
          }}
        />

        {/* Right Column: Info & Action Buttons Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
          <div>
            {/* Top Badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <div className="skeleton-box" style={{ width: '70px', height: '22px', borderRadius: '4px' }} />
              <div className="skeleton-box" style={{ width: '100px', height: '22px', borderRadius: '4px' }} />
              <div className="skeleton-box" style={{ width: '85px', height: '22px', borderRadius: '4px' }} />
            </div>

            {/* Title */}
            <div className="skeleton-box" style={{ width: '80%', height: '32px', borderRadius: '6px', marginBottom: '10px' }} />

            {/* Cuisine Tags */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
              <div className="skeleton-box" style={{ width: '65px', height: '20px', borderRadius: '4px' }} />
              <div className="skeleton-box" style={{ width: '75px', height: '20px', borderRadius: '4px' }} />
            </div>

            {/* Dietary & Highlights Box */}
            <div
              style={{
                padding: '14px 16px',
                backgroundColor: '#faf8f5',
                borderRadius: '8px',
                border: '1px solid #ece7de',
              }}
            >
              <div className="skeleton-box" style={{ width: '110px', height: '14px', borderRadius: '3px', marginBottom: '8px' }} />
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <div className="skeleton-box" style={{ width: '80px', height: '22px', borderRadius: '4px' }} />
                <div className="skeleton-box" style={{ width: '90px', height: '22px', borderRadius: '4px' }} />
              </div>
              <div className="skeleton-box" style={{ width: '130px', height: '14px', borderRadius: '3px', marginBottom: '8px' }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                <div className="skeleton-box" style={{ width: '95px', height: '22px', borderRadius: '4px' }} />
                <div className="skeleton-box" style={{ width: '75px', height: '22px', borderRadius: '4px' }} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton-box" style={{ width: '100%', height: '38px', borderRadius: '4px' }} />
            <div className="skeleton-box" style={{ width: '100%', height: '36px', borderRadius: '4px' }} />
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Aligned Details Cards Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '20px',
          alignItems: 'stretch',
        }}
      >
        {/* Left: Chef Notes Skeleton */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #ece7de',
            padding: '18px 20px',
            height: '100%',
          }}
        >
          <div className="skeleton-box" style={{ width: '140px', height: '18px', borderRadius: '4px', marginBottom: '12px' }} />
          <div className="skeleton-box" style={{ width: '100%', height: '12px', borderRadius: '3px', marginBottom: '8px' }} />
          <div className="skeleton-box" style={{ width: '92%', height: '12px', borderRadius: '3px', marginBottom: '8px' }} />
          <div className="skeleton-box" style={{ width: '70%', height: '12px', borderRadius: '3px' }} />
        </div>

        {/* Right: Key Fresh Ingredients Skeleton (Table Format) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #ece7de',
            padding: '16px 18px',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div className="skeleton-box" style={{ width: '140px', height: '16px', borderRadius: '4px' }} />
            <div className="skeleton-box" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 60px', gap: '8px', alignItems: 'center', padding: '4px 0' }}>
                <div className="skeleton-box" style={{ width: '80%', height: '14px', borderRadius: '3px' }} />
                <div className="skeleton-box" style={{ width: '50px', height: '14px', borderRadius: '3px', marginLeft: 'auto' }} />
                <div className="skeleton-box" style={{ width: '40px', height: '14px', borderRadius: '3px', marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Similar Dishes Skeleton */}
      <div
        style={{
          padding: '20px 22px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #ece7de',
        }}
      >
        <div className="skeleton-box" style={{ width: '200px', height: '20px', borderRadius: '4px', marginBottom: '16px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {[1, 2].map((n) => (
            <div
              key={n}
              style={{
                borderRadius: '8px',
                border: '1px solid #ece7de',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                height: '130px',
                display: 'flex',
              }}
            >
              <div className="skeleton-box" style={{ width: '130px', height: '100%', flexShrink: 0 }} />
              <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="skeleton-box" style={{ width: '50px', height: '12px', borderRadius: '3px', marginBottom: '6px' }} />
                  <div className="skeleton-box" style={{ width: '70%', height: '16px', borderRadius: '3px', marginBottom: '6px' }} />
                  <div className="skeleton-box" style={{ width: '40%', height: '12px', borderRadius: '3px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton-box" style={{ width: '40px', height: '12px', borderRadius: '3px' }} />
                  <div className="skeleton-box" style={{ width: '60px', height: '24px', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DishDetailSkeleton;
