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

        <div className='mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-28'>
          <div className='text-left'>
            {user && (
              <div className='mb-4 rounded-xl border border-action/20 bg-white/90 px-4 py-3 text-sm text-charcoal/90 shadow-sm dark:border-white/10 dark:bg-charcoal/40 dark:text-cream/90'>
                <span className='font-semibold text-action'>What&apos;s new:</span>{' '}
                Buzzwin now helps you decide and act — not just discover.{' '}
                <Link href='/ask' className='font-medium text-action underline decoration-action/40 underline-offset-2 hover:decoration-action'>
                  Ask Buzzwin
                </Link>{' '}
                to plan your weekend, compare options, or save a plan.
              </div>
            )}
            <div className='inline-flex items-center gap-2 rounded-full border border-charcoal/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/70 shadow-sm'>
              <span className='text-base'>✨</span>
              Rituals, but playful
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className='mt-5 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-charcoal sm:text-5xl lg:text-6xl'
            >
              Rituals that feel
              <span className='block text-action'>effortless</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className='mt-5 text-base leading-7 text-charcoal/80 sm:mt-6 sm:text-lg'
            >
              Blesswin learns your goals and constraints, then delivers three smart, humane picks each day. No guilt, no clutter, just a calm next step.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className='mt-8 flex flex-wrap items-center gap-4 sm:mt-10'
            >
              {user ? (
                <>
                  <Link href='/ask'>
                    <BounceButton variant='primary' size='lg'>
                      Ask Buzzwin
                      <ArrowRight className='ml-2 h-5 w-5' />
                    </BounceButton>
                  </Link>
                  <Link href='/automations'>
                    <BounceButton variant='secondary' size='lg'>
                      Automations
                    </BounceButton>
                  </Link>
                  <Link href='/home'>
                    <BounceButton variant='secondary' size='lg'>
                      Go to Dashboard
                    </BounceButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link href='/register'>
                    <BounceButton variant='primary' size='lg'>
                      <span className='inline-flex items-center gap-2 whitespace-nowrap'>
                        Start Free
                        <ArrowRight className='h-5 w-5' />
                      </span>
                    </BounceButton>
                  </Link>
                  <Link href='/login'>
                    <BounceButton variant='secondary' size='lg'>
                      Sign In
                    </BounceButton>
                  </Link>
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
                Adjusts to your calendar
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-full bg-terracotta' />
                Full approval control
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className='relative'
          >
            <div className='rounded-[32px] border-2 border-charcoal/10 bg-white/85 p-5 shadow-[0_24px_70px_rgba(44,44,44,0.15)] backdrop-blur sm:p-6'>
              <div className='flex items-center justify-between text-sm text-charcoal/60'>
                <span>Today</span>
                <span className='rounded-full bg-cream px-3 py-1 text-xs uppercase tracking-[0.2em] text-charcoal/70'>Routine</span>
              </div>
              <div className='mt-5 space-y-3 sm:mt-6 sm:space-y-4'>
                {[
                  {
                    title: '5-min reset walk',
                    time: '9:10 AM',
                    tone: 'from-emerald-400 to-teal-500'
                  },
                  {
                    title: 'Stretch + hydrate',
                    time: '1:30 PM',
                    tone: 'from-sky-400 to-cyan-500'
                  },
                  {
                    title: 'Wind-down journal',
                    time: '9:00 PM',
                    tone: 'from-amber-400 to-orange-500'
                  }
                ].map((item) => (
                  <div
                    key={item.title}
                    className='flex items-center justify-between rounded-2xl border-2 border-charcoal/10 bg-white px-4 py-3 transition-transform hover:-translate-y-0.5'
                  >
                    <div className='flex items-center gap-3'>
                      <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br', item.tone)} />
                      <div>
                        <div className='text-sm font-semibold text-charcoal'>{item.title}</div>
                        <div className='text-xs text-charcoal/60'>Suggested because: low effort day</div>
                      </div>
                    </div>
                    <span className='text-xs font-medium text-charcoal/70'>{item.time}</span>
                  </div>
                ))}
              </div>
              <div className='mt-5 rounded-2xl bg-charcoal px-4 py-3 text-sm text-cream sm:mt-6'>
                If you skip, we auto-adjust tomorrow. No streak pressure.
              </div>
            </div>
            <div className='absolute -bottom-6 -left-6 rounded-2xl border border-charcoal/10 bg-white px-4 py-3 text-xs font-semibold text-charcoal shadow-lg'>
              +2 gentle nudges this week
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
                    <div className='text-sm text-charcoal/60'>{example.role}</div>
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
