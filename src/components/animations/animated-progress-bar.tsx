import { motion } from 'framer-motion';
import { cn } from '@lib/utils';

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'pink';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const colorClasses = {
  green: 'bg-gradient-to-r from-green-400 to-emerald-500',
  blue: 'bg-gradient-to-r from-blue-400 to-cyan-500',
  purple: 'bg-gradient-to-r from-purple-400 to-pink-500',
  orange: 'bg-gradient-to-r from-orange-400 to-red-500',
  pink: 'bg-gradient-to-r from-pink-400 to-rose-500'
};

const heightClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

export function AnimatedProgressBar({
  progress,
  color = 'green',
  height = 'md',
  showLabel = false,
  label,
  animated = true
}: AnimatedProgressBarProps): JSX.Element {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className='w-full'>
      {showLabel && (
        <div className='mb-1 flex items-center justify-between'>
          <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
            {label || 'Progress'}
          </span>
          <span className='text-xs font-bold text-gray-900 dark:text-white'>
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
          heightClasses[height]
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full',
            colorClasses[color],
            animated && 'shadow-lg'
          )}
          initial={animated ? { width: 0 } : { width: `${clampedProgress}%` }}
          animate={{ width: `${clampedProgress}%` }}
          transition={
            animated
              ? {
                  type: 'spring',
                  stiffness: 50,
                  damping: 15,
                  duration: 1
                }
              : { duration: 0 }
          }
        >
          {/* Shimmer effect */}
          {animated && (
            <motion.div
              className='h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent'
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
