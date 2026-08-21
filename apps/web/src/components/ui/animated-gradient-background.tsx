'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedGradientBackgroundProps {
  startingGap?: number;
  breathing?: boolean;
  gradientColors?: string[];
  gradientStops?: number[];
  animationSpeed?: number;
  breathingRange?: number;
  className?: string;
  topOffset?: number;
}

/**
 * Animated radial gradient background with a subtle breathing effect.
 * Adapted from 21st.dev (hammamikhairi/animated-gradient-background)
 * and re-colored for Saarthi's dark-band palette.
 */
const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  startingGap = 125,
  breathing = true,
  gradientColors = [
    '#14181F',   // surface-dark
    '#123A73',   // brand-navy
    '#1E8A5F',   // status-success (compliance green)
    '#2C6FE0',   // brand-blue
    '#154FB0',   // brand-blue-deep
    '#14181F',   // fade back to dark
    '#0A0D12',   // deep black
  ],
  gradientStops = [25, 42, 55, 65, 78, 90, 100],
  animationSpeed = 0.02,
  breathingRange = 5,
  topOffset = 0,
  className = '',
}) => {
  if (gradientColors.length !== gradientStops.length) {
    throw new Error(
      `gradientColors and gradientStops must have the same length.`
    );
  }

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrame: number;
    let width = startingGap;
    let directionWidth = 1;

    const animateGradient = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1;
      if (width <= startingGap - breathingRange) directionWidth = 1;

      if (!breathing) directionWidth = 0;
      width += directionWidth * animationSpeed;

      const gradientStopsString = gradientStops
        .map((stop, index) => `${gradientColors[index]} ${stop}%`)
        .join(', ');

      const gradient = `radial-gradient(${width}% ${width + topOffset}% at 50% 20%, ${gradientStopsString})`;

      if (containerRef.current) {
        containerRef.current.style.background = gradient;
      }

      animationFrame = requestAnimationFrame(animateGradient);
    };

    animationFrame = requestAnimationFrame(animateGradient);
    return () => cancelAnimationFrame(animationFrame);
  }, [startingGap, breathing, gradientColors, gradientStops, animationSpeed, breathingRange, topOffset]);

  return (
    <motion.div
      key="animated-gradient-background"
      initial={{ opacity: 0, scale: 1.3 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { duration: 1.8, ease: 'easeOut' },
      }}
      className={`absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 transition-transform"
      />
    </motion.div>
  );
};

export default AnimatedGradientBackground;
