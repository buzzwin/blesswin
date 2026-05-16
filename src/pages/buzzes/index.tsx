import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
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
  custom: '✨'
};

function statusBadge(buzz: Buzz): { label: string; className: string } {
  if (buzz.status === 'revealed') {
    return {
      label: 'Revealed',
      className: 'bg-[rgba(156,175,136,0.15)] text-[#5a7a48] dark:bg-[rgba(156,175,136,0.12)] dark:text-[#9CAF88]'
    };
  }
  const now = Date.now();
  const revealMs = buzz.revealAt.toMillis();
  if (now >= revealMs) {
    return {
      label: 'Ready to open',
      className: 'bg-[rgba(201,169,110,0.15)] text-[#8a6520] dark:bg-[rgba(201,169,110,0.12)] dark:text-[#C9A96E]'
    };
  }
  return {
    label: 'Collecting',
    className: 'bg-[rgba(181,96,60,0.12)] text-[#9a4422] dark:bg-[rgba(181,96,60,0.1)] dark:text-[#D4845A]'
  };
}

function BuzzCard({ buzz }: { buzz: Buzz }): JSX.Element {
  const badge = statusBadge(buzz);
  const emoji = OCCASION_EMOJI[buzz.occasion] ?? '✨';
  const revealDate = buzz.revealAt.toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  function copyLink(e: React.MouseEvent): void {
    e.preventDefault();
    const url = `${window.location.origin}/b/${buzz.shareToken}`;
    void navigator.clipboard.writeText(url);
  }

  return (
    <Link href={`/buzzes/${buzz.id}`}>
      <a className='block rounded-2xl border border-[#e8d8c4] bg-[#faf8f4] p-5 shadow-sm transition hover:border-[#C9A96E] hover:shadow-[0_4px_20px_rgba(201,169,110,0.15)] dark:border-[#2a1d10] dark:bg-[#1c1510] dark:hover:border-[rgba(201,169,110,0.4)]'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <span className='text-2xl'>{emoji}</span>
            <div>
              <p className='font-display font-bold text-light-primary dark:text-dark-primary line-clamp-1'>
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
          <span className='text-sm text-[#6b5744] dark:text-[#9E8B76]'>
            {buzz.totalSignatures} {buzz.totalSignatures === 1 ? 'page' : 'pages'} added
          </span>
          <button
            onClick={copyLink}
            className='flex items-center gap-1 text-sm font-medium text-[#C9A96E] hover:text-[#E8B86D]'
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
          <h2 className='font-display text-xl font-bold'>My Buzzes</h2>
          <Link href='/buzzes/new'>
            <a className='btn-pop px-4 py-2 text-sm'>
              <HeroIcon iconName='PlusIcon' className='mr-1.5 h-4 w-4' />
              Start a Buzz
            </a>
          </Link>
        </div>
      </MainHeader>

      <div className='space-y-3 px-4 py-4'>
        {loading && (
          <div className='py-16 text-center text-[#9E8B76]'>Loading…</div>
        )}

        {!loading && buzzes?.length === 0 && (
          <div className='flex flex-col items-center gap-4 py-20 text-center'>
            <span className='text-5xl'>📖</span>
            <div>
              <p className='font-display font-bold text-light-primary dark:text-dark-primary'>No Buzzes yet</p>
              <p className='mt-1 text-sm text-[#9E8B76]'>
                Start one and share the link — friends add their pages, you reveal the Buzzbook.
              </p>
            </div>
            <Link href='/buzzes/new'>
              <a className='btn-pop px-5 py-2.5 text-sm'>
                <HeroIcon iconName='SparklesIcon' className='mr-1.5 h-4 w-4' />
                Start your first Buzz
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
