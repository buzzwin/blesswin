import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Film, Sparkles } from 'lucide-react';
import { FamilyWatchMode } from '@components/recommendations/family-watch-mode';
import { cn } from '@lib/utils';

interface WindDownRitualProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function WindDownRitual({
  isExpanded = false,
  onToggle
}: WindDownRitualProps): JSX.Element {
  return (
    <div className='rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20 md:p-6'>
      <div className='mb-4 flex items-start justify-between'>
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500'>
            <Moon className='h-5 w-5 text-white' />
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Wind-Down Ritual
            </h3>
            <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
              Rest and connection, not just content. Curate by mood, not catalog.
            </p>
          </div>
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            className='shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                className='h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </motion.div>
          </button>
        )}
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className='overflow-hidden'
        >
          <div className='rounded-lg border border-purple-200 bg-white dark:border-purple-800 dark:bg-gray-800'>
            <FamilyWatchMode />
          </div>
        </motion.div>
      )}

      {!isExpanded && (
        <div className='rounded-lg border border-purple-200 bg-white/50 p-3 dark:border-purple-800 dark:bg-gray-800/50'>
          <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
            <Film className='h-4 w-4' />
            <span>Tap to find something perfect for right now</span>
          </div>
        </div>
      )}
    </div>
  );
}
