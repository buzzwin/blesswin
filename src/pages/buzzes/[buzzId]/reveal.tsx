import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import { useDocument } from '@lib/hooks/useDocument';
import { useSignatures } from '@lib/hooks/useSignatures';
import { useAuth } from '@lib/context/auth-context';
import { buzzesCollection } from '@lib/firebase/collections';
import {
  revealBuzz,
  setBuzzRevealTweetId,
  sendBuzzRevealTweet
} from '@lib/firebase/utils/buzz';
import { BuzzCountdown } from '@components/buzz/buzz-countdown';
import { BuzzbookReveal } from '@components/buzz/buzzbook-reveal';
import { HeroIcon } from '@components/ui/hero-icon';

export default function RevealPage(): JSX.Element {
  const router = useRouter();
  const { buzzId } = router.query;
  const { user } = useAuth();

  const buzzRef = doc(buzzesCollection, typeof buzzId === 'string' ? buzzId : '__none__');

  const { data: buzz, loading: buzzLoading } = useDocument(buzzRef, {
    allowNull: true,
    disabled: typeof buzzId !== 'string'
  });

  const [isPastReveal, setIsPastReveal] = useState(false);

  useEffect(() => {
    if (!buzz) return;
    setIsPastReveal(Date.now() >= buzz.revealAt.toMillis());
  }, [buzz]);

  const handleReveal = useCallback((): void => {
    setIsPastReveal(true);
  }, []);

  const { signatures, loading: sigsLoading } = useSignatures(
    typeof buzzId === 'string' ? buzzId : null,
    { disabled: !isPastReveal }
  );

  // Mark as revealed + write reveal tweet once (creator only, idempotent)
  useEffect(() => {
    if (!buzz || !isPastReveal) return;

    // Only the creator may flip the status (Firestore rules reject others).
    // Gating here avoids an unhandled promise rejection for every viewer.
    if (user && user.id === buzz.createdBy) {
      void revealBuzz(buzz.id).catch(() => {
        // Non-fatal: the reveal view still renders from the reveal time.
      });
    }

    if (buzz.revealTweetId === null && user && user.id === buzz.createdBy) {
      const tweetUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        photoURL: user.photoURL,
        verified: user.verified
      };
      void sendBuzzRevealTweet(buzz, tweetUser).then((tweetId) =>
        setBuzzRevealTweetId(buzz.id, tweetId)
      );
    }
  }, [buzz, isPastReveal, user]);

  const loading = buzzLoading || (isPastReveal && sigsLoading);

  return (
    <>
      <Head>
        <title>
          {buzz ? `${buzz.title} — Buzzbook` : 'Buzzwin Buzzbook'}
        </title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>

      <div className='flex min-h-screen flex-col bg-[#f5f1ea] dark:bg-[#110d07]'>
        {/* Festive glows behind everything */}
        <div className='pointer-events-none fixed inset-0 overflow-hidden'>
          <div className='absolute -right-10 -top-32 h-80 w-80 rounded-full opacity-30' style={{ background: 'var(--bw-glow-marigold)', filter: 'blur(60px)' }} />
          <div className='absolute -bottom-32 -left-10 h-80 w-80 rounded-full opacity-25' style={{ background: 'var(--bw-glow-magenta)', filter: 'blur(60px)' }} />
        </div>

        {/* Top bar */}
        <header className='bw-string-lights relative flex shrink-0 items-center justify-between border-b border-[rgba(255,179,0,0.2)] bg-[#faf8f4]/95 px-4 py-3 backdrop-blur-md dark:border-[rgba(255,179,0,0.12)] dark:bg-[#110d07]/95'>
          <Link href={buzz ? `/buzzes/${buzz.id}` : '/buzzes'}>
            <a className='flex items-center gap-1.5 text-sm font-medium text-[#6b5744] transition hover:text-[#C9A96E] dark:text-[#9E8B76] dark:hover:text-[#C9A96E]'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
              </svg>
              Manage
            </a>
          </Link>
          {buzz && (
            <span className='bw-eyebrow text-[10px]'>
              ✨ Buzzbook
            </span>
          )}
          {buzz && (
            <Link href={`/b/${buzz.shareToken}`}>
              <a className='text-sm text-[#C9A96E] transition hover:text-[#FFB300]'>
                Add your page →
              </a>
            </Link>
          )}
        </header>

        <main className='relative flex flex-1 flex-col'>
          {/* Loading */}
          {loading && (
            <div className='flex flex-1 flex-col items-center justify-center gap-3 text-[#9E8B76]'>
              <HeroIcon iconName='ArrowPathIcon' className='h-8 w-8 animate-spin' />
              <span className='text-sm'>Opening Buzzbook…</span>
            </div>
          )}

          {/* Not found */}
          {!buzzLoading && !buzz && (
            <div className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
              <span className='text-5xl'>🤔</span>
              <p className='font-semibold text-[#1a1108] dark:text-[#C4B5A0]'>
                Buzzbook not found
              </p>
              <Link href='/'>
                <a className='text-sm text-[#C9A96E] hover:text-[#E8B86D]'>
                  Go home
                </a>
              </Link>
            </div>
          )}

          {/* Countdown */}
          {!buzzLoading && buzz && !isPastReveal && (
            <div className='flex flex-1 flex-col items-center justify-center px-4'>
              <BuzzCountdown
                revealAt={buzz.revealAt}
                recipientName={buzz.recipientName}
                onReveal={handleReveal}
              />
            </div>
          )}

          {/* Buzzbook */}
          {!loading && buzz && isPastReveal && signatures && (
            <div className='mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-4'>
              {signatures.length === 0 ? (
                <div className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
                  <span className='text-5xl'>📭</span>
                  <p className='font-semibold text-[#1a1108] dark:text-[#C4B5A0]'>
                    No pages were added
                  </p>
                  <p className='text-sm text-[#9E8B76]'>
                    The Buzzbook is empty — looks like no one signed in time.
                  </p>
                </div>
              ) : (
                <BuzzbookReveal buzz={buzz} signatures={signatures} />
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
