import React from 'react';

/**
 * Botanical olive branch motif rendered using pure SVG vectors.
 * Replaces blurry raster images with crisp, theme-harmonized shapes.
 */
export default function BotanicalAccent({ width = 36, height = 36, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', margin: '0 auto 4px', filter: 'drop-shadow(0 1px 1px rgba(46, 59, 18, 0.08))' }}
      aria-hidden="true"
    >
      {/* Central curving stem */}
      <path
        d="M32 55 C32 40, 33 22, 32 9"
        stroke="#596a3a"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Top pair of delicate leaves */}
      <path
        d="M32 10 C30 5, 25 4, 23 7 C21 9, 24 13, 32 13 Z"
        fill="#6c7f46"
        opacity="0.95"
      />
      <path
        d="M32 10 C34 5, 39 4, 41 7 C43 9, 40 13, 32 13 Z"
        fill="#556534"
        opacity="0.95"
      />

      {/* Second pair of olive leaves */}
      <path
        d="M32 19 C27 14, 20 14, 17 18 C15 21, 22 23, 32 22 Z"
        fill="#62753e"
        opacity="0.92"
      />
      <path
        d="M32 21 C37 16, 44 16, 47 20 C49 23, 42 25, 32 24 Z"
        fill="#4d5d30"
        opacity="0.92"
      />

      {/* Third pair of olive leaves */}
      <path
        d="M32 30 C26 24, 17 26, 15 31 C14 35, 21 36, 32 32 Z"
        fill="#6c7f46"
        opacity="0.95"
      />
      <path
        d="M32 32 C38 26, 47 28, 49 33 C50 37, 43 38, 32 34 Z"
        fill="#556534"
        opacity="0.95"
      />

      {/* Fourth pair of olive leaves */}
      <path
        d="M32 41 C27 37, 19 40, 18 45 C18 48, 24 48, 32 43 Z"
        fill="#62753e"
        opacity="0.9"
      />
      <path
        d="M32 43 C37 39, 45 42, 46 47 C46 50, 40 50, 32 45 Z"
        fill="#4d5d30"
        opacity="0.9"
      />

      {/* Botanical olive berries */}
      <circle cx="27" cy="24" r="2" fill="#3c4722" />
      <circle cx="37" cy="35" r="2" fill="#3c4722" />
    </svg>
  );
}
