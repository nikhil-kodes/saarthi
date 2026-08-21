'use client';

import React from 'react';

/**
 * Technical dot matrix and layout grid pattern component (Vercel / Linear aesthetic).
 * Renders SVG dot matrix with optional ultra-thin grid lines and crosshair markers.
 */
export function DotMatrix({
  className = '',
  dotSize = 1.15,
  spacing = 24,
  color = 'rgba(0, 0, 0, 0.05)',
}: {
  className?: string;
  dotSize?: number;
  spacing?: number;
  color?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        <pattern
          id="dot-pattern"
          width={spacing}
          height={spacing}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x="0"
          y="0"
        >
          <circle cx={spacing / 2} cy={spacing / 2} r={dotSize} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth="0" fill="url(#dot-pattern)" />
    </svg>
  );
}

/**
 * Crosshair / Plus intersection marker (+ icon) for ghost grid junctions.
 */
export function GridCross({ className = '' }: { className?: string }) {
  return (
    <span
      className={`absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-neutral-400 font-mono text-[11px] select-none z-20 ${className}`}
    >
      +
    </span>
  );
}

/**
 * Full-Bleed End-to-End Ghost Grid Section.
 * Renders edge-to-edge horizontal boundary lines spanning the entire viewport width,
 * intersected with vertical boundary rails framing the content column,
 * with '+' crosshairs at all intersection points.
 */
export function GhostGridSection({
  children,
  id,
  className = '',
  innerClassName = '',
  label,
  tag,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
  innerClassName?: string;
  label?: string;
  tag?: string;
}) {
  return (
    <section id={id} className={`relative w-full border-y border-dashed border-neutral-300 ${className}`}>
      {/* Centered framed column with vertical dotted rails */}
      <div className="max-w-6xl mx-auto relative border-x border-dashed border-neutral-300 px-4 sm:px-8 py-12 sm:py-20">
        {/* Intersection Crosshairs at the 4 outer boundary junction points */}
        <GridCross className="top-0 left-0" />
        <GridCross className="top-0 right-0" />
        <GridCross className="bottom-0 left-0" />
        <GridCross className="bottom-0 right-0" />

        {/* Optional System Pill badge on the top edge */}
        {label && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-0.5 bg-[#ededed] border border-dashed border-neutral-300 rounded-full flex items-center gap-2 text-[11px] font-mono text-neutral-500 shadow-2xs z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4d23]" />
            <span className="uppercase font-semibold tracking-wider">{label}</span>
            {tag && <span className="text-neutral-400 font-mono">[{tag}]</span>}
          </div>
        )}

        <div className={innerClassName}>{children}</div>
      </div>
    </section>
  );
}

/**
 * Ghost grid layout container with subtle 1px intersecting lines and corner crosshairs.
 */
export function GhostGridBox({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative border border-dashed border-neutral-300 bg-white ${className}`}>
      {/* Corner crosshairs */}
      <GridCross className="top-0 left-0" />
      <GridCross className="top-0 right-0" />
      <GridCross className="bottom-0 left-0" />
      <GridCross className="bottom-0 right-0" />
      {children}
    </div>
  );
}
