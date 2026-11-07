import React from 'react';

export function DishCatalogueSkeleton({ count = 8, viewMode = 'grid' }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
        gap: '20px',
      }}
    >
      {items.map((i) => (
        <div
          key={i}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--border-radius-md, 12px)',
            border: '1px solid var(--color-border, #ece7de)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: viewMode === 'grid' ? 'column' : 'row',
            boxShadow: 'none',
          }}
        >
          {/* Thumbnail Skeleton */}
          <div
            className="skeleton-box"
            style={{
              height: viewMode === 'grid' ? '155px' : '130px',
              width: viewMode === 'grid' ? '100%' : '170px',
              flexShrink: 0,
              borderRadius: 0,
            }}
          />

          {/* Content Details Skeleton */}
          <div
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              {/* Category / Type badge skeleton */}
              <div
                className="skeleton-box"
                style={{ width: '60px', height: '14px', borderRadius: '4px', marginBottom: '8px' }}
              />

              {/* Title skeleton */}
              <div
                className="skeleton-box"
                style={{ width: '75%', height: '18px', borderRadius: '4px', marginBottom: '8px' }}
              />

              {/* Description skeleton 2 lines */}
              <div
                className="skeleton-box"
                style={{ width: '92%', height: '12px', borderRadius: '3px', marginBottom: '6px' }}
              />
              <div
                className="skeleton-box"
                style={{ width: '65%', height: '12px', borderRadius: '3px', marginBottom: '12px' }}
              />

              {/* Dietary / Cuisine tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <div
                  className="skeleton-box"
                  style={{ width: '55px', height: '18px', borderRadius: '999px' }}
                />
                <div
                  className="skeleton-box"
                  style={{ width: '70px', height: '18px', borderRadius: '999px' }}
                />
              </div>
            </div>

            {/* Bottom button skeleton */}
            <div
              className="skeleton-box"
              style={{ width: '100%', height: '34px', borderRadius: '6px', marginTop: '6px' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default DishCatalogueSkeleton;
