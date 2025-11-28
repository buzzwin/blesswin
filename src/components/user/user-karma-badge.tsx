/**
 * KarmaBadge Component
 * Displays total karma points prominently with optional animation
 */

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@lib/utils';

interface UserKarmaBadgeProps {
  karmaPoints: number;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function UserKarmaBadge({
  karmaPoints,
  className,
  showIcon = true,
  size = 'md',
  animated = false
}: UserKarmaBadgeProps): JSX.Element {
  const [displayPoints, setDisplayPoints] = useState(karmaPoints);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animated && displayPoints !== karmaPoints) {
      setIsAnimating(true);
      const duration = 500;
      const steps = 20;
      const increment = (karmaPoints - displayPoints) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayPoints(karmaPoints);
          setIsAnimating(false);
          clearInterval(interval);
        } else {
          setDisplayPoints(Math.round(displayPoints + increment * currentStep));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    } else {
      setDisplayPoints(karmaPoints);
    }
  }, [karmaPoints, animated, displayPoints]);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 font-semibold text-white shadow-lg transition-all',
        sizeClasses[size],
        isAnimating && 'scale-110',
        className
      )}
    >
      {showIcon && (
        <Sparkles className={cn('text-yellow-300', iconSizes[size])} />
      )}
      <span className='font-bold'>{displayPoints.toLocaleString()}</span>
      <span className='text-xs opacity-90'>karma</span>
    </div>
  );
}

