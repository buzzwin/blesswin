import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}: AnimatedCounterProps): JSX.Element {
  const spring = useSpring(0, {
    damping: 30,
    stiffness: 100
  });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [spring]);

  const formattedValue =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.floor(displayValue).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

// Simpler version for basic use cases
export function SimpleAnimatedCounter({
  value,
  duration = 0.8,
  prefix = '',
  suffix = '',
  className = ''
}: Omit<AnimatedCounterProps, 'decimals'>): JSX.Element {
  return (
    <motion.span
      className={className}
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      key={value}
    >
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </motion.span>
  );
}
