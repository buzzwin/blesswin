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
      className='relative min-h-screen overflow-hidden text-[#F5EFE6]'
      style={
        {
          backgroundColor: '#110d07',
          '--glow-amber': '201 169 110',
          '--glow-rust': '181 96 60',
          '--glow-sage': '156 175 136'
        } as CSSProperties
      }
    >
      {/* Warm candlelit background glows */}
      <div className='pointer-events-none absolute inset-0'>
        {/* Primary amber glow — top center */}
        <div
          className='absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full blur-3xl animate-soft-float'
          style={{ background: 'radial-gradient(circle at center, rgba(201,169,110,0.22) 0%, transparent 65%)' }}
        />
        {/* Rust/terracotta glow — bottom right */}
        <div
          className='absolute -bottom-32 -right-16 h-[30rem] w-[30rem] rounded-full blur-3xl'
          style={{ background: 'radial-gradient(circle at center, rgba(181,96,60,0.18) 0%, transparent 65%)' }}
        />
        {/* Sage glow — left mid */}
        <div
          className='absolute top-1/3 -left-20 h-[28rem] w-[28rem] rounded-full blur-3xl'
          style={{ background: 'radial-gradient(circle at center, rgba(156,175,136,0.14) 0%, transparent 65%)' }}
        />
        {/* Dark overlay for depth */}
        <div className='absolute inset-0' style={{ background: 'linear-gradient(160deg, rgba(17,13,7,0.88) 0%, rgba(28,18,10,0.6) 50%, rgba(12,9,4,0.92) 100%)' }} />
        {/* Warm grid — very subtle */}
        <div
          className='absolute inset-0 opacity-30'
          style={{ backgroundImage: 'linear-gradient(90deg, rgba(201,169,110,0.07) 1px, transparent 1px), linear-gradient(180deg, rgba(201,169,110,0.05) 1px, transparent 1px)', backgroundSize: '52px 52px' }}
        />
      </div>

      <div className='relative mx-auto w-full max-w-7xl px-5 pb-20 pt-10 sm:px-8 lg:pb-28 lg:pt-16'>

        {/* ── Hero ── */}
        <div className='grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-start lg:gap-14'>

          {/* Left: copy */}
          <div className='space-y-6 text-center lg:text-left'>

            {/* Eyebrow badge */}
            <div
              className='inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] animate-fade-up'
              style={{ border: '1px solid rgba(201,169,110,0.28)', background: 'rgba(201,169,110,0.08)', color: '#C9A96E' }}
            >
              <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9A96E]' />
              Live community
              <span className='h-px w-3' style={{ background: 'rgba(201,169,110,0.4)' }} />
              New features
            </div>

            {/* Headline */}
            <h1
              className='font-display text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.5rem] animate-fade-up-delay-1'
              style={{ color: '#F5EFE6' }}
            >
              Find the next show{' '}
              <br className='hidden sm:block' />
              you&apos;ll actually{' '}
              <span
                className='bg-clip-text text-transparent'
                style={{ backgroundImage: 'linear-gradient(135deg, #E8B86D 0%, #D4A574 45%, #C97D60 100%)' }}
              >
                finish.
              </span>
            </h1>

            {/* Tagline */}
            <p className='mx-auto max-w-lg text-lg lg:mx-0 animate-fade-up-delay-2' style={{ color: 'rgba(245,239,230,0.65)' }}>
              Buzzwin turns your watch history into a personal radar — surfacing
              what friends love and what fits tonight.
            </p>

            {/* Hero CTAs — mobile/tablet only */}
            <div className='flex flex-wrap justify-center gap-3 lg:hidden animate-fade-up-delay-2'>
              <Link href='/login'>
                <a
                  className='inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px'
                  style={{
                    background: 'linear-gradient(135deg, #C97D60 0%, #B56540 100%)',
                    boxShadow: '0 2px 0 rgba(0,0,0,0.3), 0 4px 16px rgba(181,96,60,0.3)'
                  }}
                >
                  Join free →
                </a>
              </Link>
              <Link href='/buzzes/new'>
                <a
                  className='inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 hover:bg-[rgba(156,175,136,0.14)]'
                  style={{ border: '1px solid rgba(156,175,136,0.35)', color: '#b8cead' }}
                >
                  📖 Create a Buzzbook
                </a>
              </Link>
            </div>

            {/* Feature chips */}
            <div className='flex flex-wrap justify-center gap-2 text-xs lg:justify-start animate-fade-up-delay-2'>
              {[
                { icon: 'SparklesIcon' as const, label: 'Real-time picks', color: '#C9A96E' },
                { icon: 'BoltIcon' as const, label: 'One-tap logging', color: '#D4A574' },
                { icon: 'ChatBubbleOvalLeftEllipsisIcon' as const, label: 'Community pulse', color: '#9CAF88' }
              ].map(({ icon, label, color }) => (
                <span
                  key={label}
                  className='inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium'
                  style={{ border: `1px solid ${color}22`, background: `${color}0d`, color: `${color}` }}
                >
                  <HeroIcon iconName={icon} className='h-3.5 w-3.5' />
                  {label}
                </span>
              ))}
              <span
                className='inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium'
                style={{ border: '1px solid rgba(156,175,136,0.25)', background: 'rgba(156,175,136,0.08)', color: '#b8cead' }}
              >
                📖 Buzzbooks
              </span>
            </div>

            {/* Social proof */}
            {userCount > 0 && (
              <div className='flex items-center justify-center gap-3 lg:justify-start animate-fade-up-delay-2'>
                <div
                  className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl'
                  style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.2) 0%, rgba(181,96,60,0.15) 100%)', border: '1px solid rgba(201,169,110,0.2)' }}
                >
                  <HeroIcon iconName='UsersIcon' className='h-5 w-5 text-[#C9A96E]' />
                </div>
                <div className='text-left'>
                  <p className='text-lg font-bold' style={{ color: '#F5EFE6' }}>
                    {userCount.toLocaleString()}{' '}
                    <span style={{ color: '#C9A96E' }}>members</span>
                  </p>
                  <p className='text-sm' style={{ color: 'rgba(245,239,230,0.5)' }}>Watching together right now</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: login card */}
          <div className='animate-fade-up-delay-2'>
            <div
              className='relative overflow-hidden rounded-3xl'
              style={{
                border: '1px solid rgba(201,169,110,0.14)',
                background: 'rgba(255,240,215,0.03)',
                boxShadow: '0 0 0 1px rgba(201,169,110,0.06), 0 32px 80px rgba(0,0,0,0.65)',
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* Warm amber top accent */}
              <div className='h-px w-full' style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.55), transparent)' }} />
              <div className='p-7'>
                <JustLogin />
              </div>
            </div>

            {/* Buzzbook secondary link — desktop */}
            <div className='mt-4 hidden lg:block'>
              <Link href='/buzzes/new'>
                <a
                  className='flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-200 hover:bg-[rgba(156,175,136,0.1)]'
                  style={{ border: '1px solid rgba(156,175,136,0.22)', color: '#b8cead' }}
                >
                  📖 Celebrate someone with a Buzzbook
                  <HeroIcon iconName='ArrowRightIcon' className='h-4 w-4' />
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Buzzbook feature band ── */}
        <div className='mt-14 overflow-hidden rounded-3xl' style={{ border: '1px solid rgba(52,211,153,0.18)' }}>
          <div
            className='relative'
            style={{ background: 'linear-gradient(135deg, #061a0f 0%, #0a1f14 50%, #071510 100%)' }}
          >
            {/* Soft inner glow */}
            <div
              className='pointer-events-none absolute inset-0 rounded-3xl'
              style={{ background: 'radial-gradient(ellipse at top left, rgba(52,211,153,0.1) 0%, transparent 60%)' }}
            />

            <div className='relative flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:gap-8'>
              {/* Icon */}
              <div className='flex shrink-0 flex-col items-center gap-2'>
                <div
                  className='flex h-20 w-20 items-center justify-center rounded-3xl text-5xl'
                  style={{
                    background: 'rgba(52,211,153,0.08)',
                    border: '1px solid rgba(52,211,153,0.2)',
                    boxShadow: '0 0 32px rgba(52,211,153,0.15)'
                  }}
                >
                  📖
                </div>
                <span className='text-xs font-semibold uppercase tracking-wider' style={{ color: 'rgba(110,231,183,0.6)' }}>New</span>
              </div>

              {/* Copy */}
              <div className='flex-1'>
                <p className='mb-1 text-xs font-semibold uppercase tracking-[0.2em]' style={{ color: 'rgba(110,231,183,0.55)' }}>
                  Buzzbooks
                </p>
                <h2 className='font-display text-2xl font-bold sm:text-3xl' style={{ color: '#F5EFE6' }}>
                  Celebrate someone you love
                </h2>
                <p className='mt-2 max-w-md text-sm leading-relaxed' style={{ color: 'rgba(245,239,230,0.6)' }}>
                  Collect messages and photos from friends for birthdays, farewells,
                  and milestones — revealed together on the special day.
                </p>
                <div className='mt-4 flex flex-wrap gap-4 text-sm'>
                  {[
                    { icon: 'UserGroupIcon' as const, text: 'Friends sign digitally' },
                    { icon: 'LockClosedIcon' as const, text: 'Hidden until reveal' },
                    { icon: 'SparklesIcon' as const, text: 'No app to install' }
                  ].map(({ icon, text }) => (
                    <span key={text} className='flex items-center gap-1.5 text-emerald-300/70'>
                      <HeroIcon iconName={icon} className='h-4 w-4 text-emerald-300/80' />
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className='shrink-0'>
                <Link href='/buzzes/new'>
                  <a className='btn-pop px-6 py-3 text-sm'>
                    Start a Buzzbook →
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Feature bento grid ── */}
        <div className='mt-10 grid gap-4 sm:grid-cols-3'>

          {/* Wide: Track in Seconds */}
          <div
            className='group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 sm:col-span-2'
            style={{ border: '1px solid rgba(201,169,110,0.12)', background: 'rgba(201,169,110,0.04)' }}
          >
            <div
              className='pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100'
              style={{ background: 'radial-gradient(ellipse at bottom right, rgba(201,169,110,0.1) 0%, transparent 60%)' }}
            />
            <HeroIcon iconName='ClockIcon' className='mb-4 h-7 w-7 text-[#C9A96E]' />
            <h3 className='font-display text-lg font-bold' style={{ color: '#F5EFE6' }}>Track in Seconds</h3>
            <p className='mt-2 text-sm leading-relaxed' style={{ color: 'rgba(245,239,230,0.55)' }}>
              Log what you watch and build a clean, searchable history across TV and film.
              One tap to remember, forever.
            </p>
            <div className='mt-4 flex flex-wrap gap-2'>
              {['Breaking Bad', 'Shōgun', 'Severance'].map((s) => (
                <span
                  key={s}
                  className='rounded-lg px-2.5 py-1 text-xs'
                  style={{ border: '1px solid rgba(201,169,110,0.15)', background: 'rgba(201,169,110,0.07)', color: 'rgba(245,239,230,0.5)' }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Narrow: Signal Over Noise */}
          <div
            className='group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1'
            style={{ border: '1px solid rgba(212,165,116,0.12)', background: 'rgba(212,165,116,0.04)' }}
          >
            <div
              className='pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100'
              style={{ background: 'radial-gradient(ellipse at top left, rgba(212,165,116,0.12) 0%, transparent 60%)' }}
            />
            <HeroIcon iconName='ChartBarIcon' className='mb-4 h-7 w-7 text-[#D4A574]' />
            <h3 className='font-display text-lg font-bold' style={{ color: '#F5EFE6' }}>Signal Over Noise</h3>
            <p className='mt-2 text-sm leading-relaxed' style={{ color: 'rgba(245,239,230,0.55)' }}>
              See what people are actually finishing, not just scrolling past.
            </p>
          </div>

          {/* Full-width: Tuned To You */}
          <div
            className='group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 sm:col-span-3'
            style={{ border: '1px solid rgba(156,175,136,0.12)', background: 'rgba(156,175,136,0.04)' }}
          >
            <div
              className='pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100'
              style={{ background: 'radial-gradient(ellipse at center, rgba(156,175,136,0.1) 0%, transparent 60%)' }}
            />
            <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10'>
              <div>
                <HeroIcon iconName='SparklesIcon' className='mb-4 h-7 w-7 text-[#9CAF88]' />
                <h3 className='font-display text-lg font-bold' style={{ color: '#F5EFE6' }}>Tuned To You</h3>
                <p className='mt-2 max-w-lg text-sm leading-relaxed' style={{ color: 'rgba(245,239,230,0.55)' }}>
                  Get recommendations shaped by your watchlist and the people you actually trust — not
                  an algorithm trained on strangers.
                </p>
              </div>
              <div className='hidden shrink-0 flex-col gap-3 sm:flex'>
                {[
                  { label: 'Friends finished', pct: 78, color: '#9CAF88' },
                  { label: 'Your genre', pct: 62, color: '#C9A96E' },
                  { label: 'Episode length', pct: 45, color: '#D4A574' }
                ].map(({ label, pct, color }) => (
                  <div key={label} className='flex items-center gap-3'>
                    <div className='h-2 w-2 rounded-full' style={{ background: color }} />
                    <span className='w-32 text-xs' style={{ color: 'rgba(245,239,230,0.45)' }}>{label}</span>
                    <div className='h-1.5 w-28 overflow-hidden rounded-full' style={{ background: 'rgba(255,240,215,0.06)' }}>
                      <div
                        className='h-full rounded-full'
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Activity feed ── */}
        <div className='mt-14 space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p
                className='text-xs font-semibold uppercase tracking-[0.35em]'
                style={{ color: 'rgba(201,169,110,0.6)' }}
              >
                Live Activity
              </p>
              <h2 className='font-display text-2xl font-bold' style={{ color: '#F5EFE6' }}>
                What everyone is watching
              </h2>
            </div>
            <div
              className='hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:flex'
              style={{ border: '1px solid rgba(201,169,110,0.18)', background: 'rgba(201,169,110,0.07)', color: 'rgba(201,169,110,0.8)' }}
            >
              <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9A96E]' />
              Live now
            </div>
          </div>
          <div
            className='overflow-hidden rounded-3xl'
            style={{ border: '1px solid rgba(201,169,110,0.1)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
          >
            <ActivityFeed />
          </div>
        </div>

      </div>
    </div>
  );
}
