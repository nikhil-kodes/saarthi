'use client';

import React from 'react';

interface GaugeProps {
  value: number;
  color?: string;
  showLabels?: boolean;
  min?: string | number;
  max?: string | number;
  className?: string;
}

export default function Gauge({
  value,
  color = '#ef4d23',
  showLabels = false,
  min = '0',
  max = '100',
  className = '',
}: GaugeProps) {
  const totalTicks = 40;
  const activeTicks = Math.round((Math.max(0, Math.min(100, value)) / 100) * totalTicks);

  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    const angle = Math.PI + (i / (totalTicks - 1)) * Math.PI;
    const rInner = 70;
    const rOuter = 80;
    const cx = 100;
    const cy = 100;

    const x1 = cx + rInner * Math.cos(angle);
    const y1 = cy + rInner * Math.sin(angle);
    const x2 = cx + rOuter * Math.cos(angle);
    const y2 = cy + rOuter * Math.sin(angle);

    const isActive = i < activeTicks;

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? color : '#d4d4d8'}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    );
  });

  return (
    <div className={`flex flex-col items-center w-full max-w-[260px] mx-auto ${className}`}>
      <svg viewBox="0 0 200 120" className="w-full h-auto">
        {ticks}
        <text
          x="100"
          y="105"
          textAnchor="middle"
          fontSize="22"
          fontWeight="600"
          fill="#18181b"
          className="font-mono select-none"
        >
          {value}%
        </text>
      </svg>
      {showLabels && (
        <div className="flex w-full justify-between px-3 text-[11px] font-medium text-neutral-500 font-mono -mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
