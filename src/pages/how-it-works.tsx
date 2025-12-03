import Link from 'next/link';
import { ArrowRight, Sparkles, Heart, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { PublicLayout } from '@components/layout/pub_layout';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { useAuth } from '@lib/context/auth-context';

export default function HowItWorksPage(): JSX.Element {
  const { user } = useAuth();

  return (
    <>
      <SEO
        title='How It Works - Reactions, Join, and Ripples | Buzzwin'
        description='Learn how Buzzwin works: express yourself with reactions, join actions to create impact, and watch ripples spread through our community.'
      />
      <PublicLayout
        title='How It Works - Buzzwin'
        description='Learn how Buzzwin works: express yourself with reactions, join actions to create impact, and watch ripples spread.'
      >
        <MainHeader title='How It Works' />
        <div className='mx-auto min-h-screen max-w-4xl bg-main-background px-4 py-12 dark:bg-dark-background'>
          {/* Hero Section */}
          <div className='mb-12 text-center'>
            <h1 className='mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl'>
              How Buzzwin Works
            </h1>
            <p className='mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
              A simple, powerful way to amplify good causes. Express yourself with reactions, join actions to create impact, and watch ripples spread.
            </p>
          </div>

          {/* Core Concepts */}
          <div className='mb-16 space-y-8'>
            {/* Impact Moments */}
            <section className='rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-6 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600'>
                  <Sparkles className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    1. Impact Moments
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    The foundation of everything
                  </p>
                </div>
              </div>
              <p className='mb-4 text-gray-700 dark:text-gray-300'>
                Impact Moments are actions you've taken to make a positive difference. They can be big or small—from cooking a healthy meal to volunteering at a shelter.
              </p>
              <ul className='space-y-2 text-gray-600 dark:text-gray-400'>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400' />
                  <span>Share what you did and how it made you feel</span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400' />
                  <span>Tag your moment (Mind, Body, Relationships, Nature, Community)</span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400' />
                  <span>Add photos or mood check-ins to track your journey</span>
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
                Reactions are lightweight expressions of emotion. Click the "React" button on any Impact Moment to show how it made you feel.
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

            {/* Join */}
            <section className='rounded-xl border-2 border-purple-300 bg-purple-50 p-8 dark:border-purple-700 dark:bg-purple-900/20'>
              <div className='mb-6 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600'>
                  <span className='text-3xl'>🌱</span>
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-purple-900 dark:text-purple-100'>
                    3. Join This Action
                  </h2>
                  <p className='text-sm text-purple-700 dark:text-purple-300'>
                    Create your own impact moment
                  </p>
                </div>
              </div>
              <p className='mb-4 text-purple-800 dark:text-purple-200'>
                <strong>This is different from reactions.</strong> When you join an action, you're committing to do the same thing yourself and creating a ripple in the chain.
              </p>
              <div className='mb-4 space-y-3'>
                <div className='flex items-start gap-3 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400' />
                  <div>
                    <p className='font-semibold text-purple-900 dark:text-purple-100'>
                      Creates Your Own Impact Moment
                    </p>
                    <p className='text-sm text-purple-700 dark:text-purple-300'>
                      Share how you're doing the same action in your own way
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400' />
                  <div>
                    <p className='font-semibold text-purple-900 dark:text-purple-100'>
                      Links to the Original Action
                    </p>
                    <p className='text-sm text-purple-700 dark:text-purple-300'>
                      Your moment is connected to the one that inspired you
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400' />
                  <div>
                    <p className='font-semibold text-purple-900 dark:text-purple-100'>
                      Extends the Ripple
                    </p>
                    <p className='text-sm text-purple-700 dark:text-purple-300'>
                      Your participation becomes part of the ripple chain
                    </p>
                  </div>
                </div>
              </div>
              <div className='rounded-lg border border-purple-200 bg-white p-4 dark:border-purple-800 dark:bg-gray-800'>
                <p className='text-sm font-medium text-purple-900 dark:text-purple-100'>
                  💡 Example: Someone posts "Cooked a healthy meal for my family". You click "Join This Action" and share your own version: "Made a nutritious dinner tonight with fresh vegetables". Now there's a ripple showing how this action spread!
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
                A Ripple is the visual chain showing how an action spread. When someone says "This moment has 23 ripples," it means 23 people joined that action.
              </p>
              <div className='mb-6 rounded-lg border-2 border-purple-300 bg-purple-50 p-6 dark:border-purple-700 dark:bg-purple-900/20'>
                <h3 className='mb-4 text-lg font-semibold text-purple-900 dark:text-purple-100'>
                  See the Ripple in Action
                </h3>
                <div className='space-y-4'>
                  {/* Original */}
                  <div className='rounded-lg border-2 border-purple-300 bg-white p-4 dark:border-purple-700 dark:bg-gray-800'>
                    <div className='mb-2 text-xs font-semibold uppercase text-purple-600 dark:text-purple-400'>
                      Original Action
                    </div>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      "Cooked a healthy meal for my family"
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
                        Joined @originaluser
                      </span>
                    </div>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      "Made a nutritious dinner tonight"
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
                        Joined @originaluser
                      </span>
                    </div>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      "I also cooked healthy! Made a big batch of soup"
                    </p>
                  </div>

                  <div className='pt-2 text-center'>
                    <p className='text-sm font-semibold text-purple-700 dark:text-purple-300'>
                      Impact is spreading! 🌱
                    </p>
                  </div>
                </div>
              </div>
              <ul className='space-y-2 text-gray-600 dark:text-gray-400'>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400' />
                  <span>View the ripple to see everyone who joined</span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400' />
                  <span>See how actions spread through the community</span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400' />
                  <span>Track your impact and inspire others</span>
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
                  Join This Action
                </h3>
                <ul className='space-y-2 text-sm text-purple-700 dark:text-purple-300'>
                  <li>• Creates your own Impact Moment</li>
                  <li>• Requires action and commitment</li>
                  <li>• Extends the ripple chain</li>
                  <li>• Builds visible chains of impact</li>
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
                  Reacting to an Impact Moment
                </h3>
                <ol className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>1.</span>
                    <span>You see an Impact Moment that resonates with you</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>2.</span>
                    <span>Click the "React" button</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>3.</span>
                    <span>Select: Inspired ✨, Grateful 🙏, or Sent Love 💚</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>4.</span>
                    <span>Your reaction is recorded instantly</span>
                  </li>
                </ol>
              </div>

              <div className='rounded-lg border-2 border-purple-300 bg-purple-50 p-6 dark:border-purple-700 dark:bg-purple-900/20'>
                <h3 className='mb-3 text-lg font-semibold text-purple-900 dark:text-purple-100'>
                  Joining an Action
                </h3>
                <ol className='space-y-2 text-sm text-purple-700 dark:text-purple-300'>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>1.</span>
                    <span>You see an Impact Moment you want to do yourself</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>2.</span>
                    <span>Click "Join This Action" button</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>3.</span>
                    <span>You're redirected to the join page</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>4.</span>
                    <span>Create your own Impact Moment describing how you're joining</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-purple-600 dark:text-purple-400'>5.</span>
                    <span>You're redirected to the ripple page to see your join</span>
                  </li>
                </ol>
              </div>

              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900'>
                <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
                  Viewing a Ripple
                </h3>
                <ol className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-teal-600 dark:text-teal-400'>1.</span>
                    <span>Click "View ripple" or "X ripples" on an Impact Moment</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-teal-600 dark:text-teal-400'>2.</span>
                    <span>See the chain visualization at /impact/[id]/ripple</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-teal-600 dark:text-teal-400'>3.</span>
                    <span>View the original action + all joined actions</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-teal-600 dark:text-teal-400'>4.</span>
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
              Join our community and start creating ripples of positive impact today.
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

