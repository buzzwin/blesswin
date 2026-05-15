import { useState, useCallback } from 'react';
import { cn } from '@lib/utils';
import { HeroIcon } from '@components/ui/hero-icon';
import type { Buzz, Signature } from '@lib/types/buzz';

type Props = {
  buzz: Buzz;
  signatures: Signature[];
};

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂',
  diwali: '🪔',
  christmas: '🎄',
  eid: '🌙',
  anniversary: '💍',
  custom: '✨',
};

// Soft pastel backgrounds cycling per page
const PAGE_BACKGROUNDS = [
  'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
  'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30',
  'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
  'from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30',
  'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30',
];

function bgFor(index: number): string {
  return PAGE_BACKGROUNDS[index % PAGE_BACKGROUNDS.length];
}

function CoverPage({ buzz }: { buzz: Buzz }): JSX.Element {
  const emoji = OCCASION_EMOJI[buzz.occasion] ?? '✨';
  return (
    <div className='flex h-full flex-col items-center justify-center gap-6 p-8 text-center'>
      <span className='text-7xl drop-shadow-sm'>{emoji}</span>
      <div>
        <p className='text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400'>
          Buzzbook
        </p>
        <h2 className='mt-2 text-3xl font-bold text-gray-900 dark:text-white'>
          {buzz.title}
        </h2>
      </div>
      <p className='text-sm text-gray-500'>
        {buzz.totalSignatures} {buzz.totalSignatures === 1 ? 'page' : 'pages'} inside
      </p>
      <div className='mt-2 animate-bounce text-gray-300 dark:text-gray-600'>
        <HeroIcon iconName='ChevronRightIcon' className='h-6 w-6' />
      </div>
    </div>
  );
}

function TextPage({ sig }: { sig: Signature }): JSX.Element {
  return (
    <div className='flex h-full flex-col justify-between p-8'>
      <span className='text-6xl leading-none text-gray-200 dark:text-gray-700'>&ldquo;</span>
      <p className='flex-1 overflow-y-auto py-4 text-center text-xl font-medium leading-relaxed text-gray-800 dark:text-gray-100'>
        {sig.text}
      </p>
      <div className='mt-4 flex items-center justify-end gap-2'>
        <div className='h-px flex-1 bg-gray-200 dark:bg-gray-700' />
        <span className='text-sm font-semibold text-gray-500 dark:text-gray-400'>
          — {sig.authorName}
        </span>
      </div>
    </div>
  );
}

function PhotoPage({ sig }: { sig: Signature }): JSX.Element {
  return (
    <div className='relative flex h-full flex-col'>
      <div className='flex-1 overflow-hidden'>
        {sig.mediaURL ? (
          <img
            src={sig.mediaURL}
            alt={`${sig.authorName}'s page`}
            className='h-full w-full object-contain'
          />
        ) : (
          <div className='flex h-full items-center justify-center text-gray-300'>
            <HeroIcon iconName='PhotoIcon' className='h-16 w-16' />
          </div>
        )}
      </div>
      <div className='shrink-0 bg-white/80 p-4 text-right backdrop-blur-sm dark:bg-gray-900/80'>
        <span className='text-sm font-semibold text-gray-600 dark:text-gray-300'>
          — {sig.authorName}
        </span>
      </div>
    </div>
  );
}

export function BuzzbookReveal({ buzz, signatures }: Props): JSX.Element {
  const visible = signatures.filter((s) => !s.isHidden);
  const totalPages = 1 + visible.length; // cover + sigs
  const [page, setPage] = useState(0);

  // Touch swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const prev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const next = useCallback(() => setPage((p) => Math.min(totalPages - 1, p + 1)), [totalPages]);

  function handleTouchStart(e: React.TouchEvent): void {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent): void {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    setTouchStartX(null);
  }

  const isCover = page === 0;
  const sig = isCover ? null : visible[page - 1];

  return (
    <div className='flex h-full flex-col'>
      {/* Page area */}
      <div
        className={cn(
          'relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br',
          isCover ? 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30' : bgFor(page)
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isCover && <CoverPage buzz={buzz} />}
        {!isCover && sig && sig.type === 'text' && <TextPage sig={sig} />}
        {!isCover && sig && sig.type === 'photo' && <PhotoPage sig={sig} />}

        {/* Side nav arrows (desktop) */}
        <button
          onClick={prev}
          disabled={page === 0}
          className='absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow backdrop-blur-sm transition hover:bg-white disabled:opacity-0 dark:bg-gray-800/70 dark:hover:bg-gray-800'
        >
          <HeroIcon iconName='ChevronLeftIcon' className='h-5 w-5 text-gray-700 dark:text-gray-200' />
        </button>
        <button
          onClick={next}
          disabled={page === totalPages - 1}
          className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow backdrop-blur-sm transition hover:bg-white disabled:opacity-0 dark:bg-gray-800/70 dark:hover:bg-gray-800'
        >
          <HeroIcon iconName='ChevronRightIcon' className='h-5 w-5 text-gray-700 dark:text-gray-200' />
        </button>
      </div>

      {/* Page indicator dots */}
      <div className='flex items-center justify-center gap-1.5 py-4'>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-200',
              i === page
                ? 'w-6 bg-emerald-500'
                : 'w-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            )}
          />
        ))}
      </div>

      {/* Page label */}
      <p className='pb-4 text-center text-xs text-gray-400'>
        {isCover ? 'Cover' : `Page ${page} of ${visible.length}`}
      </p>
    </div>
  );
}
