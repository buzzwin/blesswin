import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import Link from 'next/link';
import { useAuth } from '@lib/context/auth-context';
import { useRouter } from 'next/router';
import { SEO } from '@components/common/seo';
import { HeroIcon } from '@components/ui/hero-icon';
import JustLogin from '@components/login/justlogin';

const OCCASIONS = [
  { emoji: '🎂', label: 'Birthday' },
  { emoji: '🪔', label: 'Diwali' },
  { emoji: '🌙', label: 'Eid' },
  { emoji: '🎄', label: 'Christmas' },
  { emoji: '💍', label: 'Anniversary' },
  { emoji: '🎓', label: 'Graduation' },
  { emoji: '👋', label: 'Farewell' },
  { emoji: '✨', label: 'Any occasion' }
];

const STEPS = [
  {
    num: '01',
    title: 'Create the Buzzbook',
    body: 'Pick the occasion — birthday, Diwali, Eid, farewell, anything. Takes 60 seconds.'
  },
  {
    num: '02',
    title: 'Share the link',
    body: 'Your tribe gets a link. They write their message and add a photo. No app needed.'
  },
  {
    num: '03',
    title: 'Reveal together',
    body: 'On the day, the Buzzbook opens. Every wish, every photo — in one beautiful book.'
  }
];

export default function HomePage(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    if (user) void router.push('/home');
  }, [user]);

  useEffect(() => {
    const getCount = async () => {
      try {
        const snap = await getCountFromServer(collection(db, 'users'));
        setUserCount(snap.data().count);
      } catch {
        // silent
      }
    };
    void getCount();
  }, []);

  return (
    <>
      <SEO
        title='Buzzwin — Celebrate the people who matter to you'
        description='Create a group Buzzbook for birthdays, Diwali, Eid, weddings and more. Friends sign with messages and photos — revealed together on the special day.'
      />

      <div
        className='relative min-h-screen overflow-hidden text-[#F5EFE6]'
        style={{ backgroundColor: '#110d07' } as CSSProperties}
      >
        {/* Warm background glows */}
        <div className='pointer-events-none absolute inset-0'>
          <div
            className='absolute -top-40 left-1/3 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-3xl'
            style={{ background: 'radial-gradient(circle at center, rgba(201,169,110,0.2) 0%, transparent 65%)' }}
          />
          <div
            className='absolute -bottom-32 right-0 h-[32rem] w-[32rem] rounded-full blur-3xl'
            style={{ background: 'radial-gradient(circle at center, rgba(181,96,60,0.16) 0%, transparent 65%)' }}
          />
          <div
            className='absolute top-1/3 -left-20 h-[28rem] w-[28rem] rounded-full blur-3xl'
            style={{ background: 'radial-gradient(circle at center, rgba(156,175,136,0.12) 0%, transparent 65%)' }}
          />
          <div
            className='absolute inset-0'
            style={{ background: 'linear-gradient(160deg, rgba(17,13,7,0.85) 0%, rgba(28,18,10,0.5) 50%, rgba(12,9,4,0.9) 100%)' }}
          />
          <div
            className='absolute inset-0 opacity-25'
            style={{
              backgroundImage: 'linear-gradient(90deg, rgba(201,169,110,0.07) 1px, transparent 1px), linear-gradient(180deg, rgba(201,169,110,0.05) 1px, transparent 1px)',
              backgroundSize: '52px 52px'
            }}
          />
        </div>

        {/* ── Nav ── */}
        <nav className='relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8'>
          <span className='font-display text-xl font-extrabold tracking-tight' style={{ color: '#F5EFE6' }}>
            Buzzwin
          </span>
          <Link href='/login'>
            <a
              className='rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:bg-[rgba(201,169,110,0.1)]'
              style={{ border: '1px solid rgba(201,169,110,0.2)', color: '#C9A96E' }}
            >
              Sign in
            </a>
          </Link>
        </nav>

        {/* ── Hero ── */}
        <div className='relative mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:pt-12'>
          <div className='grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-start lg:gap-16'>

            {/* Left: copy */}
            <div className='space-y-7 text-center lg:text-left'>

              {/* Eyebrow */}
              <div
                className='inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]'
                style={{ border: '1px solid rgba(201,169,110,0.28)', background: 'rgba(201,169,110,0.08)', color: '#C9A96E' }}
              >
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9A96E]' />
                Group celebrations · No app needed
              </div>

              {/* Headline */}
              <h1
                className='font-display text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.25rem]'
                style={{ color: '#F5EFE6' }}
              >
                Celebrate the{' '}
                <span
                  className='bg-clip-text text-transparent'
                  style={{ backgroundImage: 'linear-gradient(135deg, #E8B86D 0%, #D4A574 45%, #C97D60 100%)' }}
                >
                  people
                </span>
                <br className='hidden sm:block' />
                {' '}who matter to you.
              </h1>

              {/* Sub */}
              <p className='mx-auto max-w-lg text-lg leading-relaxed lg:mx-0' style={{ color: 'rgba(245,239,230,0.65)' }}>
                Create a group Buzzbook for any occasion. Your tribe adds their messages
                and photos. Revealed together on the special day — like opening a memory
                box, all at once.
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

              {/* CTAs — mobile only (desktop has the login form) */}
              <div className='flex flex-wrap justify-center gap-3 lg:hidden'>
                <Link href='/buzzes/new'>
                  <a
                    className='inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px'
                    style={{
                      background: 'linear-gradient(135deg, #C97D60 0%, #B56540 100%)',
                      boxShadow: '0 2px 0 rgba(0,0,0,0.3), 0 4px 16px rgba(181,96,60,0.3)'
                    }}
                  >
                    Create a Buzzbook →
                  </a>
                </Link>
                <Link href='/login'>
                  <a
                    className='inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:bg-[rgba(201,169,110,0.1)]'
                    style={{ border: '1px solid rgba(201,169,110,0.25)', color: '#C9A96E' }}
                  >
                    Sign in
                  </a>
                </Link>
              </div>

              {/* Community proof */}
              {userCount > 10 && (
                <div className='flex items-center justify-center gap-3 lg:justify-start'>
                  <div
                    className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl'
                    style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)' }}
                  >
                    <HeroIcon iconName='UsersIcon' className='h-4.5 w-4.5 text-[#C9A96E]' />
                  </div>
                  <p className='text-sm' style={{ color: 'rgba(245,239,230,0.55)' }}>
                    <span className='font-bold' style={{ color: '#F5EFE6' }}>{userCount.toLocaleString()}</span>{' '}
                    people celebrating together
                  </p>
                </div>
              )}
            </div>

            {/* Right: sign in form */}
            <div className='hidden lg:block'>
              <div
                className='relative overflow-hidden rounded-3xl'
                style={{
                  border: '1px solid rgba(201,169,110,0.14)',
                  background: 'rgba(255,240,215,0.03)',
                  boxShadow: '0 0 0 1px rgba(201,169,110,0.06), 0 32px_80px rgba(0,0,0,0.65)',
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

        {/* ── How it works ── */}
        <div className='relative mx-auto max-w-7xl px-5 pb-16 sm:px-8'>
          <div
            className='overflow-hidden rounded-3xl p-8 sm:p-10'
            style={{ border: '1px solid rgba(201,169,110,0.12)', background: 'rgba(201,169,110,0.04)' }}
          >
            <p
              className='mb-2 text-xs font-semibold uppercase tracking-[0.2em]'
              style={{ color: 'rgba(201,169,110,0.6)' }}
            >
              How it works
            </p>
            <h2 className='mb-8 font-display text-2xl font-bold sm:text-3xl' style={{ color: '#F5EFE6' }}>
              Three steps. One unforgettable moment.
            </h2>
            <div className='grid gap-6 sm:grid-cols-3'>
              {STEPS.map(({ num, title, body }) => (
                <div key={num} className='space-y-3'>
                  <div
                    className='inline-flex h-9 w-9 items-center justify-center rounded-xl font-display text-sm font-bold'
                    style={{ background: 'rgba(201,169,110,0.15)', color: '#C9A96E' }}
                  >
                    {num}
                  </div>
                  <h3 className='font-display text-base font-bold' style={{ color: '#F5EFE6' }}>{title}</h3>
                  <p className='text-sm leading-relaxed' style={{ color: 'rgba(245,239,230,0.55)' }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Community callout ── */}
        <div className='relative mx-auto max-w-7xl px-5 pb-20 sm:px-8'>
          <div className='overflow-hidden rounded-3xl' style={{ border: '1px solid rgba(52,211,153,0.15)' }}>
            <div
              className='relative'
              style={{ background: 'linear-gradient(135deg, #061a0f 0%, #0a1f14 50%, #071510 100%)' }}
            >
              <div
                className='pointer-events-none absolute inset-0'
                style={{ background: 'radial-gradient(ellipse at top left, rgba(52,211,153,0.09) 0%, transparent 60%)' }}
              />
              <div className='relative px-7 py-10 sm:px-10 sm:py-12'>
                <div className='flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12'>
                  <div className='flex-1'>
                    <p className='mb-2 text-xs font-semibold uppercase tracking-[0.2em]' style={{ color: 'rgba(110,231,183,0.55)' }}>
                      Your community
                    </p>
                    <h2 className='font-display text-2xl font-bold sm:text-3xl' style={{ color: '#F5EFE6' }}>
                      Built for every tribe.
                    </h2>
                    <p className='mt-3 max-w-md text-sm leading-relaxed' style={{ color: 'rgba(245,239,230,0.6)' }}>
                      Whether it&apos;s your family's Diwali celebration, your school
                      friend's big send-off, or your colleague's farewell — Buzzwin
                      brings your people together around the moments that matter.
                    </p>
                    <div className='mt-5 flex flex-wrap gap-3 text-sm'>
                      {[
                        'South Asian families',
                        'Muslim communities',
                        'Workplace teams',
                        'Friend groups',
                        'Diaspora circles'
                      ].map((tag) => (
                        <span
                          key={tag}
                          className='rounded-full px-3 py-1 text-xs font-medium'
                          style={{ border: '1px solid rgba(110,231,183,0.2)', background: 'rgba(110,231,183,0.06)', color: 'rgba(110,231,183,0.75)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className='shrink-0'>
                    <Link href='/buzzes/new'>
                      <a
                        className='inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-px'
                        style={{
                          background: 'rgba(52,211,153,0.15)',
                          border: '1px solid rgba(52,211,153,0.3)',
                          boxShadow: '0 4px 20px rgba(52,211,153,0.1)'
                        }}
                      >
                        Start a Buzzbook
                        <HeroIcon iconName='ArrowRightIcon' className='h-4 w-4' />
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className='relative border-t'
          style={{ borderColor: 'rgba(201,169,110,0.1)' }}
        >
          <div className='mx-auto max-w-7xl px-5 py-8 sm:px-8'>
            <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
              <span className='font-display text-lg font-extrabold' style={{ color: 'rgba(245,239,230,0.5)' }}>
                Buzzwin
              </span>
              <div className='flex gap-6 text-xs' style={{ color: 'rgba(245,239,230,0.35)' }}>
                <Link href='/privacy'><a className='hover:text-[#C9A96E] transition-colors'>Privacy</a></Link>
                <Link href='/tos'><a className='hover:text-[#C9A96E] transition-colors'>Terms</a></Link>
                <Link href='/how-it-works'><a className='hover:text-[#C9A96E] transition-colors'>How it works</a></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
