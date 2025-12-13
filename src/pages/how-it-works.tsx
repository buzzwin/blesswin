import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Heart,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { PublicLayout } from '@components/layout/pub_layout';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { useAuth } from '@lib/context/auth-context';

export default function HowItWorksPage(): JSX.Element {
  const { user } = useAuth();

  return (
    <>
      <SEO
        title='How It Works - Ritual Sharing and Participation | Buzzwin'
        description='Learn how Buzzwin works: express yourself with reactions, join rituals to participate, and share your ritual participations with the community.'
      />
      <PublicLayout
        title='How It Works - Buzzwin'
        description='Learn how Buzzwin works: express yourself with reactions, join rituals to participate, and share your ritual participations.'
      >
        <MainHeader title='How It Works' />
        <div className='mx-auto min-h-screen max-w-4xl bg-main-background px-4 py-12 dark:bg-dark-background'>
          {/* Hero Section */}
          <div className='mb-12 text-center'>
            <h1 className='mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl'>
              How Buzzwin Works
            </h1>
            <p className='mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
              A simple, powerful way to share ritual participation. Express
              yourself with reactions, join rituals to participate, and share
              your journey with the community.
            </p>
          </div>

          {/* Core Concepts */}
          <div className='mb-16 space-y-8'>
            {/* Ritual Sharing */}
            <section className='rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-6 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600'>
                  <Sparkles className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    1. Ritual Sharing
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Share your ritual participations
                  </p>
                </div>
              </div>
              <p className='mb-4 text-gray-700 dark:text-gray-300'>
                Ritual Participations are when you complete and share rituals.
                When you finish a ritual, you can share your participation with
                the community to inspire others.
              </p>
              <ul className='space-y-2 text-gray-600 dark:text-gray-400'>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400' />
                  <span>Complete rituals and share your participation</span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400' />
                  <span>
                    Tag your participation (Mind, Body, Relationships, Nature,
                    Community, Chores)
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400' />
                  <span>
                    Add photos or mood check-ins to track your journey
                  </span>
                </li>
              </ul>
            </section>

            {/* Reactions */}
            <section className='rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-6 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600'>
                  <Heart className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    2. Reactions
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Quick emotional feedback
                  </p>
                </div>
              </div>
              <p className='mb-4 text-gray-700 dark:text-gray-300'>
                Reactions are lightweight expressions of emotion. Click the
                "React" button on any ritual participation to show how it made
                you feel.
              </p>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
                  <div className='mb-2 text-2xl'>✨</div>
                  <h3 className='mb-1 font-semibold text-purple-900 dark:text-purple-100'>
                    Inspired
                  </h3>
                  <p className='text-sm text-purple-700 dark:text-purple-300'>
                    This moved you
                  </p>
                </div>
                <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
                  <div className='mb-2 text-2xl'>🙏</div>
                  <h3 className='mb-1 font-semibold text-purple-900 dark:text-purple-100'>
                    Grateful
                  </h3>
                  <p className='text-sm text-purple-700 dark:text-purple-300'>
                    You're thankful
                  </p>
                </div>
                <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
                  <div className='mb-2 text-2xl'>💚</div>
                  <h3 className='mb-1 font-semibold text-purple-900 dark:text-purple-100'>
                    Sent Love
                  </h3>
                  <p className='text-sm text-purple-700 dark:text-purple-300'>
                    You care
                  </p>
                </div>
              </div>
            </section>

            {/* Join Rituals */}
            <section className='rounded-xl border-2 border-purple-300 bg-purple-50 p-8 dark:border-purple-700 dark:bg-purple-900/20'>
              <div className='mb-6 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600'>
                  <span className='text-3xl'>🌱</span>
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-purple-900 dark:text-purple-100'>
                    3. Join This Ritual
                  </h2>
                  <p className='text-sm text-purple-700 dark:text-purple-300'>
                    Participate in rituals and share your journey
                  </p>
                </div>
              </div>
              <p className='mb-4 text-purple-800 dark:text-purple-200'>
                <strong>This is different from reactions.</strong> When you join
                a ritual, you're committing to participate in that ritual
                yourself and share your participation with the community.
              </p>
              <div className='mb-4 space-y-3'>
                <div className='flex items-start gap-3 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400' />
                  <div>
                    <p className='font-semibold text-purple-900 dark:text-purple-100'>
                      Share Your Ritual Participation
                    </p>
                    <p className='text-sm text-purple-700 dark:text-purple-300'>
                      Complete the ritual and share your participation with the
                      community
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400' />
                  <div>
                    <p className='font-semibold text-purple-900 dark:text-purple-100'>
                      Connects to the Ritual
                    </p>
                    <p className='text-sm text-purple-700 dark:text-purple-300'>
                      Your participation is linked to the ritual you joined
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400' />
                  <div>
                    <p className='font-semibold text-purple-900 dark:text-purple-100'>
                      Inspires Others
                    </p>
                    <p className='text-sm text-purple-700 dark:text-purple-300'>
                      Your participation inspires others to join the ritual too
                    </p>
                  </div>
                </div>
              </div>
              <div className='rounded-lg border border-purple-200 bg-white p-4 dark:border-purple-800 dark:bg-gray-800'>
                <p className='text-sm font-medium text-purple-900 dark:text-purple-100'>
                  💡 Example: Someone shares "Just finished my breathing
                  ritual". You click "Join This Ritual" to participate in the
                  same ritual, then share your own participation: "Completed my
                  breathing practice this morning". Now you're both part of the
                  same ritual community!
                </p>
              </div>
            </section>

            {/* Ripples */}
            <section className='rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-6 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600'>
                  <TrendingUp className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    4. Ripples
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    The chain visualization of participation
                  </p>
                </div>
              </div>
              <p className='mb-4 text-gray-700 dark:text-gray-300'>
                A Ripple shows how a ritual spreads through the community. When
                someone says "This ritual has 23 participants," it means 23
                people have joined and participated in that ritual.
              </p>
              <div className='mb-6 rounded-lg border-2 border-purple-300 bg-purple-50 p-6 dark:border-purple-700 dark:bg-purple-900/20'>
                <h3 className='mb-4 text-lg font-semibold text-purple-900 dark:text-purple-100'>
                  See the Ritual Community in Action
                </h3>
                <div className='space-y-4'>
                  {/* Original */}
                  <div className='rounded-lg border-2 border-purple-300 bg-white p-4 dark:border-purple-700 dark:bg-gray-800'>
                    <div className='mb-2 text-xs font-semibold uppercase text-purple-600 dark:text-purple-400'>
                      Original Ritual Participation
                    </div>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      "Just finished my breathing ritual"
                    </p>
                  </div>

                  {/* Connector */}
                  <div className='flex justify-center'>
                    <div className='h-6 w-0.5 bg-purple-200 dark:bg-purple-800' />
                  </div>

                  {/* Joined 1 */}
                  <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900'>
                    <div className='mb-2 flex items-center gap-2'>
                      <span className='text-xs'>🌱</span>
                      <span className='text-xs font-semibold text-purple-600 dark:text-purple-400'>
                        Joined the ritual
                      </span>
                    </div>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      "Completed my breathing practice this morning"
                    </p>
                  </div>

                  {/* Connector */}
                  <div className='flex justify-center'>
                    <div className='h-6 w-0.5 bg-purple-200 dark:bg-purple-800' />
                  </div>

                  {/* Joined 2 */}
                  <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900'>
                    <div className='mb-2 flex items-center gap-2'>
                      <span className='text-xs'>🌱</span>
                      <span className='text-xs font-semibold text-purple-600 dark:text-purple-400'>
                        Joined the ritual
                      </span>
                    </div>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      "I also did my breathing ritual! Feeling calm and
                      centered"
                    </p>
                  </div>

                  <div className='pt-2 text-center'>
                    <p className='text-sm font-semibold text-purple-700 dark:text-purple-300'>
                      Ritual participation is growing! 🌱
                    </p>
                  </div>
                </div>
              </div>
              <ul className='space-y-2 text-gray-600 dark:text-gray-400'>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400' />
                  <span>View the ritual to see everyone who joined</span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400' />
                  <span>See how rituals spread through the community</span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400' />
                  <span>
                    Track your ritual participation and inspire others
                  </span>
                </li>
              </ul>
            </section>
          </div>

          {/* Key Differences */}
          <section className='mb-12 rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
              Key Differences
            </h2>
            <div className='grid gap-6 md:grid-cols-2'>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900'>
                <h3 className='mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
                  <Heart className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                  Reactions
                </h3>
                <ul className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                  <li>• Quick emotional feedback</li>
                  <li>• No action required</li>
                  <li>• Shows appreciation</li>
                  <li>• Three types: Inspired, Grateful, Sent Love</li>
                </ul>
              </div>
              <div className='rounded-lg border-2 border-purple-300 bg-purple-50 p-6 dark:border-purple-700 dark:bg-purple-900/20'>
                <h3 className='mb-3 flex items-center gap-2 text-lg font-semibold text-purple-900 dark:text-purple-100'>
                  <span className='text-xl'>🌱</span>
                  Join This Ritual
                </h3>
                <ul className='space-y-2 text-sm text-purple-700 dark:text-purple-300'>
                  <li>• Participate in the ritual yourself</li>
                  <li>• Share your ritual participation</li>
                  <li>• Connects you to the ritual community</li>
                  <li>• Builds visible ritual participation chains</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Flow */}
          <section className='mb-12 rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
              User Flow Examples
            </h2>
            <div className='space-y-6'>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900'>
                <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
                  Reacting to a Ritual Participation
                </h3>
                <ol className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>
                      1.
                    </span>
                    <span>
                      You see a ritual participation that resonates with you
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>
                      2.
                    </span>
                    <span>Click the "React" button</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>
                      3.
                    </span>
                    <span>
                      Select: Inspired ✨, Grateful 🙏, or Sent Love 💚
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>
                      4.
                    </span>
                    <span>Your reaction is recorded instantly</span>
                  </li>
                </ol>
              </div>

              <div className='rounded-lg border-2 border-purple-300 bg-purple-50 p-6 dark:border-purple-700 dark:bg-purple-900/20'>
                <h3 className='mb-3 text-lg font-semibold text-purple-900 dark:text-purple-100'>
                  Joining a Ritual
                </h3>
                <ol className='space-y-2 text-sm text-purple-700 dark:text-purple-300'>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>
                      1.
                    </span>
                    <span>You see a ritual you want to participate in</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>
                      2.
                    </span>
                    <span>Click "Join This Ritual" button</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>
                      3.
                    </span>
                    <span>You're redirected to the ritual page</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>
                      4.
                    </span>
                    <span>
                      Complete the ritual and share your participation
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>
                      5.
                    </span>
                    <span>Your participation is shared with the community</span>
                  </li>
                </ol>
              </div>

              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900'>
                <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
                  Viewing a Ritual
                </h3>
                <ol className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-teal-600 dark:text-teal-400'>
                      1.
                    </span>
                    <span>
                      Click "View ritual" or see ritual participations
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-teal-600 dark:text-teal-400'>
                      2.
                    </span>
                    <span>
                      See the chain visualization at /impact/[id]/ripple
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-teal-600 dark:text-teal-400'>
                      3.
                    </span>
                    <span>View the original action + all joined actions</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-teal-600 dark:text-teal-400'>
                      4.
                    </span>
                    <span>See clear social proof of participation</span>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className='rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 p-8 text-center dark:border-purple-700 dark:from-purple-900/20 dark:to-pink-900/20'>
            <h2 className='mb-4 text-2xl font-bold text-gray-900 dark:text-white'>
              Ready to Get Started?
            </h2>
            <p className='mb-6 text-gray-700 dark:text-gray-300'>
              Join our community and start creating ripples of positive impact
              today.
            </p>
            <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
              {user ? (
                <Link href='/home'>
                  <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700'>
                    Go to Community Feed
                    <ArrowRight className='h-5 w-5' />
                  </a>
                </Link>
              ) : (
                <Link href='/login'>
                  <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700'>
                    Sign In to Get Started
                    <ArrowRight className='h-5 w-5' />
                  </a>
                </Link>
              )}
              <Link href='/'>
                <a className='inline-flex items-center gap-2 rounded-full border-2 border-purple-600 px-6 py-3 text-base font-semibold text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20'>
                  Back to Home
                </a>
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    </>
  );
}
