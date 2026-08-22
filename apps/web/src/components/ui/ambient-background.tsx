'use client';

import React from 'react';

/**
 * Floating Luminous Ambient Glow Orbs.
 * GPU-accelerated, zero-jank radial gradients drifting smoothly in the background.
 */
export function AmbientOrbs({
  theme = 'warm',
  intensity = 'medium',
  className = '',
}: {
  theme?: 'warm' | 'cool' | 'dark' | 'emerald' | 'multi';
  intensity?: 'subtle' | 'medium' | 'vibrant';
  className?: string;
}) {
  const opacityMap = {
    subtle: 'opacity-25',
    medium: 'opacity-40 sm:opacity-55',
    vibrant: 'opacity-60 sm:opacity-75',
  };

  const currentOpacity = opacityMap[intensity];

  if (theme === 'dark') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${currentOpacity} ${className}`} aria-hidden="true">
        {/* Saffron / Orange Core Glow */}
        <div className="animate-orb-1 absolute -top-[15%] left-[20%] h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(239,77,35,0.22)_0%,rgba(239,77,35,0)_70%)] blur-[90px]" />
        {/* Deep Royal Indigo Aura */}
        <div className="animate-orb-2 absolute top-[35%] -right-[10%] h-[550px] w-[550px] rounded-full bg-[radial-gradient(circle,rgba(30,58,138,0.28)_0%,rgba(30,58,138,0)_70%)] blur-[100px]" />
        {/* Emerald / Teal Trust Hue */}
        <div className="animate-orb-3 absolute -bottom-[20%] left-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,rgba(16,185,129,0)_70%)] blur-[80px]" />
      </div>
    );
  }

  if (theme === 'cool') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${currentOpacity} ${className}`} aria-hidden="true">
        <div className="animate-orb-1 absolute top-[5%] -left-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(44,111,224,0.15)_0%,rgba(44,111,224,0)_70%)] blur-[90px]" />
        <div className="animate-orb-2 absolute bottom-[10%] right-[5%] h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(239,77,35,0.12)_0%,rgba(239,77,35,0)_70%)] blur-[80px]" />
      </div>
    );
  }

  if (theme === 'emerald') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${currentOpacity} ${className}`} aria-hidden="true">
        <div className="animate-orb-1 absolute top-[10%] right-[10%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16)_0%,rgba(16,185,129,0)_70%)] blur-[90px]" />
        <div className="animate-orb-2 absolute bottom-[10%] left-[5%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(239,77,35,0.12)_0%,rgba(239,77,35,0)_70%)] blur-[80px]" />
      </div>
    );
  }

  // Default 'warm' / 'multi'
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${currentOpacity} ${className}`} aria-hidden="true">
      {/* Saffron Primary Orb */}
      <div className="animate-orb-1 absolute -top-[10%] right-[15%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(239,77,35,0.16)_0%,rgba(239,77,35,0)_70%)] blur-[90px]" />
      {/* Royal Indigo Trust Orb */}
      <div className="animate-orb-2 absolute top-[40%] -left-[10%] h-[550px] w-[550px] rounded-full bg-[radial-gradient(circle,rgba(18,58,115,0.14)_0%,rgba(18,58,115,0)_70%)] blur-[100px]" />
      {/* Warm Sunlight Gold */}
      <div className="animate-orb-3 absolute bottom-[5%] right-[20%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.12)_0%,rgba(245,158,11,0)_70%)] blur-[85px]" />
    </div>
  );
}

/**
 * Architectural Grid Pattern with Vignette Radial Spotlight.
 */
export function ArchitecturalGrid({
  className = '',
  gridSize = 32,
  dark = false,
}: {
  className?: string;
  gridSize?: number;
  dark?: boolean;
}) {
  const strokeColor = dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  const dotColor = dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 100%)',
      }}
      aria-hidden="true"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={`arch-grid-${gridSize}-${dark ? 'd' : 'l'}`}
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.75"
            />
            <circle cx="0" cy="0" r="1" fill={dotColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#arch-grid-${gridSize}-${dark ? 'd' : 'l'})`} />
      </svg>
    </div>
  );
}

/**
 * High-End Specular Horizon Light Beam.
 * Adds a subtle glowing horizon or accent bar at the top or bottom of a card or section.
 */
export function SpecularHorizonBeam({
  color = '#ef4d23',
  className = '',
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div className={`relative w-full h-[1px] overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
          opacity: 0.6,
        }}
      />
      <div
        className="animate-beam absolute inset-0 w-1/2 h-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)`,
        }}
      />
    </div>
  );
}

/**
 * Universal Dynamic App Atmosphere Wrapper.
 * Wraps dashboard pages and inner sections in a sleek, non-static, premium agency-level canvas.
 */
export function AppAtmosphere({
  children,
  className = '',
  theme = 'warm',
  showGrid = true,
}: {
  children: React.ReactNode;
  className?: string;
  theme?: 'warm' | 'cool' | 'dark' | 'emerald' | 'multi';
  showGrid?: boolean;
}) {
  return (
    <div className={`relative min-h-screen w-full bg-[#f4f3ef] overflow-hidden ${className}`}>
      {/* 1. Dynamic Ambient Glowing Orbs */}
      <AmbientOrbs theme={theme} intensity="medium" />

      {/* 2. Architectural Grid Overlay */}
      {showGrid && <ArchitecturalGrid gridSize={28} dark={theme === 'dark'} />}

      {/* 3. Subtle Dot Matrix Texture */}
      <div className="pointer-events-none absolute inset-0 ambient-dot-grid opacity-60" aria-hidden="true" />

      {/* 4. Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
