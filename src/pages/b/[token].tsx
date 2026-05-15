import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { auth } from '@lib/firebase/app';
import { useBuzz } from '@lib/hooks/useBuzz';
import { SignBuzzForm } from '@components/buzz/sign-buzz-form';
import { HeroIcon } from '@components/ui/hero-icon';

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂',
  diwali: '🪔',
  christmas: '🎄',
  eid: '🌙',
  anniversary: '💍',
  custom: '✨'
};

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

      <div className='min-h-screen bg-gray-50 dark:bg-gray-950'>
        {/* Minimal top bar */}
        <header className='flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900'>
          <Link href='/'>
            <a className='text-lg font-bold text-emerald-500'>Buzzwin</a>
          </Link>
          <Link href='/buzzes/new'>
            <a className='text-sm text-gray-400 transition hover:text-emerald-500'>
              Start your own Buzz →
            </a>
          </Link>
        </header>

        {/* Hero banner */}
        {!loading && buzz && (
          <div className='bg-gradient-to-b from-emerald-600 to-emerald-700 px-4 py-10 text-center text-white'>
            <span className='text-5xl'>{emoji}</span>
            <h1 className='mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl'>
              {buzz.recipientName}&apos;s Buzzbook
            </h1>
            <p className='mt-2 text-emerald-100'>
              {buzz.totalSignatures}{' '}
              {buzz.totalSignatures === 1 ? 'page' : 'pages'} added · Reveals{' '}
              {revealDate}
            </p>
          </div>
        )}

        <main className='mx-auto max-w-md px-4 py-6'>
          {/* ── Loading ── */}
          {loading && (
            <div className='flex flex-col items-center gap-3 py-24 text-gray-400'>
              <HeroIcon iconName='ArrowPathIcon' className='h-8 w-8 animate-spin' />
              <span className='text-sm'>Loading Buzz…</span>
            </div>
          )}

          {/* ── Not found ── */}
          {!loading && notFound && (
            <div className='flex flex-col items-center gap-4 py-24 text-center'>
              <span className='text-5xl'>🤔</span>
              <div>
                <p className='font-semibold text-gray-700 dark:text-gray-200'>
                  This Buzz doesn&apos;t exist
                </p>
                <p className='mt-1 text-sm text-gray-400'>
                  The link might be wrong or the Buzz was deleted.
                </p>
              </div>
              <Link href='/'>
                <a className='text-sm font-medium text-emerald-500 hover:text-emerald-600'>
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
                <div className='rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-6 text-center dark:border-emerald-600 dark:bg-emerald-900/20'>
                  <span className='text-3xl'>📖</span>
                  <p className='mt-2 font-display font-bold text-emerald-700 dark:text-emerald-400'>
                    The Buzzbook is open!
                  </p>
                  <Link href={`/buzzes/${buzz.id}/reveal`}>
                    <a className='mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600'>
                      Open the Buzzbook
                      <HeroIcon iconName='ArrowRightIcon' className='h-4 w-4' />
                    </a>
                  </Link>
                </div>
              )}

              {/* ── Already signed ── */}
              {!isRevealed && !isPastReveal && alreadySigned && (
                <div className='rounded-2xl border-2 border-blue-300 bg-blue-50 p-6 text-center dark:border-blue-700 dark:bg-blue-900/20'>
                  <span className='text-3xl'>✅</span>
                  <p className='mt-2 font-display font-bold text-blue-700 dark:text-blue-400'>
                    You&apos;ve already added your page!
                  </p>
                  <p className='mt-1 text-sm text-blue-600 dark:text-blue-300'>
                    Know someone else who should add theirs?
                  </p>
                  <button
                    onClick={() => void navigator.clipboard.writeText(shareUrl)}
                    className='mt-3 inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  >
                    <HeroIcon iconName='LinkIcon' className='h-3.5 w-3.5' />
                    Copy link to share
                  </button>
                </div>
              )}

              {/* ── Sign form ── */}
              {!isRevealed && !isPastReveal && !alreadySigned && (
                <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
                  <h2 className='mb-5 font-display text-lg font-bold text-gray-900 dark:text-white'>
                    Add your page to {buzz.recipientName}&apos;s Buzzbook
                  </h2>
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
