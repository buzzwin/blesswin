import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles, Clock, Heart } from 'lucide-react';
import { cn } from '@lib/utils';
import { BounceButton } from '@components/animations/bounce-button';
import type { RitualDefinition } from '@lib/types/ritual';

interface TodayStackProps {
  rituals: RitualDefinition[];
  onComplete: (ritual: RitualDefinition) => void;
  onViewAll?: () => void;
}

export function TodayStack({
  rituals,
  onComplete,
  onViewAll
}: TodayStackProps): JSX.Element {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (rituals.length === 0) {
    return (
      <div className='rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50'>
        <Sparkles className='mx-auto mb-3 h-8 w-8 text-gray-400' />
        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
          No rituals for today
        </p>
        <p className='mt-1 text-xs text-gray-500 dark:text-gray-500'>
          Your day is open for new intentions
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Today's Rituals
          </h2>
          <p className='mt-0.5 text-xs text-gray-600 dark:text-gray-400'>
            Small actions, big impact
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className='text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400'
          >
            View All
          </button>
        )}
      </div>

      <div className='space-y-2'>
        <AnimatePresence>
          {rituals.map((ritual, index) => {
            const isExpanded = expandedIndex === index;
            const isCompleted = ritual.completed;

            return (
              <motion.div
                key={ritual.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'group relative overflow-hidden rounded-lg border-2 transition-all',
                  isCompleted
                    ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600',
                  isExpanded && 'shadow-lg'
                )}
              >
                <div
                  className={cn(
                    'flex items-center gap-3 p-3',
                    isExpanded && 'pb-2'
                  )}
                >
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => {
                      if (!isCompleted) {
                        onComplete(ritual);
                      }
                    }}
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                      isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50 dark:border-gray-600 dark:hover:border-purple-600'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className='h-5 w-5' />
                    ) : (
                      <Circle className='h-5 w-5 text-gray-400' />
                    )}
                  </button>

                  {/* Ritual Info */}
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0 flex-1'>
                        <h3
                          className={cn(
                            'text-sm font-semibold line-clamp-1',
                            isCompleted
                              ? 'text-green-700 line-through dark:text-green-400'
                              : 'text-gray-900 dark:text-white'
                          )}
                        >
                          {ritual.icon && <span className='mr-1.5'>{ritual.icon}</span>}
                          {ritual.title}
                        </h3>
                        {!isExpanded && (
                          <p className='mt-0.5 line-clamp-1 text-xs text-gray-600 dark:text-gray-400'>
                            {ritual.description}
                          </p>
                        )}
                      </div>

                      {/* Time/Duration */}
                      {ritual.durationEstimate && (
                        <div className='flex shrink-0 items-center gap-1 text-xs text-gray-500 dark:text-gray-500'>
                          <Clock className='h-3 w-3' />
                          <span>{ritual.durationEstimate}</span>
                        </div>
                      )}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className='mt-2 space-y-2'
                      >
                        <p className='text-xs text-gray-600 dark:text-gray-400'>
                          {ritual.description}
                        </p>
                        {ritual.tags && ritual.tags.length > 0 && (
                          <div className='flex flex-wrap gap-1.5'>
                            {ritual.tags.map((tag) => (
                              <span
                                key={tag}
                                className='rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {!isCompleted && (
                          <BounceButton
                            variant='primary'
                            size='sm'
                            onClick={() => onComplete(ritual)}
                            className='w-full'
                          >
                            Complete & Share
                          </BounceButton>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  {!isCompleted && (
                    <button
                      onClick={() =>
                        setExpandedIndex(isExpanded ? null : index)
                      }
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

                {/* Progress Indicator */}
                {isCompleted && (
                  <div className='absolute bottom-0 left-0 right-0 h-1 bg-green-500' />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
