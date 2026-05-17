import { useState, useCallback } from 'react';
import { cn } from '@lib/utils';
import { HeroIcon } from '@components/ui/hero-icon';
import { BuzzbookCoverOrnament } from '@components/ui/illustrations';
import type { Buzz, Signature } from '@lib/types/buzz';

type Props = {
  buzz: Buzz;
  signatures: Signature[];
};

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂', anniversary: '💍', graduation: '🎓', trip: '✈️',
  movie: '🎬', series: '📺', gamenight: '🎮', bookclub: '📚',
  diwali: '🪔', christmas: '🎄', eid: '🌙', custom: '✨'
};

// Warm bohemian page backgrounds cycling per page
const PAGE_BACKGROUNDS = [
  'from-[rgba(201,169,110,0.12)] to-[rgba(181,96,60,0.08)] dark:from-[rgba(201,169,110,0.08)] dark:to-[rgba(181,96,60,0.05)]',
  'from-[rgba(156,175,136,0.12)] to-[rgba(201,169,110,0.08)] dark:from-[rgba(156,175,136,0.08)] dark:to-[rgba(201,169,110,0.05)]',
  'from-[rgba(181,96,60,0.1)] to-[rgba(201,169,110,0.08)] dark:from-[rgba(181,96,60,0.07)] dark:to-[rgba(201,169,110,0.05)]',
  'from-[rgba(201,169,110,0.08)] to-[rgba(156,175,136,0.1)] dark:from-[rgba(201,169,110,0.05)] dark:to-[rgba(156,175,136,0.07)]',
  'from-[rgba(212,165,116,0.1)] to-[rgba(201,169,110,0.06)] dark:from-[rgba(212,165,116,0.07)] dark:to-[rgba(201,169,110,0.04)]'
];

function bgFor(index: number): string {
  return PAGE_BACKGROUNDS[index % PAGE_BACKGROUNDS.length];
}

function CoverPage({ buzz }: { buzz: Buzz }): JSX.Element {
  const emoji = OCCASION_EMOJI[buzz.occasion] ?? '✨';
  return (
    <div className='relative flex h-full flex-col items-center justify-center gap-6 p-8 text-center'>
      <BuzzbookCoverOrnament />
      <span className='relative z-10 text-7xl drop-shadow-sm'>{emoji}</span>
      <div className='relative z-10'>
        <p className='text-sm font-semibold uppercase tracking-widest text-[#8a6520] dark:text-[#C9A96E]'>
          Buzzbook
        </p>
        <h2 className='mt-2 font-display text-3xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
          {buzz.title}
        </h2>
      </div>
      <p className='relative z-10 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
        {buzz.totalSignatures} {buzz.totalSignatures === 1 ? 'page' : 'pages'} inside
      </p>
      <div className='relative z-10 mt-2 animate-bounce text-[#C9A96E]/40'>
        <HeroIcon iconName='ChevronRightIcon' className='h-6 w-6' />
      </div>
    </div>
  );
}

function TextPage({ sig }: { sig: Signature }): JSX.Element {
  return (
    <div className='flex h-full flex-col justify-between p-8'>
      <span className='font-display text-6xl leading-none text-[rgba(201,169,110,0.25)]'>&ldquo;</span>
      <p className='flex-1 overflow-y-auto py-4 text-center text-xl font-medium leading-relaxed text-[#1a1108] dark:text-[#F5EFE6]'>
        {sig.text}
      </p>
      <div className='mt-4 flex items-center justify-end gap-2'>
        <div className='h-px flex-1 bg-[#e8d8c4] dark:bg-[#2a1d10]' />
        <span className='text-sm font-semibold text-[#6b5744] dark:text-[#9E8B76]'>
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
          <div className='flex h-full items-center justify-center text-[#e8d8c4] dark:text-[#2a1d10]'>
            <HeroIcon iconName='PhotoIcon' className='h-16 w-16' />
          </div>
        )}
      </div>
      <div className='shrink-0 bg-[#faf8f4]/90 p-4 text-right backdrop-blur-sm dark:bg-[#1c1510]/90'>
        <span className='text-sm font-semibold text-[#6b5744] dark:text-[#C4B5A0]'>
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
      if (dx < 0) { next(); } else { prev(); }
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
          isCover
            ? 'from-[rgba(201,169,110,0.15)] to-[rgba(181,96,60,0.08)] dark:from-[rgba(201,169,110,0.1)] dark:to-[rgba(181,96,60,0.06)]'
            : bgFor(page)
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
          className='absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-[#faf8f4]/80 p-2 shadow backdrop-blur-sm transition hover:bg-[#faf8f4] disabled:opacity-0 dark:bg-[#1c1510]/80 dark:hover:bg-[#231a10]'
        >
          <HeroIcon iconName='ChevronLeftIcon' className='h-5 w-5 text-[#6b5744] dark:text-[#C4B5A0]' />
        </button>
        <button
          onClick={next}
          disabled={page === totalPages - 1}
          className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#faf8f4]/80 p-2 shadow backdrop-blur-sm transition hover:bg-[#faf8f4] disabled:opacity-0 dark:bg-[#1c1510]/80 dark:hover:bg-[#231a10]'
        >
          <HeroIcon iconName='ChevronRightIcon' className='h-5 w-5 text-[#6b5744] dark:text-[#C4B5A0]' />
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
                ? 'w-6 bg-[#C97D60]'
                : 'w-2 bg-[#e8d8c4] hover:bg-[#C9A96E]/30 dark:bg-[#2a1d10] dark:hover:bg-[#3d2e1e]'
            )}
          />
        ))}
      </div>

      {/* Page label */}
      <p className='pb-4 text-center text-xs text-[#9E8B76]'>
        {isCover ? 'Cover' : `Page ${page} of ${visible.length}`}
      </p>
    </div>
  );
}
