import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { auth } from '@lib/firebase/app';
import { useBuzz } from '@lib/hooks/useBuzz';
import { SignBuzzForm } from '@components/buzz/sign-buzz-form';
import { HeroIcon } from '@components/ui/hero-icon';

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂', anniversary: '💍', graduation: '🎓', trip: '✈️',
  movie: '🎬', series: '📺', gamenight: '🎮', bookclub: '📚',
  diwali: '🪔', christmas: '🎄', eid: '🌙', custom: '✨'
};

const GROUP_OCCASIONS = new Set(['trip', 'movie', 'series', 'gamenight', 'bookclub']);

function buzzHeading(buzz: { occasion: string; recipientName: string }): string {
  return GROUP_OCCASIONS.has(buzz.occasion)
    ? `${buzz.recipientName} Buzzbook`
    : `${buzz.recipientName}'s Buzzbook`;
}

export default function SignBuzzPage(): JSX.Element {
  const router = useRouter();
  const token = typeof router.query.token === 'string' ? router.query.token : null;
  const { buzz, loading, notFound } = useBuzz(token);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/b/${token ?? ''}`
    : '';

  const alreadySigned =
    !!auth.currentUser?.uid && !!buzz?.signedBy.includes(auth.currentUser.uid);

  const isRevealed = buzz?.status === 'revealed';
  const isPastReveal = buzz ? Date.now() >= buzz.revealAt.toMillis() : false;

  const emoji = buzz ? (OCCASION_EMOJI[buzz.occasion] ?? '✨') : '📖';
  const revealDate = buzz?.revealAt.toDate().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <>
      <Head>
        <title>
          {buzz
            ? `Add your page to ${buzz.recipientName}'s Buzz`
            : 'Buzzwin — Group Buzzbooks'}
        </title>
        <meta
          name='description'
          content={
            buzz
              ? `${buzz.title} · ${buzz.totalSignatures} pages added so far. Reveal: ${revealDate}`
              : 'Add your page to a Buzzbook'
          }
        />
        <meta property='og:title' content={buzz ? buzz.title : 'Buzzwin'} />
        <meta
          property='og:description'
          content={
            buzz
              ? `${buzz.totalSignatures} pages added · Reveals ${revealDate}`
              : 'Add your page to a Buzzbook'
          }
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>

      <div className='min-h-screen bg-[#f5f1ea] dark:bg-[#110d07]'>
        {/* Minimal top bar */}
        <header className='flex items-center justify-between border-b border-[#e8d8c4] bg-[#faf8f4] px-4 py-3 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
          <Link href='/'>
            <a className='font-display text-lg font-bold text-[#1a1108] dark:text-[#F5EFE6]'>Buzzwin</a>
          </Link>
          <Link href='/buzzes/new'>
            <a className='text-sm text-[#6b5744] transition hover:text-[#C9A96E] dark:text-[#9E8B76] dark:hover:text-[#C9A96E]'>
              Start your own Buzz →
            </a>
          </Link>
        </header>

        {/* Hero banner */}
        {!loading && buzz && (
          <div className='px-4 py-10 text-center' style={{ background: 'linear-gradient(135deg, #C97D60 0%, #B56540 60%, #8a4020 100%)' }}>
            <span className='text-5xl'>{emoji}</span>
            <h1 className='mt-3 font-display text-3xl font-extrabold leading-tight text-[#F5EFE6] sm:text-4xl'>
              {buzzHeading(buzz)}
            </h1>
            <p className='mt-2 text-[rgba(245,239,230,0.75)]'>
              {buzz.totalSignatures}{' '}
              {buzz.totalSignatures === 1 ? 'page' : 'pages'} added ·{' '}
              {GROUP_OCCASIONS.has(buzz.occasion) ? 'Opens' : 'Reveals'}{' '}
              {revealDate}
            </p>
          </div>
        )}

        <main className='mx-auto max-w-md px-4 py-6'>
          {/* ── Loading ── */}
          {loading && (
            <div className='flex flex-col items-center gap-3 py-24 text-[#9E8B76]'>
              <HeroIcon iconName='ArrowPathIcon' className='h-8 w-8 animate-spin' />
              <span className='text-sm'>Loading Buzz…</span>
            </div>
          )}

          {/* ── Not found ── */}
          {!loading && notFound && (
            <div className='flex flex-col items-center gap-4 py-24 text-center'>
              <span className='text-5xl'>🤔</span>
              <div>
                <p className='font-semibold text-[#1a1108] dark:text-[#F5EFE6]'>
                  This Buzz doesn&apos;t exist
                </p>
                <p className='mt-1 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                  The link might be wrong or the Buzz was deleted.
                </p>
              </div>
              <Link href='/'>
                <a className='text-sm font-medium text-[#C9A96E] hover:text-[#E8B86D]'>
                  Go to Buzzwin
                </a>
              </Link>
            </div>
          )}

          {/* ── Buzz found ── */}
          {!loading && buzz && (
            <div className='space-y-4'>
              {/* ── Already revealed ── */}
              {(isRevealed || isPastReveal) && (
                <div className='rounded-2xl border-2 border-[rgba(201,169,110,0.4)] bg-[rgba(201,169,110,0.06)] p-6 text-center dark:border-[rgba(201,169,110,0.3)] dark:bg-[rgba(201,169,110,0.08)]'>
                  <span className='text-3xl'>📖</span>
                  <p className='mt-2 font-display font-bold text-[#8a6520] dark:text-[#C9A96E]'>
                    The Buzzbook is open!
                  </p>
                  <Link href={`/buzzes/${buzz.id}/reveal`}>
                    <a className='mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#C97D60] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B56540]'>
                      Open the Buzzbook
                      <HeroIcon iconName='ArrowRightIcon' className='h-4 w-4' />
                    </a>
                  </Link>
                </div>
              )}

              {/* ── Already signed ── */}
              {!isRevealed && !isPastReveal && alreadySigned && (
                <div className='rounded-2xl border-2 border-[rgba(156,175,136,0.4)] bg-[rgba(156,175,136,0.06)] p-6 text-center dark:border-[rgba(156,175,136,0.3)] dark:bg-[rgba(156,175,136,0.08)]'>
                  <span className='text-3xl'>{OCCASION_EMOJI[buzz.occasion] ?? '✅'}</span>
                  <p className='mt-2 font-display font-bold text-[#5a7a48] dark:text-[#9CAF88]'>
                    {GROUP_OCCASIONS.has(buzz.occasion)
                      ? 'Your page is in!'
                      : "You've already added your page!"}
                  </p>
                  <p className='mt-1 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                    {GROUP_OCCASIONS.has(buzz.occasion)
                      ? 'Share the link so others can add their page too.'
                      : 'Know someone else who should add theirs?'}
                  </p>
                  <button
                    onClick={() => void navigator.clipboard.writeText(shareUrl)}
                    className='mt-3 inline-flex items-center gap-1.5 rounded-xl border border-[rgba(156,175,136,0.3)] bg-[#faf8f4] px-4 py-2 text-sm font-medium text-[#5a7a48] transition hover:bg-[rgba(156,175,136,0.1)] dark:border-[rgba(156,175,136,0.2)] dark:bg-[#1c1510] dark:text-[#9CAF88]'
                  >
                    <HeroIcon iconName='LinkIcon' className='h-3.5 w-3.5' />
                    Copy link to share
                  </button>
                </div>
              )}

              {/* ── Sign form ── */}
              {!isRevealed && !isPastReveal && !alreadySigned && (
                <div className='rounded-2xl border border-[#e8d8c4] bg-[#faf8f4] p-6 shadow-sm dark:border-[#2a1d10] dark:bg-[#1c1510]'>
                  <h2 className='mb-1 font-display text-lg font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
                    {GROUP_OCCASIONS.has(buzz.occasion)
                      ? `Add your page to the ${buzz.recipientName} Buzzbook`
                      : `Add your page to ${buzz.recipientName}'s Buzzbook`}
                  </h2>
                  {GROUP_OCCASIONS.has(buzz.occasion) && (
                    <p className='mb-4 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                      Write a message or upload a photo. Everyone&apos;s pages are revealed together.
                    </p>
                  )}
                  <SignBuzzForm buzz={buzz} shareUrl={shareUrl} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
