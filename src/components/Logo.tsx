import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="redRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          <linearGradient id="silverRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer sphere shadow base */}
        <circle cx="50" cy="50" r="42" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />

        {/* Inner Silver 'D' Structure Rings */}
        <path
          d="M32 24 C 55 20, 75 32, 75 50 C 75 68, 55 80, 32 76 Z"
          fill="none"
          stroke="url(#silverRingGrad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M38 32 C 55 30, 66 38, 66 50 C 66 62, 55 70, 38 68 Z"
          fill="none"
          stroke="url(#silverRingGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Swirling Red Ribbon Layers forming 3D Sphere 'D' */}
        <path
          d="M 22 45 C 18 25, 45 12, 72 20 C 88 25, 88 40, 70 48 C 50 56, 18 40, 22 65 C 26 82, 60 88, 80 75"
          fill="none"
          stroke="url(#redRibbonGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#shadow3d)"
        />

        {/* Foreground accent ribbon loop */}
        <path
          d="M 28 35 C 40 22, 75 25, 85 45 C 92 60, 72 75, 48 72 C 30 70, 22 55, 32 45"
          fill="none"
          stroke="url(#redRibbonGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
