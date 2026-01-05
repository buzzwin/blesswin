import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Star } from 'lucide-react';

interface CelebrationProps {
  show: boolean;
  message?: string;
  type?: 'success' | 'achievement' | 'streak';
  onComplete?: () => void;
}

export function Celebration({
  show,
  message,
  type = 'success',
  onComplete
}: CelebrationProps): JSX.Element | null {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15
      }
    },
    exit: {
      scale: 0,
      rotate: 180,
      transition: { duration: 0.3 }
    }
  };

  const messageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.5 }
    },
    exit: { opacity: 0, y: -20 }
  };

  const getIcon = () => {
    switch (type) {
      case 'achievement':
        return <Trophy className='h-16 w-16 text-yellow-400' />;
      case 'streak':
        return <Sparkles className='h-16 w-16 text-orange-400' />;
      default:
        return <Star className='h-16 w-16 text-green-400' />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'achievement':
        return ['#fbbf24', '#f59e0b', '#d97706'];
      case 'streak':
        return ['#fb923c', '#f97316', '#ea580c'];
      default:
        return ['#10b981', '#059669', '#047857'];
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center'>
          {/* Confetti */}
          {showConfetti && dimensions.width > 0 && (
            <Confetti
              width={dimensions.width}
              height={dimensions.height}
              recycle={false}
              numberOfPieces={200}
              colors={getColors()}
              gravity={0.3}
            />
          )}

          {/* Celebration Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='relative z-10 flex flex-col items-center justify-center'
          >
            {/* Icon */}
            <motion.div
              variants={iconVariants}
              initial='initial'
              animate='animate'
              exit='exit'
              className='mb-4'
            >
              {getIcon()}
            </motion.div>

            {/* Message */}
            {message && (
              <motion.div
                variants={messageVariants}
                initial='initial'
                animate='animate'
                exit='exit'
                className='text-center'
              >
                <h2 className='mb-2 text-3xl font-bold text-white drop-shadow-lg'>
                  {message}
                </h2>
              </motion.div>
            )}

            {/* Sparkle Effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI) / 3) * 100,
                  y: Math.sin((i * Math.PI) / 3) * 100
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                className='absolute text-2xl text-yellow-300'
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
