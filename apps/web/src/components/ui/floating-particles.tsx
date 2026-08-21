'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  className?: string;
}

/**
 * Ambient floating particles that drift slowly across the dark hero.
 * Pure CSS animations — no heavy canvas/WebGL overhead.
 */
export default function FloatingParticles({
  count = 20,
  colors = [
    'rgba(30, 138, 95, 0.3)',   // status-success
    'rgba(44, 111, 224, 0.25)', // brand-blue
    'rgba(18, 58, 115, 0.35)',  // brand-navy
    'rgba(200, 127, 18, 0.2)',  // status-warning (amber)
    'rgba(255, 255, 255, 0.08)', // white subtle
  ],
  className = '',
}: FloatingParticlesProps) {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      color: string;
      duration: number;
      delay: number;
    }>
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)] || 'rgba(30, 138, 95, 0.3)',
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
    }));
    setParticles(generated);
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            filter: `blur(${p.size > 2 ? 1 : 0}px)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes particle-float {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          25% {
            transform: translate(${Math.random() > 0.5 ? '' : '-'}30px, -40px) scale(1.2);
            opacity: 0.7;
          }
          50% {
            transform: translate(${Math.random() > 0.5 ? '' : '-'}60px, 20px) scale(0.8);
            opacity: 0.5;
          }
          75% {
            transform: translate(20px, -60px) scale(1.1);
            opacity: 0.6;
          }
          100% {
            transform: translate(-20px, 30px) scale(1);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}
