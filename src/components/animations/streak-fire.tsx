import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@lib/utils';

interface StreakFireProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

export function StreakFire({
  streak,
  size = 'md',
  animated = true
}: StreakFireProps): JSX.Element {
  const flameVariants = {
    initial: { scale: 1, y: 0 },
    animate: {
      scale: [1, 1.2, 1],
      y: [0, -5, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const sparkVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [0, -20],
      x: [0, Math.random() * 40 - 20],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: Math.random() * 0.5
      }
    }
  };

  return (
    <div className='relative inline-flex items-center gap-1'>
      <motion.div
        variants={animated ? flameVariants : undefined}
        initial='initial'
        animate={animated ? 'animate' : 'initial'}
        className='relative'
      >
        <Flame
          className={cn(
            sizeClasses[size],
            'fill-orange-500 text-orange-500',
            streak >= 7 && 'fill-orange-600 text-orange-600',
            streak >= 30 && 'fill-red-500 text-red-500'
          )}
        />
        {/* Sparkles around flame */}
        {animated && streak >= 7 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                variants={sparkVariants}
                initial='initial'
                animate='animate'
                className='absolute inset-0 flex items-center justify-center'
              >
                <span className='text-xs text-yellow-300'>✨</span>
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
      <span
        className={cn(
          'font-bold',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg',
          'text-orange-600 dark:text-orange-400'
        )}
      >
        {streak}
      </span>
    </div>
  );
}
