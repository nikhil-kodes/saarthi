'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

/**
 * 3D Card Tilt Component driven by GSAP physics for tactile feedback.
 */
export function GsapTiltCard({
  children,
  className = '',
  maxTilt = 6,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card) return;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const tiltX = (y / (rect.height / 2)) * -maxTilt;
        const tiltY = (x / (rect.width / 2)) * maxTilt;

        gsap.to(card, {
          rotationX: tiltX,
          rotationY: tiltY,
          transformPerspective: 1000,
          ease: 'power2.out',
          duration: 0.35,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          ease: 'power2.out',
          duration: 0.5,
        });
      };

      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    },
    { scope: cardRef, dependencies: [maxTilt] }
  );

  return (
    <div ref={cardRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/**
 * GSAP Animated Counter for real-time numeric scrub.
 */
export function GsapCounter({
  value,
  prefix = '',
  suffix = '',
  className = '',
  duration = 1.2,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const countRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = countRef.current;
      if (!el) return;

      const obj = { val: 0 };

      gsap.to(obj, {
        val: value,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          if (el) {
            el.innerText = `${prefix}${Math.round(obj.val).toLocaleString()}${suffix}`;
          }
        },
      });
    },
    { scope: countRef, dependencies: [value, prefix, suffix, duration] }
  );

  return (
    <span ref={countRef} className={`font-mono tabular-nums ${className}`}>
      {prefix}{value}{suffix}
    </span>
  );
}

/**
 * Full-width Vercel-style Ghost Section Divider with ultra-thin dotted lines and junction crosshairs.
 */
export function GhostSectionDivider({
  label = '',
  tag = '',
}: {
  label?: string;
  tag?: string;
}) {
  return (
    <div className="relative w-full my-10 sm:my-14 max-w-6xl mx-auto px-4">
      <div className="relative border-t border-dashed border-neutral-300 flex items-center justify-between">
        {/* Left and Right junction plus markers */}
        <span className="absolute -left-1.5 -top-2.5 font-mono text-[12px] text-neutral-400 select-none">
          +
        </span>
        <span className="absolute -right-1.5 -top-2.5 font-mono text-[12px] text-neutral-400 select-none">
          +
        </span>

        {/* Center Technical Pill */}
        {label && (
          <div className="mx-auto -translate-y-1/2 px-3 py-0.5 bg-[#ededed] border border-dashed border-neutral-300 rounded-full flex items-center gap-2 text-[11px] font-mono text-neutral-500 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4d23]" />
            <span className="uppercase font-semibold tracking-wider">{label}</span>
            {tag && <span className="text-neutral-400 font-mono">[{tag}]</span>}
          </div>
        )}
      </div>
    </div>
  );
}
