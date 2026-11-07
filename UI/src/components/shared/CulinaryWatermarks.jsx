import React from 'react';

/**
 * CulinaryWatermarks
 * Subtle, luxury watermark culinary and botanical illustrations (herbs, crossed fork & knife,
 * serving cloche & plate, artisanal pepper mill, and olive wreath crest) placed gracefully
 * in the background of the main application layout.
 *
 * Uses pure SVG vectors, pointer-events none, and gentle opacity for an editorial cookbook feel.
 */
export default function CulinaryWatermarks() {
  return (
    <div
      aria-hidden="true"
      className="culinary-watermarks-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* 1. TOP-RIGHT: Elegant Curving Herb & Rosemary Sprig */}
      <svg
        width="300"
        height="280"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          top: '-35px',
          right: '25px',
          transform: 'rotate(-16deg)',
          opacity: 0.045,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Curving main stem */}
        <path
          d="M25 185 C45 130 90 75 180 20"
          stroke="#2e3b12"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Branching leaf pairs */}
        {/* Pair 1 - Near tip */}
        <path d="M175 25 C165 15 150 18 145 28 C155 35 170 32 175 25 Z" fill="#2e3b12" opacity="0.4" />
        <path d="M170 30 C175 45 168 58 156 55 C150 45 158 35 170 30 Z" fill="#2e3b12" opacity="0.4" />
        {/* Pair 2 */}
        <path d="M142 50 C125 35 105 40 100 55 C115 65 135 60 142 50 Z" fill="#2e3b12" opacity="0.5" />
        <path d="M135 58 C145 75 138 95 120 90 C112 75 122 62 135 58 Z" fill="#2e3b12" opacity="0.5" />
        {/* Pair 3 */}
        <path d="M108 85 C85 68 62 75 58 95 C78 108 100 100 108 85 Z" fill="#2e3b12" opacity="0.5" />
        <path d="M100 95 C112 115 102 138 82 130 C75 110 88 98 100 95 Z" fill="#2e3b12" opacity="0.5" />
        {/* Pair 4 - Lower stem */}
        <path d="M75 125 C50 108 25 118 22 140 C42 152 68 142 75 125 Z" fill="#2e3b12" opacity="0.45" />
        <path d="M68 135 C78 158 65 178 45 170 C38 148 52 138 68 135 Z" fill="#2e3b12" opacity="0.45" />
        {/* Small berries / aromatic buds */}
        <circle cx="152" cy="42" r="3" fill="#2e3b12" opacity="0.6" />
        <circle cx="120" cy="74" r="3.5" fill="#2e3b12" opacity="0.6" />
        <circle cx="86" cy="112" r="4" fill="#2e3b12" opacity="0.6" />
      </svg>

      {/* 2. BOTTOM-RIGHT: Fine Dining Serving Cloche & Plate */}
      <svg
        width="310"
        height="230"
        viewBox="0 0 240 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '50px',
          transform: 'rotate(5deg)',
          opacity: 0.042,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Steam / aroma wisps */}
        <path
          d="M100 22 C108 12 102 4 110 -4"
          stroke="#2e3b12"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M120 20 C128 10 124 2 132 -6"
          stroke="#2e3b12"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M140 22 C148 12 144 4 152 -4"
          stroke="#2e3b12"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Ring handle on cloche */}
        <circle cx="120" cy="30" r="8" stroke="#2e3b12" strokeWidth="2.5" />
        <path d="M120 38 L120 44" stroke="#2e3b12" strokeWidth="3" strokeLinecap="round" />

        {/* Serving Cloche Dome */}
        <path
          d="M38 132 C38 72 74 44 120 44 C166 44 202 72 202 132 Z"
          stroke="#2e3b12"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Cloche lower rim highlight */}
        <path
          d="M32 132 Q120 144 208 132"
          stroke="#2e3b12"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M36 136 Q120 148 204 136"
          stroke="#2e3b12"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Charger Plate Base */}
        <path
          d="M12 144 Q120 178 228 144"
          stroke="#2e3b12"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M24 154 Q120 184 216 154"
          stroke="#2e3b12"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Garnish herb sprig on platter */}
        <path
          d="M190 142 C205 138 215 145 220 152"
          stroke="#2e3b12"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path d="M202 141 C208 134 216 136 215 144 Z" fill="#2e3b12" opacity="0.4" />
      </svg>

      {/* 3. BOTTOM-LEFT: Crossed Chef's Knife & Vintage 4-Tine Fork */}
      <svg
        width="270"
        height="270"
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: '50px',
          left: '28px',
          transform: 'rotate(-10deg)',
          opacity: 0.04,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* KNIFE (Diagonal: bottom-right to top-left) */}
        <g transform="rotate(-45 110 110)">
          {/* Blade */}
          <path
            d="M104 20 L116 20 C116 20 118 75 118 105 L102 105 C102 65 104 20 104 20 Z"
            stroke="#2e3b12"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Bolster */}
          <rect x="100" y="105" width="20" height="6" rx="2" stroke="#2e3b12" strokeWidth="2" fill="#2e3b12" fillOpacity="0.2" />
          {/* Handle */}
          <path
            d="M102 111 L100 185 C100 192 120 192 120 185 L118 111 Z"
            stroke="#2e3b12"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* 3 Handle Rivets */}
          <circle cx="110" cy="128" r="2.2" fill="#2e3b12" />
          <circle cx="110" cy="150" r="2.2" fill="#2e3b12" />
          <circle cx="110" cy="172" r="2.2" fill="#2e3b12" />
        </g>

        {/* FORK (Diagonal: bottom-left to top-right) */}
        <g transform="rotate(45 110 110)">
          {/* 4 Tines */}
          <path d="M98 20 L98 55" stroke="#2e3b12" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M106 20 L106 55" stroke="#2e3b12" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M114 20 L114 55" stroke="#2e3b12" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M122 20 L122 55" stroke="#2e3b12" strokeWidth="2.2" strokeLinecap="round" />
          {/* Fork base & neck */}
          <path
            d="M96 55 C96 75 106 82 106 105 L114 105 C114 82 124 75 124 55 Z"
            stroke="#2e3b12"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Handle */}
          <path
            d="M106 105 L104 185 C104 193 116 193 116 185 L114 105 Z"
            stroke="#2e3b12"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Ornate handle accent */}
          <line x1="106" y1="180" x2="114" y2="180" stroke="#2e3b12" strokeWidth="1.8" />
        </g>

        {/* Central tie / culinary flourish */}
        <circle cx="110" cy="110" r="5" stroke="#2e3b12" strokeWidth="2" fill="#ffffff" fillOpacity="0.5" />
      </svg>

      {/* 4. UPPER-LEFT / MID-LEFT: Artisanal Wooden Pepper Mill */}
      <svg
        width="210"
        height="260"
        viewBox="0 0 160 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          top: '120px',
          left: '35px',
          transform: 'rotate(12deg)',
          opacity: 0.035,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Brass turn finial knob */}
        <circle cx="80" cy="16" r="6" stroke="#2e3b12" strokeWidth="2.2" />
        <path d="M72 16 L88 16" stroke="#2e3b12" strokeWidth="2" strokeLinecap="round" />
        <path d="M80 22 L80 28" stroke="#2e3b12" strokeWidth="2.5" />

        {/* Sculpted top crown */}
        <path
          d="M58 38 C58 28 102 28 102 38 L98 52 C98 56 62 56 62 52 Z"
          stroke="#2e3b12"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Waist transition ring */}
        <rect x="64" y="52" width="32" height="6" rx="2" stroke="#2e3b12" strokeWidth="2" />

        {/* Main Hourglass Contoured Body */}
        <path
          d="M66 58 C62 90 52 135 50 175 L110 175 C108 135 98 90 94 58 Z"
          stroke="#2e3b12"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Wood grain contour accents */}
        <path d="M68 90 Q80 94 92 90" stroke="#2e3b12" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M62 130 Q80 135 98 130" stroke="#2e3b12" strokeWidth="1.5" strokeLinecap="round" />

        {/* Grinder base ring */}
        <rect x="46" y="175" width="68" height="12" rx="3" stroke="#2e3b12" strokeWidth="2.4" />
        {/* Grinder teeth hints */}
        <line x1="56" y1="187" x2="56" y2="192" stroke="#2e3b12" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="187" x2="80" y2="192" stroke="#2e3b12" strokeWidth="2" strokeLinecap="round" />
        <line x1="104" y1="187" x2="104" y2="192" stroke="#2e3b12" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* 5. CENTER-RIGHT: Olive Wreath & Culinary Chalice Crest */}
      <svg
        width="250"
        height="250"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          top: '46%',
          right: '10%',
          transform: 'translateY(-50%) rotate(-6deg)',
          opacity: 0.036,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Olive Branch Crescent (Left) */}
        <path
          d="M100 175 C55 175 32 138 34 95 C36 55 60 28 92 20"
          stroke="#2e3b12"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M36 90 C22 84 18 96 28 104 C38 98 40 92 36 90 Z" fill="#2e3b12" opacity="0.4" />
        <path d="M42 65 C30 55 28 68 38 76 C46 72 46 66 42 65 Z" fill="#2e3b12" opacity="0.4" />
        <path d="M56 42 C46 30 46 42 56 50 C62 48 60 42 56 42 Z" fill="#2e3b12" opacity="0.4" />
        <path d="M45 125 C32 125 34 138 46 142 C52 136 50 128 45 125 Z" fill="#2e3b12" opacity="0.4" />
        <circle cx="28" cy="115" r="3.5" fill="#2e3b12" opacity="0.6" />
        <circle cx="48" cy="54" r="3" fill="#2e3b12" opacity="0.6" />

        {/* Olive Branch Crescent (Right) */}
        <path
          d="M100 175 C145 175 168 138 166 95 C164 55 140 28 108 20"
          stroke="#2e3b12"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M164 90 C178 84 182 96 172 104 C162 98 160 92 164 90 Z" fill="#2e3b12" opacity="0.4" />
        <path d="M158 65 C170 55 172 68 162 76 C154 72 154 66 158 65 Z" fill="#2e3b12" opacity="0.4" />
        <path d="M144 42 C154 30 154 42 144 50 C138 48 140 42 144 42 Z" fill="#2e3b12" opacity="0.4" />
        <circle cx="172" cy="115" r="3.5" fill="#2e3b12" opacity="0.6" />
        <circle cx="152" cy="54" r="3" fill="#2e3b12" opacity="0.6" />

        {/* Central Tasting Goblet / Wine Glass */}
        <path
          d="M84 65 C84 95 116 95 116 65 Z"
          stroke="#2e3b12"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Stem & Base */}
        <line x1="100" y1="95" x2="100" y2="128" stroke="#2e3b12" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M86 128 Q100 126 114 128" stroke="#2e3b12" strokeWidth="2.4" strokeLinecap="round" />

        {/* Chef Missy initial "M" inside crest */}
        <path
          d="M92 78 L96 68 L100 75 L104 68 L108 78"
          stroke="#2e3b12"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
