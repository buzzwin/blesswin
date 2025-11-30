import type { ReactNode } from 'react';
import cn from 'clsx';

interface LoadingProps {
  className?: string;
  iconClassName?: string; // For backward compatibility
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

const dotSizes = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2.5 w-2.5',
  lg: 'h-3.5 w-3.5'
};

// Modern spinner with gradient
function GradientSpinner({ size = 'md', className = '', iconClassName = '' }: LoadingProps): JSX.Element {
  const sizeClass = iconClassName || sizeClasses[size];
  return (
    <div className={cn('relative', sizeClass, className)}>
      <div className='absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700' />
      <div className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-action border-r-hope' />
    </div>
  );
}

// Three dots animation
function DotsLoader({ size = 'md', className = '' }: LoadingProps): JSX.Element {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className={cn(dotSizes[size], 'animate-bounce rounded-full bg-gradient-to-r from-action to-hope [animation-delay:-0.3s]')} />
      <div className={cn(dotSizes[size], 'animate-bounce rounded-full bg-gradient-to-r from-hope to-sky [animation-delay:-0.15s]')} />
      <div className={cn(dotSizes[size], 'animate-bounce rounded-full bg-gradient-to-r from-sky to-action')} />
    </div>
  );
}

// Pulsing circle
function PulseLoader({ size = 'md', className = '', iconClassName = '' }: LoadingProps): JSX.Element {
  const sizeClass = iconClassName || sizeClasses[size];
  return (
    <div className={cn('relative', sizeClass, className)}>
      <div className='absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-action to-hope opacity-75' />
      <div className='relative rounded-full bg-gradient-to-r from-action to-hope h-full w-full' />
    </div>
  );
}

export function Loading({ 
  className = '', 
  iconClassName = '',
  size = 'md',
  variant = 'spinner'
}: LoadingProps): JSX.Element {
  // If iconClassName is provided, use spinner variant for backward compatibility
  if (iconClassName) {
    return <GradientSpinner size={size} className={className} iconClassName={iconClassName} />;
  }
  
  if (variant === 'dots') {
    return <DotsLoader size={size} className={className} />;
  }
  
  if (variant === 'pulse') {
    return <PulseLoader size={size} className={className} iconClassName={iconClassName} />;
  }
  
  return <GradientSpinner size={size} className={className} />;
}

// Convenience exports for specific use cases
export function LoadingSpinner(props: Omit<LoadingProps, 'variant'>): JSX.Element {
  return <Loading {...props} variant='spinner' />;
}

export function LoadingDots(props: Omit<LoadingProps, 'variant'>): JSX.Element {
  return <Loading {...props} variant='dots' />;
}

export function LoadingPulse(props: Omit<LoadingProps, 'variant'>): JSX.Element {
  return <Loading {...props} variant='pulse' />;
}
