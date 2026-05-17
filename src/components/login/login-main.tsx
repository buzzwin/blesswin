import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { HeroIcon } from '@components/ui/hero-icon';
import { OpenBookHero } from '@components/ui/illustrations';
import JustLogin from './justlogin';

const OCCASIONS = [
  { emoji: '🎬', label: 'Movie Night' },
  { emoji: '✈️', label: 'Group Trip' },
  { emoji: '🎂', label: 'Birthday' },
  { emoji: '🎮', label: 'Game Night' },
  { emoji: '📚', label: 'Book Club' },
  { emoji: '📺', label: 'TV Series' },
  { emoji: '💍', label: 'Anniversary' },
  { emoji: '✨', label: 'Custom' }
];

export function LoginMain(): JSX.Element {
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    const getUserCount = async () => {
      try {
        const snapshot = await getCountFromServer(collection(db, 'users'));
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
      style={{ backgroundColor: '#110d07' } as CSSProperties}
    >
      {/* Warm background glows */}
      <div className='pointer-events-none absolute inset-0'>
        <div
          className='absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full blur-3xl'
          style={{ background: 'radial-gradient(circle at center, rgba(201,169,110,0.22) 0%, transparent 65%)' }}
        />
        <div
          className='absolute -bottom-32 -right-16 h-[30rem] w-[30rem] rounded-full blur-3xl'
          style={{ background: 'radial-gradient(circle at center, rgba(181,96,60,0.18) 0%, transparent 65%)' }}
        />
        <div
          className='absolute top-1/3 -left-20 h-[28rem] w-[28rem] rounded-full blur-3xl'
          style={{ background: 'radial-gradient(circle at center, rgba(156,175,136,0.14) 0%, transparent 65%)' }}
        />
        <div
          className='absolute inset-0'
          style={{ background: 'linear-gradient(160deg, rgba(17,13,7,0.88) 0%, rgba(28,18,10,0.6) 50%, rgba(12,9,4,0.92) 100%)' }}
        />
        <div
          className='absolute inset-0 opacity-25'
          style={{
            backgroundImage: 'linear-gradient(90deg, rgba(201,169,110,0.07) 1px, transparent 1px), linear-gradient(180deg, rgba(201,169,110,0.05) 1px, transparent 1px)',
            backgroundSize: '52px 52px'
          }}
        />
      </div>

      {/* Nav */}
      <nav className='relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8'>
        <Link href='/'>
          <a className='font-display text-xl font-extrabold tracking-tight' style={{ color: '#F5EFE6' }}>
            Buzzwin
          </a>
        </Link>
      </nav>

      <div className='relative mx-auto w-full max-w-7xl px-5 pb-20 pt-6 sm:px-8 lg:pb-28 lg:pt-10'>
        <div className='grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-start lg:gap-14'>

          {/* Left: copy */}
          <div className='space-y-7 text-center lg:text-left'>
            <div
              className='inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]'
              style={{ border: '1px solid rgba(201,169,110,0.28)', background: 'rgba(201,169,110,0.08)', color: '#C9A96E' }}
            >
              <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9A96E]' />
              Do more together · No app needed
            </div>

            <h1
              className='font-display text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl lg:text-[4rem]'
              style={{ color: '#F5EFE6' }}
            >
              Everything&apos;s better{' '}
              <span
                className='bg-clip-text text-transparent'
                style={{ backgroundImage: 'linear-gradient(135deg, #E8B86D 0%, #D4A574 45%, #C97D60 100%)' }}
              >
                together.
              </span>
            </h1>

            <p className='mx-auto max-w-lg text-lg leading-relaxed lg:mx-0' style={{ color: 'rgba(245,239,230,0.65)' }}>
              Start a Buzzbook for anything you do together — a movie night, a trip,
              a birthday, a game night. Everyone adds their page. You all open it together.
            </p>

            {/* Occasions strip */}
            <div className='flex flex-wrap justify-center gap-2 lg:justify-start'>
              {OCCASIONS.map(({ emoji, label }) => (
                <span
                  key={label}
                  className='inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium'
                  style={{ border: '1px solid rgba(201,169,110,0.18)', background: 'rgba(201,169,110,0.06)', color: 'rgba(245,239,230,0.65)' }}
                >
                  {emoji} {label}
                </span>
              ))}
            </div>

            {/* Open book illustration */}
            <div className='py-1'>
              <OpenBookHero />
            </div>

            {/* How it works — compact */}
            <div className='grid gap-4 sm:grid-cols-3 text-left'>
              {[
                { num: '01', title: 'Pick the vibe', body: 'Movie night, trip, birthday, game night — takes 60 seconds.' },
                { num: '02', title: 'Everyone adds a page', body: 'Share the link. Friends write messages and add photos. No app.' },
                { num: '03', title: 'Open it together', body: 'On the chosen date, the Buzzbook opens for everyone.' }
              ].map(({ num, title, body }) => (
                <div key={num} className='space-y-1.5'>
                  <div
                    className='inline-flex h-7 w-7 items-center justify-center rounded-lg font-display text-xs font-bold'
                    style={{ background: 'rgba(201,169,110,0.15)', color: '#C9A96E' }}
                  >
                    {num}
                  </div>
                  <p className='text-sm font-semibold' style={{ color: '#F5EFE6' }}>{title}</p>
                  <p className='text-xs leading-relaxed' style={{ color: 'rgba(245,239,230,0.5)' }}>{body}</p>
                </div>
              ))}
            </div>

            {userCount > 10 && (
              <div className='flex items-center justify-center gap-3 lg:justify-start'>
                <div
                  className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl'
                  style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)' }}
                >
                  <HeroIcon iconName='UsersIcon' className='h-4 w-4 text-[#C9A96E]' />
                </div>
                <p className='text-sm' style={{ color: 'rgba(245,239,230,0.55)' }}>
                  <span className='font-bold' style={{ color: '#F5EFE6' }}>{userCount.toLocaleString()}</span>{' '}
                  people doing things together
                </p>
              </div>
            )}
          </div>

          {/* Right: sign in form */}
          <div>
            <div
              className='relative overflow-hidden rounded-3xl'
              style={{
                border: '1px solid rgba(201,169,110,0.14)',
                background: 'rgba(255,240,215,0.03)',
                boxShadow: '0 0 0 1px rgba(201,169,110,0.06), 0 32px 80px rgba(0,0,0,0.65)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className='h-px w-full' style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.55), transparent)' }} />
              <div className='p-7'>
                <JustLogin />
              </div>
            </div>
            <div className='mt-4'>
              <Link href='/buzzes/new'>
                <a
                  className='flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all hover:bg-[rgba(156,175,136,0.1)]'
                  style={{ border: '1px solid rgba(156,175,136,0.22)', color: '#b8cead' }}
                >
                  📖 Or jump straight to creating a Buzzbook
                  <HeroIcon iconName='ArrowRightIcon' className='h-4 w-4' />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
