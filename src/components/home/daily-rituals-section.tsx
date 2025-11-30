import Link from 'next/link';
import { Calendar, Flame, TrendingUp, ArrowRight } from 'lucide-react';
import { SectionShell } from '@components/layout/section-shell';

interface DailyRitualsSectionProps {
  user: any; // Using any for now, consistent with RippleSystem
  onSignIn: () => void;
}

export function DailyRitualsSection({
  user,
  onSignIn
}: DailyRitualsSectionProps): JSX.Element {
  return (
    <SectionShell>
      <div className='mx-auto w-full max-w-6xl px-6'>
        <div className='mb-12 text-center'>
          <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'>
            <Calendar className='h-8 w-8 text-purple-600 dark:text-purple-400' />
          </div>
          <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl'>
            Daily Rituals for Wellness
          </h2>
          <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300'>
            Build positive habits with small, daily actions. Track your progress, build streaks, and create lasting change.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {/* Feature 1: Daily Prompts */}
          <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
                <span className='text-2xl'>🌱</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                Daily Prompts
              </h3>
            </div>
            <p className='text-gray-600 dark:text-gray-400'>
              Receive personalized daily rituals tailored to your interests and goals. From meditation to acts of kindness.
            </p>
          </div>

          {/* Feature 2: Streak Tracking */}
          <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30'>
                <Flame className='h-6 w-6 text-orange-600 dark:text-orange-400' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                Streak Tracking
              </h3>
            </div>
            <p className='text-gray-600 dark:text-gray-400'>
              Build momentum with visual streak tracking. Watch your daily practice grow and celebrate milestones along the way.
            </p>
          </div>

          {/* Feature 3: Personalized Suggestions */}
          <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                <TrendingUp className='h-6 w-6 text-green-600 dark:text-green-400' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                AI-Powered Suggestions
              </h3>
            </div>
            <p className='text-gray-600 dark:text-gray-400'>
              Get smart recommendations based on your activity and preferences. Our AI learns what works best for you.
            </p>
          </div>
        </div>

        {/* Example Rituals */}
        <div className='mt-12 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-8 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20'>
          <h3 className='mb-6 text-center text-xl font-bold text-gray-900 dark:text-white'>
            Examples of Daily Rituals
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <div className='rounded-lg border border-purple-200 bg-white p-4 dark:border-purple-800 dark:bg-gray-800'>
              <div className='mb-2 text-2xl'>🧘</div>
              <h4 className='mb-1 font-semibold text-gray-900 dark:text-white'>Meditate for 3 Minutes</h4>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Quick mindfulness practice</p>
            </div>
            <div className='rounded-lg border border-purple-200 bg-white p-4 dark:border-purple-800 dark:bg-gray-800'>
              <div className='mb-2 text-2xl'>📞</div>
              <h4 className='mb-1 font-semibold text-gray-900 dark:text-white'>Call a Friend</h4>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Strengthen relationships</p>
            </div>
            <div className='rounded-lg border border-purple-200 bg-white p-4 dark:border-purple-800 dark:bg-gray-800'>
              <div className='mb-2 text-2xl'>🌿</div>
              <h4 className='mb-1 font-semibold text-gray-900 dark:text-white'>Take 5 Deep Breaths</h4>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Reset and center yourself</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className='mt-8 text-center'>
          {user ? (
            <Link href='/rituals'>
              <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-purple-700'>
                View Your Rituals
                <ArrowRight className='h-4 w-4' />
              </a>
            </Link>
          ) : (
            <button
              onClick={onSignIn}
              className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80'
            >
              Start Your Ritual Journey
              <ArrowRight className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
