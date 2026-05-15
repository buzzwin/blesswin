import cn from 'clsx';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { useAuth } from '@lib/context/auth-context';
import { db } from '@lib/firebase/app';
import ActivityFeed from '@components/activity/activity';
import { HeroIcon } from '@components/ui/hero-icon';
import JustLogin from './justlogin';

export function LoginMain(): JSX.Element {
  const [userCount, setUserCount] = useState<number>(0);
  const featureHighlights = [
    {
      title: 'Track in Seconds',
      description:
        'Log what you watch and keep a clean, searchable history across TV and film.'
    },
    {
      title: 'Signal Over Noise',
      description:
        'See what people are actually finishing, not just scrolling past.'
    },
    {
      title: 'Tuned To You',
      description:
        'Get recommendations shaped by your watchlist and the people you trust.'
    },
    {
      title: '📖 Buzzbooks',
      description:
        'Collect messages and photos from friends for birthdays and celebrations — revealed together on the day.'
    }
  ];

  useEffect(() => {
    const getUserCount = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getCountFromServer(usersRef);
        setUserCount(snapshot.data().count);
      } catch (error) {
        // console.error('Error getting user count:', error);
      }
    };

    // Call the async function
    void getUserCount();
  }, []);

  return (
    <div
      className='relative min-h-screen overflow-hidden bg-[#0b0e14] text-white'
      style={
        {
          '--login-aurora': '56 189 248',
          '--login-ember': '244 114 182',
          '--login-lime': '52 211 153'
        } as CSSProperties
      }
    >
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--login-aurora),0.35),transparent_60%)] blur-3xl animate-soft-float'></div>
        <div className='absolute bottom-[-20%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--login-ember),0.3),transparent_60%)] blur-3xl'></div>
        <div className='absolute top-[15%] left-[-10%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--login-lime),0.25),transparent_60%)] blur-3xl'></div>
        <div className='absolute inset-0 bg-[linear-gradient(120deg,rgba(9,10,16,0.95),rgba(15,23,42,0.7),rgba(2,6,23,0.9))]'></div>
        <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40'></div>
      </div>

      <div className='relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-16 pt-12 lg:pb-24 lg:pt-20'>
        <div className='grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]'>
          <div className='space-y-6'>
            <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/90 shadow-[0_0_25px_rgba(52,211,153,0.18)] animate-fade-up'>
              New this season
              <span className='h-1 w-1 rounded-full bg-emerald-300'></span>
              Live community
            </div>
            <h1 className='font-twitter-chirp-extended text-4xl leading-tight md:text-5xl lg:text-6xl animate-fade-up-delay-1'>
              Find the next show you will actually finish.
            </h1>
            <p className='max-w-xl text-lg text-slate-200/80 md:text-xl animate-fade-up-delay-2'>
              Buzzwin turns your watch history into a personal radar, surfacing
              what is trending, what friends love, and what fits tonight.
            </p>
            <div className='flex flex-wrap items-center gap-4 text-sm text-slate-300/80'>
              <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
                <HeroIcon iconName='SparklesIcon' className='h-4 w-4' />
                Real-time picks
              </span>
              <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
                <HeroIcon iconName='BoltIcon' className='h-4 w-4' />
                One-tap logging
              </span>
              <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
                <HeroIcon iconName='ChatBubbleOvalLeftEllipsisIcon' className='h-4 w-4' />
                Community pulse
              </span>
              <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
                📖 Buzzbooks
              </span>
            </div>
            {userCount > 0 && (
              <div className='flex items-center gap-3 text-emerald-200/90'>
                <span className='inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20'>
                  <HeroIcon iconName='UsersIcon' className='h-5 w-5' />
                </span>
                <div>
                  <p className='text-lg font-semibold'>
                    {userCount.toLocaleString()} members
                  </p>
                  <p className='text-sm text-slate-300/80'>
                    Watching together right now
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className='space-y-6'>
            <div
              className={cn(
                'rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.6)]',
                'backdrop-blur-xl'
              )}
            >
              <JustLogin />
            </div>
            <div className='grid gap-4 sm:grid-cols-3 lg:grid-cols-1'>
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200/80 backdrop-blur'
                >
                  <p className='text-base font-semibold text-white'>
                    {feature.title}
                  </p>
                  <p className='mt-2'>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='grid gap-8 lg:grid-cols-[1.2fr,0.8fr]'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm uppercase tracking-[0.35em] text-slate-300/70'>
                  Trending Now
                </p>
                <h2 className='text-2xl font-semibold text-white'>
                  The most watched this week
                </h2>
              </div>
              <div className='hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80 md:flex'>
                <span className='h-2 w-2 rounded-full bg-emerald-400'></span>
                Updated live
              </div>
            </div>
            <div className='rounded-3xl border border-white/10 bg-white/5 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.55)] backdrop-blur'>
              <ActivityFeed />
            </div>
          </div>

          <div className='space-y-4'>
            <p className='text-sm uppercase tracking-[0.35em] text-slate-300/70'>
              Why Buzzwin
            </p>
            <div className='space-y-4'>
              {featureHighlights.map((feature, index) => (
                <div
                  key={`${feature.title}-${index}`}
                  className='rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-200/80 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/40 hover:text-white'
                >
                  <h3 className='text-lg font-semibold text-white'>
                    {feature.title}
                  </h3>
                  <p className='mt-2 text-sm'>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm uppercase tracking-[0.35em] text-slate-300/70'>
                Live Activity
              </p>
              <h2 className='text-2xl font-semibold text-white'>
                Watch what everyone is watching
              </h2>
            </div>
            <div className='hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80 md:flex'>
              <span className='h-2 w-2 animate-pulse rounded-full bg-emerald-400'></span>
              Streaming now
            </div>
          </div>
          <div className='overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_80px_rgba(15,23,42,0.6)]'>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
