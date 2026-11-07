import React from 'react';

/**
 * SidebarCulinaryArt
 * Premium, bespoke culinary card for the sidebar footer.
 * Features the official botanical olive leaf branch sprig at full natural scale,
 * centered above the Cormorant Garamond italic typography:
 * "Fresh ingredients. Thoughtful menus. Made for you."
 */
export default function SidebarCulinaryArt({ className = '' }) {
  return (
    <div
      className={`sidebar-culinary-art-card ${className}`}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '10px 10px 8px',
        borderRadius: '6px',
        backgroundColor: '#fcfbf8',
        border: '1px solid #ebd9c0',
        boxShadow: '0 2px 8px rgba(46, 59, 18, 0.03)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Botanical Leaf Branch - Full Size & Unshrinked */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          marginBottom: '2px',
        }}
      >
        <img
          src="/assets/leaf.png"
          alt="Fresh culinary botanical leaf"
          style={{
            width: '118px',
            maxWidth: '85%',
            height: 'auto',
            display: 'block',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
            userSelect: 'none',
            transform: 'rotate(-3deg)',
            filter: 'drop-shadow(0 2px 4px rgba(46, 59, 18, 0.05))',
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Editorial Poetry - Centered */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          fontFamily: "var(--font-heading, 'Cormorant Garamond', Georgia, serif)",
          fontStyle: 'italic',
          fontSize: '0.85rem',
          fontWeight: 600,
          lineHeight: 1.18,
          color: '#505b68',
          textAlign: 'center',
          width: '100%',
          letterSpacing: '-0.01em',
        }}
      >
        <div>Fresh</div>
        <div>ingredients.</div>
        <div>Thoughtful</div>
        <div>menus.</div>
        <div>Made for you.</div>
      </div>

      {/* Warm Golden Accent Line */}
      <div
        style={{
          width: '24px',
          height: '1.5px',
          backgroundColor: '#c49e5d',
          borderRadius: '1px',
          margin: '6px auto 2px',
        }}
      />
    </div>
  );
}
