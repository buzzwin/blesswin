import { motion } from 'framer-motion';
import { cn } from '@lib/utils';
import type { ReactNode } from 'react';

interface SlideInCardProps {
  children: ReactNode;
  index?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function SlideInCard({
  children,
  index = 0,
  direction = 'up',
  delay = 0,
  className
}: SlideInCardProps): JSX.Element {
  const directions = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: 50, y: 0 },
    right: { x: -50, y: 0 }
  };

  const initial = directions[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...initial }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: delay + index * 0.1
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
