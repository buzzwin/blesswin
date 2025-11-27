import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@lib/context/auth-context';
import { cn } from '@lib/utils';
import { X, Sparkles, Check } from 'lucide-react';
import type { RitualDefinition } from '@lib/types/ritual';

interface RitualsBannerProps {
  ritual: RitualDefinition | null;
  completed?: boolean;
  onDismiss?: () => void;
  onComplete?: () => void;
  onViewAll?: () => void;
}

export function RitualsBanner({
  ritual,
  completed = false,
  onDismiss,
  onComplete,
  onViewAll
}: RitualsBannerProps): JSX.Element {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Check localStorage for dismissal
  useEffect(() => {
    if (!ritual) return;
    const dismissedKey = `ritual-banner-dismissed-${ritual.id}`;
    const isDismissed = localStorage.getItem(dismissedKey) === 'true';
    setDismissed(isDismissed);
  }, [ritual]);

  if (!ritual || dismissed) return <></>;

  const handleDismiss = (): void => {
    if (!ritual) return;
    const dismissedKey = `ritual-banner-dismissed-${ritual.id}`;
    localStorage.setItem(dismissedKey, 'true');
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={cn(
      'border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3',
      'dark:border-gray-700 dark:from-purple-900/20 dark:to-pink-900/20'
    )}>
      <div className='mx-auto flex max-w-6xl items-center gap-3'>
        {/* Icon */}
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
          {completed ? (
            <Check className='h-5 w-5 text-green-600 dark:text-green-400' />
          ) : (
            <span className='text-xl'>{ritual.icon || '🌱'}</span>
          )}
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
              {completed ? 'Ritual Completed! ✨' : `Today's Ritual: ${ritual.title}`}
            </h3>
          </div>
          {!completed && (
            <p className='mt-0.5 text-xs text-gray-600 dark:text-gray-400 line-clamp-1'>
              {ritual.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2'>
          {completed ? (
            <>
              {onViewAll && (
                <Link href='/rituals'>
                  <a className='text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200'>
                    View All
                  </a>
                </Link>
              )}
            </>
          ) : (
            <>
              {onComplete && (
                <button
                  onClick={onComplete}
                  className='rounded-full bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-purple-700'
                >
                  Do It Now
                </button>
              )}
              {onViewAll && (
                <Link href='/rituals'>
                  <a className='text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200'>
                    View All
                  </a>
                </Link>
              )}
            </>
          )}
          <button
            onClick={handleDismiss}
            className='rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
            aria-label='Dismiss banner'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
}

