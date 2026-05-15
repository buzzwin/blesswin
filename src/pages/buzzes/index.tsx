import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { getUserBuzzes } from '@lib/firebase/utils/buzz';
import type { Buzz } from '@lib/types/buzz';
import type { ReactElement, ReactNode } from 'react';

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂',
  diwali: '🪔',
  christmas: '🎄',
  eid: '🌙',
  anniversary: '💍',
  custom: '✨',
};

function statusBadge(buzz: Buzz): { label: string; className: string } {
  if (buzz.status === 'revealed') {
    return {
      label: 'Revealed',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
  }
  const now = Date.now();
  const revealMs = buzz.revealAt.toMillis();
  if (now >= revealMs) {
    return {
      label: 'Ready to open',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
  }
  return {
    label: 'Collecting',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
}

function BuzzCard({ buzz }: { buzz: Buzz }): JSX.Element {
  const badge = statusBadge(buzz);
  const emoji = OCCASION_EMOJI[buzz.occasion] ?? '✨';
  const revealDate = buzz.revealAt.toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  function copyLink(e: React.MouseEvent): void {
    e.preventDefault();
    const url = `${window.location.origin}/b/${buzz.shareToken}`;
    void navigator.clipboard.writeText(url);
  }

  return (
    <Link href={`/buzzes/${buzz.id}`}>
      <a className='block rounded-2xl border border-gray-100 bg-white p-5 transition hover:border-emerald-200 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-800'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <span className='text-2xl'>{emoji}</span>
            <div>
              <p className='font-semibold text-gray-900 dark:text-white line-clamp-1'>
                {buzz.title}
              </p>
              <p className='text-sm text-gray-500'>
                {buzz.boardMode === 'group' ? '👥 ' : ''}
                {buzz.recipientName} · reveals {revealDate}
              </p>
            </div>
          </div>
          <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', badge.className)}>
            {badge.label}
          </span>
        </div>

        <div className='mt-4 flex items-center justify-between'>
          <span className='text-sm text-gray-400'>
            {buzz.totalSignatures} {buzz.totalSignatures === 1 ? 'page' : 'pages'} added
          </span>
          <button
            onClick={copyLink}
            className='flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
          >
            <HeroIcon iconName='LinkIcon' className='h-3.5 w-3.5' />
            Copy link
          </button>
        </div>
      </a>
    </Link>
  );
}

export default function MyBuzzes(): JSX.Element {
  const { user } = useAuth();
  const [buzzes, setBuzzes] = useState<Buzz[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    void getUserBuzzes(user.id)
      .then(setBuzzes)
      .catch(() => setBuzzes([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <section>
      <SEO title='My Buzzes / Buzzwin' />
      <MainHeader>
        <div className='flex w-full items-center justify-between px-4'>
          <h2 className='text-xl font-bold'>My Buzzes</h2>
          <Link href='/buzzes/new'>
            <a>
              <Button className='flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600'>
                <HeroIcon iconName='PlusIcon' className='h-4 w-4' />
                Start a Buzz
              </Button>
            </a>
          </Link>
        </div>
      </MainHeader>

      <div className='space-y-3 px-4 py-4'>
        {loading && (
          <div className='py-16 text-center text-gray-400'>Loading…</div>
        )}

        {!loading && buzzes?.length === 0 && (
          <div className='flex flex-col items-center gap-4 py-20 text-center'>
            <span className='text-5xl'>📖</span>
            <div>
              <p className='font-semibold text-gray-700 dark:text-gray-200'>No Buzzes yet</p>
              <p className='mt-1 text-sm text-gray-400'>
                Start one and share the link — friends add their pages, you reveal the Buzzbook.
              </p>
            </div>
            <Link href='/buzzes/new'>
              <a>
                <Button className='flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-white hover:bg-emerald-600'>
                  <HeroIcon iconName='SparklesIcon' className='h-4 w-4' />
                  Start your first Buzz
                </Button>
              </a>
            </Link>
          </div>
        )}

        {!loading && buzzes && buzzes.length > 0 &&
          buzzes.map((buzz) => <BuzzCard key={buzz.id} buzz={buzz} />)
        }
      </div>
    </section>
  );
}

MyBuzzes.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <HomeLayout>{page}</HomeLayout>
  </ProtectedLayout>
);
