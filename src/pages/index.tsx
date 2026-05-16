import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@lib/context/auth-context';
import { BounceButton } from '@components/animations/bounce-button';
import { SEO } from '@components/common/seo';
import { PublicLayout } from '@components/layout/pub_layout';
import { cn } from '@lib/utils';

export default function HomePage(): JSX.Element {
  const { user } = useAuth();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      title: 'Signal once, adapt forever',
      description:
        'Tell us your goals and constraints. The agent learns your patterns and proposes rituals that fit, even on busy weeks.',
      icon: <Sparkles className='h-5 w-5' />,
      accent: 'from-emerald-500 to-teal-500'
    },
    {
      title: '3 picks, zero browsing',
      description:
        'Each morning you get three curated actions with clear reasons. Choose one, swap it, or skip with zero guilt.',
      icon: <Calendar className='h-5 w-5' />,
      accent: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Small steps, real momentum',
      description:
        'Built-in pacing keeps you consistent. The agent celebrates wins and scales intensity based on your week.',
      icon: <Leaf className='h-5 w-5' />,
      accent: 'from-sky-500 to-cyan-500'
    }
  ];

  const testimonials = [
    {
      name: 'Priya',
      role: 'Design Lead',
      quote: 'It feels like my rituals are finally on autopilot. I still choose, but the hard part is handled.',
      avatar: '🌿'
    },
    {
      name: 'Jordan',
      role: 'Caregiver',
      quote: 'The tiny actions fit my schedule. I can keep my streak even on the busiest days.',
      avatar: '🧡'
    },
    {
      name: 'Mateo',
      role: 'Founder',
      quote: 'I asked for focus and recovery. Now my mornings have structure without feeling rigid.',
      avatar: '⚡'
    }
  ];

  const safeguards = [
    {
      title: 'Approval first',
      description: 'Nothing is added without your OK. Every suggestion is opt-in, every time.',
      icon: <CheckCircle2 className='h-5 w-5' />
    },
    {
      title: 'Privacy by default',
      description: 'Your data is used to personalize only. No selling, no sharing, no trackers.',
      icon: <ShieldCheck className='h-5 w-5' />
    },
    {
      title: 'Flexible pacing',
      description: 'Pause, snooze, or reshape your rituals anytime. The agent adjusts to you.',
      icon: <Clock className='h-5 w-5' />
    }
  ];

  const steps = [
    {
      title: 'Set your intent',
      description: 'Pick what matters. Wellness, focus, creativity, or recovery.',
      icon: <HeartHandshake className='h-5 w-5' />
    },
    {
      title: 'Confirm your rhythm',
      description: 'Choose the times and days you want momentum, plus your constraints.',
      icon: <Calendar className='h-5 w-5' />
    },
    {
      title: 'Act with ease',
      description: 'Daily picks arrive with context and a simple yes/no decision.',
      icon: <Sparkles className='h-5 w-5' />
    }
  ];

  return (
    <PublicLayout>
      <SEO
        title='Blesswin - Rituals That Run Themselves'
        description='Buzzwin helps you decide and act — not just discover. Set your intention once; get curated picks, rituals, and an AI co-pilot to plan your next step.'
      />

      <section className='relative overflow-hidden bg-cream'>
        <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#BFE3FF,_transparent_55%)]' />
        <div className='absolute -left-40 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,_#FFD9A8,_transparent_70%)] opacity-70 blur-3xl' />
        <div className='absolute -right-48 top-16 h-96 w-96 rounded-full bg-[radial-gradient(circle,_#FFB3C2,_transparent_70%)] opacity-60 blur-3xl' />

        <div className='mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28'>
          {/* ── Left: copy + CTAs ── */}
          <div className='text-left'>
            {user && (
              <div className='mb-5 rounded-xl border border-action/20 bg-white/90 px-4 py-3 text-sm text-charcoal/90 shadow-sm dark:border-white/10 dark:bg-charcoal/40 dark:text-cream/90'>
                <span className='font-semibold text-action'>What&apos;s new:</span>{' '}
                Buzzwin now helps you decide and act — not just discover.{' '}
                <Link href='/ask' className='font-medium text-action underline decoration-action/40 underline-offset-2 hover:decoration-action'>
                  Ask Buzzwin
                </Link>{' '}
                to plan your weekend, compare options, or save a plan.
              </div>
            )}

            {/* Badge row */}
            <div className='flex flex-wrap gap-2'>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-charcoal/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-charcoal/80 shadow-sm'>
                ✨ Daily rituals
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm'>
                📖 Buzzbooks
              </span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className='mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-charcoal sm:text-5xl lg:text-6xl'
            >
              Good days.
              <span className='block text-emerald-700'>Great people.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className='mt-5 text-base leading-7 text-charcoal/80 sm:mt-6 sm:text-lg'
            >
              Blesswin keeps your rituals alive with three calm daily picks — and lets you celebrate the people who make your days better with a Buzzbook.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className='mt-8 sm:mt-10'
            >
              {user ? (
                <div className='flex flex-wrap gap-3'>
                  <Link href='/ask'>
                    <BounceButton variant='primary' size='lg'>
                      Ask Buzzwin
                      <ArrowRight className='ml-2 h-5 w-5' />
                    </BounceButton>
                  </Link>
                  <Link href='/buzzes/new'>
                    <BounceButton variant='secondary' size='lg'>
                      📖 Create a Buzzbook
                    </BounceButton>
                  </Link>
                  <Link href='/home'>
                    <BounceButton variant='secondary' size='lg'>
                      Dashboard
                    </BounceButton>
                  </Link>
                </div>
              ) : (
                <>
                  <div className='flex flex-wrap gap-3'>
                    <Link href='/register'>
                      <BounceButton variant='primary' size='lg'>
                        <span className='inline-flex items-center gap-2 whitespace-nowrap'>
                          Start Free
                          <ArrowRight className='h-5 w-5' />
                        </span>
                      </BounceButton>
                    </Link>
                    <Link href='/buzzes/new'>
                      <a className='inline-flex items-center gap-2 rounded-full border-2 border-emerald-700 bg-emerald-700 px-6 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 active:scale-95'>
                        📖 Create a Buzzbook
                      </a>
                    </Link>
                  </div>
                  <p className='mt-4 text-sm text-charcoal/80'>
                    Already a member?{' '}
                    <Link href='/login'>
                      <a className='font-medium underline underline-offset-2 hover:text-charcoal'>Sign in</a>
                    </Link>
                  </p>
                </>
              )}
            </motion.div>

            <div className='mt-8 flex flex-wrap gap-4 text-sm text-charcoal/70 sm:mt-10'>
              <div className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-full bg-hope' />
                Three curated picks a day
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-full bg-sage' />
                Group Buzzbooks in minutes
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-full bg-terracotta' />
                No guilt, no pressure
              </div>
            </div>
          </div>

          {/* ── Right: unified rituals + Buzzbook card ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className='relative'
          >
            <div className='overflow-hidden rounded-[28px] border-2 border-charcoal/10 bg-white/90 shadow-[0_24px_70px_rgba(44,44,44,0.13)] backdrop-blur'>

              {/* ── Rituals section ── */}
              <div className='p-5 sm:p-6'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-semibold text-charcoal'>✨ Today</span>
                  <span className='rounded-full bg-cream px-3 py-1 text-xs font-medium uppercase tracking-widest text-charcoal/80'>Routine</span>
                </div>
                <div className='mt-4 space-y-2'>
                  {[
                    { title: '5-min reset walk', time: '9:10 AM', tone: 'from-emerald-400 to-teal-500' },
                    { title: 'Stretch + hydrate', time: '1:30 PM', tone: 'from-sky-400 to-cyan-500' },
                    { title: 'Wind-down journal', time: '9:00 PM', tone: 'from-amber-400 to-orange-500' }
                  ].map((item) => (
                    <div
                      key={item.title}
                      className='flex items-center justify-between rounded-xl border border-charcoal/8 bg-cream/60 px-3 py-2.5'
                    >
                      <div className='flex items-center gap-2.5'>
                        <div className={cn('h-7 w-7 rounded-lg bg-gradient-to-br', item.tone)} />
                        <span className='text-sm font-medium text-charcoal'>{item.title}</span>
                      </div>
                      <span className='text-xs font-medium text-charcoal/70'>{item.time}</span>
                    </div>
                  ))}
                </div>
                <p className='mt-3 rounded-xl bg-charcoal/5 px-3 py-2 text-xs text-charcoal/70'>
                  Skip any time — we adjust tomorrow. No streak pressure.
                </p>
              </div>

              {/* ── Divider ── */}
              <div className='mx-5 border-t border-charcoal/8 sm:mx-6' />

              {/* ── Buzzbook section ── */}
              <div className='bg-emerald-50/70 p-5 sm:p-6'>
                <div className='flex items-start gap-3'>
                  <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-emerald-200'>
                    📖
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-charcoal'>Priya&apos;s Buzzbook</p>
                    <p className='mt-0.5 text-xs text-charcoal/70'>Design Lead · 4 teammates have signed</p>
                    <div className='mt-2 flex items-center gap-2'>
                      <div className='flex -space-x-1.5'>
                        {['🌿', '🧡', '⚡', '🌊'].map((emoji, i) => (
                          <div key={i} className='flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs ring-1 ring-emerald-100'>
                            {emoji}
                          </div>
                        ))}
                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200'>
                          +2
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Link href='/buzzes/new'>
                  <a className='mt-4 flex items-center justify-between rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800'>
                    Sign their Buzzbook
                    <ArrowRight className='h-4 w-4' />
                  </a>
                </Link>
              </div>
            </div>

            {/* Floating badge */}
            <div className='absolute -bottom-5 -right-4 rounded-2xl border border-charcoal/10 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal shadow-lg'>
              📅 +2 gentle nudges this week
            </div>
          </motion.div>
        </div>
      </section>

      <section className='bg-white py-16 sm:py-20 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='font-display text-3xl font-semibold text-charcoal sm:text-4xl'>
              A calmer operating system
            </h2>
            <p className='mt-4 text-lg text-charcoal/70'>
              Built to reduce decision fatigue and keep your rituals alive, even when life gets noisy.
            </p>
          </div>

          <div className='mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:mt-16 sm:gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3'>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={cn(
                  'group relative overflow-hidden rounded-[28px] border-2 border-charcoal/10 bg-cream/70 p-6 transition-all sm:p-7',
                  hoveredFeature === index ? 'shadow-xl' : 'hover:-translate-y-1 hover:shadow-lg'
                )}
              >
                <div
                  className={cn(
                    'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform',
                    feature.accent,
                    hoveredFeature === index && 'scale-110'
                  )}
                >
                  {feature.icon}
                </div>
                <h3 className='text-xl font-semibold text-charcoal'>
                  {feature.title}
                </h3>
                <p className='mt-3 text-sm leading-6 text-charcoal/70'>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-charcoal py-16 text-cream sm:py-20 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='font-display text-3xl font-semibold sm:text-4xl'>
              From intention to action, daily
            </h2>
            <p className='mt-4 text-lg text-cream/80'>
              A gentle loop that keeps you consistent without demanding perfection.
            </p>
          </div>

          <div className='mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-3'>
            {steps.map((step) => (
              <div
                key={step.title}
                className='rounded-[28px] border-2 border-cream/20 bg-white/10 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.2)]'
              >
                <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-charcoal'>
                  {step.icon}
                </div>
                <h3 className='text-lg font-semibold'>{step.title}</h3>
                <p className='mt-2 text-sm text-cream/80'>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-cream py-16 sm:py-20 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='font-display text-3xl font-semibold text-charcoal sm:text-4xl'>
              Control stays with you
            </h2>
            <p className='mt-4 text-lg text-charcoal/70'>
              Designed for trust, transparency, and gentle accountability.
            </p>
          </div>

          <div className='mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-3'>
            {safeguards.map((item) => (
              <div
                key={item.title}
                className='rounded-[28px] border-2 border-charcoal/10 bg-white p-6 shadow-[0_18px_40px_rgba(44,44,44,0.08)] sm:p-7'
              >
                <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sage/30 text-charcoal'>
                  {item.icon}
                </div>
                <h3 className='text-lg font-semibold text-charcoal'>{item.title}</h3>
                <p className='mt-2 text-sm text-charcoal/70'>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-white py-16 sm:py-20 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='font-display text-3xl font-semibold text-charcoal sm:text-4xl'>
              People using it every day
            </h2>
            <p className='mt-4 text-lg text-charcoal/70'>
              Honest stories from lives with different rhythms.
            </p>
          </div>

          <div className='mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:mt-16 sm:gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3'>
            {testimonials.map((example, index) => (
              <motion.div
                key={example.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className='rounded-[28px] border-2 border-charcoal/10 bg-cream/70 p-7'
              >
                <div className='mb-4 flex items-center gap-4'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl'>
                    {example.avatar}
                  </div>
                  <div>
                    <div className='font-semibold text-charcoal'>{example.name}</div>
                    <div className='text-sm text-charcoal/80'>{example.role}</div>
                  </div>
                </div>
                <p className='text-sm leading-6 text-charcoal/70'>"{example.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-gradient-to-br from-action to-hope py-16 sm:py-20 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='font-display text-3xl font-semibold text-cream sm:text-4xl'>
              Ready to make rituals effortless?
            </h2>
            <p className='mx-auto mt-6 max-w-xl text-lg leading-8 text-cream/80'>
              Start free, set your intent, and let Blesswin plan the rest.
            </p>
            <div className='mt-10 flex items-center justify-center gap-4'>
              {user ? (
                <Link href='/automations'>
                  <BounceButton variant='secondary' size='lg'>
                    Set Up Your First Automation
                    <ArrowRight className='ml-2 h-5 w-5' />
                  </BounceButton>
                </Link>
              ) : (
                <Link href='/register'>
                  <BounceButton variant='secondary' size='lg'>
                    <span className='inline-flex items-center gap-2 whitespace-nowrap'>
                      Start Free
                      <ArrowRight className='h-5 w-5' />
                    </span>
                  </BounceButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
