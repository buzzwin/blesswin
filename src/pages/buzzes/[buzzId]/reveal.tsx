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

    void revealBuzz(buzz.id);

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

      <div className='flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950'>
        {/* Top bar */}
        <header className='flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900'>
          <Link href='/'>
            <a className='text-lg font-bold text-emerald-500'>Buzzwin</a>
          </Link>
          {buzz && (
            <Link href={`/b/${buzz.shareToken}`}>
              <a className='text-sm text-gray-400 transition hover:text-emerald-500'>
                Add your page →
              </a>
            </Link>
          )}
        </header>

        <main className='flex flex-1 flex-col'>
          {/* Loading */}
          {loading && (
            <div className='flex flex-1 flex-col items-center justify-center gap-3 text-gray-400'>
              <HeroIcon iconName='ArrowPathIcon' className='h-8 w-8 animate-spin' />
              <span className='text-sm'>Opening Buzzbook…</span>
            </div>
          )}

          {/* Not found */}
          {!buzzLoading && !buzz && (
            <div className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
              <span className='text-5xl'>🤔</span>
              <p className='font-semibold text-gray-700 dark:text-gray-200'>
                Buzzbook not found
              </p>
              <Link href='/'>
                <a className='text-sm text-emerald-500 hover:text-emerald-600'>
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
                  <p className='font-semibold text-gray-700 dark:text-gray-200'>
                    No pages were added
                  </p>
                  <p className='text-sm text-gray-400'>
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
