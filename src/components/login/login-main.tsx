import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import ActivityFeed from '@components/activity/activity';
import { HeroIcon } from '@components/ui/hero-icon';
import JustLogin from './justlogin';

export function LoginMain(): JSX.Element {
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    const getUserCount = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getCountFromServer(usersRef);
        setUserCount(snapshot.data().count);
      } catch {
        // silent
      }
    };
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
      {/* Background glows */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--login-aurora),0.35),transparent_60%)] blur-3xl animate-soft-float' />
        <div className='absolute bottom-[-20%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--login-ember),0.3),transparent_60%)] blur-3xl' />
        <div className='absolute top-[15%] left-[-10%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--login-lime),0.25),transparent_60%)] blur-3xl' />
        <div className='absolute inset-0 bg-[linear-gradient(120deg,rgba(9,10,16,0.95),rgba(15,23,42,0.7),rgba(2,6,23,0.9))]' />
        <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40' />
      </div>

      <div className='relative mx-auto w-full max-w-7xl px-5 pb-20 pt-10 sm:px-8 lg:pb-28 lg:pt-16'>

        {/* ── Hero + Login ── */}
        <div className='grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-start'>

          {/* Left: headline copy */}
          <div className='space-y-5 text-center lg:text-left'>
            <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/90 shadow-[0_0_25px_rgba(52,211,153,0.18)] animate-fade-up'>
              New this season
              <span className='h-1 w-1 rounded-full bg-emerald-300' />
              Live community
            </div>

            <h1 className='font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl animate-fade-up-delay-1'>
              Find the next show you&apos;ll actually{' '}
              <span className='text-emerald-400'>finish.</span>
            </h1>

            <p className='mx-auto max-w-lg text-lg text-slate-300/80 sm:text-xl lg:mx-0 animate-fade-up-delay-2'>
              Buzzwin turns your watch history into a personal radar — surfacing
              what friends love and what fits tonight.
            </p>

            {/* Feature pills */}
            <div className='flex flex-wrap justify-center gap-2 text-sm text-slate-300/80 lg:justify-start animate-fade-up-delay-2'>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
                <HeroIcon iconName='SparklesIcon' className='h-4 w-4' />
                Real-time picks
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
                <HeroIcon iconName='BoltIcon' className='h-4 w-4' />
                One-tap logging
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
                <HeroIcon iconName='ChatBubbleOvalLeftEllipsisIcon' className='h-4 w-4' />
                Community pulse
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
                📖 Buzzbook
              </span>
            </div>

            {/* Social proof */}
            {userCount > 0 && (
              <div className='flex items-center justify-center gap-3 text-emerald-200/90 lg:justify-start'>
                <span className='inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20'>
                  <HeroIcon iconName='UsersIcon' className='h-5 w-5' />
                </span>
                <div className='text-left'>
                  <p className='text-lg font-semibold'>
                    {userCount.toLocaleString()} members
                  </p>
                  <p className='text-sm text-slate-300/80'>Watching together right now</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: login card */}
          <div className='space-y-4'>
            <div className='rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_30px_80px_rgba(15,23,42,0.6)] backdrop-blur-xl'>
              <JustLogin />
            </div>
          </div>
        </div>

        {/* ── Buzzbook callout ── */}
        <div className='mt-10 overflow-hidden rounded-3xl border border-emerald-500/30 bg-emerald-950/30 backdrop-blur-sm'>
          <div className='flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6'>
            <span className='text-5xl'>📖</span>
            <div className='flex-1'>
              <h2 className='font-display text-2xl font-bold text-white'>
                Celebrate someone with a Buzzbook
              </h2>
              <p className='mt-1 text-slate-300/80'>
                Collect messages and photos from friends for birthdays and
                celebrations — revealed together on the day.
              </p>
            </div>
            <Link href='/buzzes/new'>
              <a className='btn-pop shrink-0 px-5 py-3 text-sm'>
                Start a Buzzbook →
              </a>
            </Link>
          </div>
        </div>

        {/* ── Why Buzzwin features ── */}
        <div className='mt-10 grid gap-4 sm:grid-cols-3'>
          {[
            {
              title: 'Track in Seconds',
              description: 'Log what you watch and keep a clean, searchable history across TV and film.',
              icon: 'ClockIcon' as const
            },
            {
              title: 'Signal Over Noise',
              description: 'See what people are actually finishing, not just scrolling past.',
              icon: 'ChartBarIcon' as const
            },
            {
              title: 'Tuned To You',
              description: 'Get recommendations shaped by your watchlist and the people you trust.',
              icon: 'SparklesIcon' as const
            }
          ].map((f) => (
            <div
              key={f.title}
              className='rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40'
            >
              <HeroIcon iconName={f.icon} className='mb-3 h-6 w-6 text-emerald-400' />
              <h3 className='font-display text-base font-bold text-white'>{f.title}</h3>
              <p className='mt-1.5 text-sm text-slate-300/80'>{f.description}</p>
            </div>
          ))}
        </div>

        {/* ── Activity feed ── */}
        <div className='mt-12 space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.35em] text-slate-400'>
                Live Activity
              </p>
              <h2 className='font-display text-2xl font-bold text-white'>
                What everyone is watching right now
              </h2>
            </div>
            <div className='hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80 sm:flex'>
              <span className='h-2 w-2 animate-pulse rounded-full bg-emerald-400' />
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
