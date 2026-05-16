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
            <p className='mx-auto max-w-2xl text-lg text-gray-600 dark:text-[#9E8B76]'>
              A simple, powerful way to share ritual participation. Express
              yourself with reactions, join rituals to participate, and share
              your journey with the community.
            </p>
          </div>

          {/* Core Concepts */}
          <div className='mb-16 space-y-8'>
            {/* Ritual Sharing */}
            <section className='rounded-xl border border-gray-200 bg-[#faf8f4] p-8 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
              <div className='mb-6 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600'>
                  <Sparkles className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    1. Ritual Sharing
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-[#9E8B76]'>
                    Share your ritual participations
                  </p>
                </div>
              </div>
              <p className='mb-4 text-gray-700 dark:text-[#C4B5A0]'>
                Ritual Participations are when you complete and share rituals.
                When you finish a ritual, you can share your participation with
                the community to inspire others.
              </p>
              <ul className='space-y-2 text-gray-600 dark:text-[#9E8B76]'>
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
            <section className='rounded-xl border border-gray-200 bg-[#faf8f4] p-8 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
              <div className='mb-6 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600'>
                  <Heart className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    2. Reactions
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-[#9E8B76]'>
                    Quick emotional feedback
                  </p>
                </div>
              </div>
              <p className='mb-4 text-gray-700 dark:text-[#C4B5A0]'>
                Reactions are lightweight expressions of emotion. Click the
                "React" button on any ritual participation to show how it made
                you feel.
              </p>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='rounded-lg border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.06)] p-4 dark:border-[rgba(201,169,110,0.25)] dark:bg-[rgba(201,169,110,0.08)]'>
                  <div className='mb-2 text-2xl'>✨</div>
                  <h3 className='mb-1 font-semibold text-[#6b4f1a] dark:text-[#F5EFE6]'>
                    Inspired
                  </h3>
                  <p className='text-sm text-[#8a6520] dark:text-[#C9A96E]'>
                    This moved you
                  </p>
                </div>
                <div className='rounded-lg border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.06)] p-4 dark:border-[rgba(201,169,110,0.25)] dark:bg-[rgba(201,169,110,0.08)]'>
                  <div className='mb-2 text-2xl'>🙏</div>
                  <h3 className='mb-1 font-semibold text-[#6b4f1a] dark:text-[#F5EFE6]'>
                    Grateful
                  </h3>
                  <p className='text-sm text-[#8a6520] dark:text-[#C9A96E]'>
                    You're thankful
                  </p>
                </div>
                <div className='rounded-lg border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.06)] p-4 dark:border-[rgba(201,169,110,0.25)] dark:bg-[rgba(201,169,110,0.08)]'>
                  <div className='mb-2 text-2xl'>💚</div>
                  <h3 className='mb-1 font-semibold text-[#6b4f1a] dark:text-[#F5EFE6]'>
                    Sent Love
                  </h3>
                  <p className='text-sm text-[#8a6520] dark:text-[#C9A96E]'>
                    You care
                  </p>
                </div>
              </div>
            </section>

            {/* Join Rituals */}
            <section className='rounded-xl border-2 border-[rgba(201,169,110,0.4)] bg-[rgba(201,169,110,0.06)] p-8 dark:border-[rgba(201,169,110,0.3)] dark:bg-[rgba(201,169,110,0.08)]'>
              <div className='mb-6 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600'>
                  <span className='text-3xl'>🌱</span>
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-[#6b4f1a] dark:text-[#F5EFE6]'>
                    3. Join This Ritual
                  </h2>
                  <p className='text-sm text-[#8a6520] dark:text-[#C9A96E]'>
                    Participate in rituals and share your journey
                  </p>
                </div>
              </div>
              <p className='mb-4 text-[#7a5a18] dark:text-[#C4B5A0]'>
                <strong>This is different from reactions.</strong> When you join
                a ritual, you're committing to participate in that ritual
                yourself and share your participation with the community.
              </p>
              <div className='mb-4 space-y-3'>
                <div className='flex items-start gap-3 rounded-lg bg-white/50 p-3 dark:bg-[#231a10]'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-[#C9A96E] dark:text-[#C9A96E]' />
                  <div>
                    <p className='font-semibold text-[#6b4f1a] dark:text-[#F5EFE6]'>
                      Share Your Ritual Participation
                    </p>
                    <p className='text-sm text-[#8a6520] dark:text-[#C9A96E]'>
                      Complete the ritual and share your participation with the
                      community
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3 rounded-lg bg-white/50 p-3 dark:bg-[#231a10]'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-[#C9A96E] dark:text-[#C9A96E]' />
                  <div>
                    <p className='font-semibold text-[#6b4f1a] dark:text-[#F5EFE6]'>
                      Connects to the Ritual
                    </p>
                    <p className='text-sm text-[#8a6520] dark:text-[#C9A96E]'>
                      Your participation is linked to the ritual you joined
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3 rounded-lg bg-white/50 p-3 dark:bg-[#231a10]'>
                  <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-[#C9A96E] dark:text-[#C9A96E]' />
                  <div>
                    <p className='font-semibold text-[#6b4f1a] dark:text-[#F5EFE6]'>
                      Inspires Others
                    </p>
                    <p className='text-sm text-[#8a6520] dark:text-[#C9A96E]'>
                      Your participation inspires others to join the ritual too
                    </p>
                  </div>
                </div>
              </div>
              <div className='rounded-lg border border-[rgba(201,169,110,0.3)] bg-[#faf8f4] p-4 dark:border-[rgba(201,169,110,0.25)] dark:bg-[#1c1510]'>
                <p className='text-sm font-medium text-[#6b4f1a] dark:text-[#F5EFE6]'>
                  💡 Example: Someone shares "Just finished my breathing
                  ritual". You click "Join This Ritual" to participate in the
                  same ritual, then share your own participation: "Completed my
                  breathing practice this morning". Now you're both part of the
                  same ritual community!
                </p>
              </div>
            </section>

            {/* Ripples */}
            <section className='rounded-xl border border-gray-200 bg-[#faf8f4] p-8 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
              <div className='mb-6 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600'>
                  <TrendingUp className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    4. Ripples
                  </h2>
                  <p className='text-sm text-gray-600 dark:text-[#9E8B76]'>
                    The chain visualization of participation
                  </p>
                </div>
              </div>
              <p className='mb-4 text-gray-700 dark:text-[#C4B5A0]'>
                A Ripple shows how a ritual spreads through the community. When
                someone says "This ritual has 23 participants," it means 23
                people have joined and participated in that ritual.
              </p>
              <div className='mb-6 rounded-lg border-2 border-[rgba(201,169,110,0.4)] bg-[rgba(201,169,110,0.06)] p-6 dark:border-[rgba(201,169,110,0.3)] dark:bg-[rgba(201,169,110,0.08)]'>
                <h3 className='mb-4 text-lg font-semibold text-[#6b4f1a] dark:text-[#F5EFE6]'>
                  See the Ritual Community in Action
                </h3>
                <div className='space-y-4'>
                  {/* Original */}
                  <div className='rounded-lg border-2 border-[rgba(201,169,110,0.4)] bg-[#faf8f4] p-4 dark:border-[rgba(201,169,110,0.3)] dark:bg-[#1c1510]'>
                    <div className='mb-2 text-xs font-semibold uppercase text-[#C9A96E] dark:text-[#C9A96E]'>
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
                  <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
                    <div className='mb-2 flex items-center gap-2'>
                      <span className='text-xs'>🌱</span>
                      <span className='text-xs font-semibold text-[#C9A96E] dark:text-[#C9A96E]'>
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
                  <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
                    <div className='mb-2 flex items-center gap-2'>
                      <span className='text-xs'>🌱</span>
                      <span className='text-xs font-semibold text-[#C9A96E] dark:text-[#C9A96E]'>
                        Joined the ritual
                      </span>
                    </div>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      "I also did my breathing ritual! Feeling calm and
                      centered"
                    </p>
                  </div>

                  <div className='pt-2 text-center'>
                    <p className='text-sm font-semibold text-[#8a6520] dark:text-[#C9A96E]'>
                      Ritual participation is growing! 🌱
                    </p>
                  </div>
                </div>
              </div>
              <ul className='space-y-2 text-gray-600 dark:text-[#9E8B76]'>
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
          <section className='mb-12 rounded-xl border border-gray-200 bg-[#faf8f4] p-8 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
              Key Differences
            </h2>
            <div className='grid gap-6 md:grid-cols-2'>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
                <h3 className='mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
                  <Heart className='h-5 w-5 text-[#C9A96E] dark:text-[#C9A96E]' />
                  Reactions
                </h3>
                <ul className='space-y-2 text-sm text-gray-600 dark:text-[#9E8B76]'>
                  <li>• Quick emotional feedback</li>
                  <li>• No action required</li>
                  <li>• Shows appreciation</li>
                  <li>• Three types: Inspired, Grateful, Sent Love</li>
                </ul>
              </div>
              <div className='rounded-lg border-2 border-[rgba(201,169,110,0.4)] bg-[rgba(201,169,110,0.06)] p-6 dark:border-[rgba(201,169,110,0.3)] dark:bg-[rgba(201,169,110,0.08)]'>
                <h3 className='mb-3 flex items-center gap-2 text-lg font-semibold text-[#6b4f1a] dark:text-[#F5EFE6]'>
                  <span className='text-xl'>🌱</span>
                  Join This Ritual
                </h3>
                <ul className='space-y-2 text-sm text-[#8a6520] dark:text-[#C9A96E]'>
                  <li>• Participate in the ritual yourself</li>
                  <li>• Share your ritual participation</li>
                  <li>• Connects you to the ritual community</li>
                  <li>• Builds visible ritual participation chains</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Flow */}
          <section className='mb-12 rounded-xl border border-gray-200 bg-[#faf8f4] p-8 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
              User Flow Examples
            </h2>
            <div className='space-y-6'>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
                <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
                  Reacting to a Ritual Participation
                </h3>
                <ol className='space-y-2 text-sm text-gray-600 dark:text-[#9E8B76]'>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-[#C9A96E] dark:text-[#C9A96E]'>
                      1.
                    </span>
                    <span>
                      You see a ritual participation that resonates with you
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-[#C9A96E] dark:text-[#C9A96E]'>
                      2.
                    </span>
                    <span>Click the "React" button</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-[#C9A96E] dark:text-[#C9A96E]'>
                      3.
                    </span>
                    <span>
                      Select: Inspired ✨, Grateful 🙏, or Sent Love 💚
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-[#C9A96E] dark:text-[#C9A96E]'>
                      4.
                    </span>
                    <span>Your reaction is recorded instantly</span>
                  </li>
                </ol>
              </div>

              <div className='rounded-lg border-2 border-[rgba(201,169,110,0.4)] bg-[rgba(201,169,110,0.06)] p-6 dark:border-[rgba(201,169,110,0.3)] dark:bg-[rgba(201,169,110,0.08)]'>
                <h3 className='mb-3 text-lg font-semibold text-[#6b4f1a] dark:text-[#F5EFE6]'>
                  Joining a Ritual
                </h3>
                <ol className='space-y-2 text-sm text-[#8a6520] dark:text-[#C9A96E]'>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-[#C9A96E] dark:text-[#C9A96E]'>
                      1.
                    </span>
                    <span>You see a ritual you want to participate in</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-[#C9A96E] dark:text-[#C9A96E]'>
                      2.
                    </span>
                    <span>Click "Join This Ritual" button</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-[#C9A96E] dark:text-[#C9A96E]'>
                      3.
                    </span>
                    <span>You're redirected to the ritual page</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-[#C9A96E] dark:text-[#C9A96E]'>
                      4.
                    </span>
                    <span>
                      Complete the ritual and share your participation
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='font-semibold text-[#C9A96E] dark:text-[#C9A96E]'>
                      5.
                    </span>
                    <span>Your participation is shared with the community</span>
                  </li>
                </ol>
              </div>

              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
                <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
                  Viewing a Ritual
                </h3>
                <ol className='space-y-2 text-sm text-gray-600 dark:text-[#9E8B76]'>
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
          <div className='rounded-xl border-2 border-[rgba(201,169,110,0.4)] bg-gradient-to-br from-purple-50 to-pink-50 p-8 text-center dark:border-[rgba(201,169,110,0.3)] dark:from-purple-900/20 dark:to-pink-900/20'>
            <h2 className='mb-4 text-2xl font-bold text-gray-900 dark:text-white'>
              Ready to Get Started?
            </h2>
            <p className='mb-6 text-gray-700 dark:text-[#C4B5A0]'>
              Join our community and start creating ripples of positive impact
              today.
            </p>
            <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
              {user ? (
                <Link href='/home'>
                  <a className='inline-flex items-center gap-2 rounded-full bg-[#C97D60] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#B56540] dark:bg-[#C97D60] dark:hover:bg-[#B56540]'>
                    Go to Community Feed
                    <ArrowRight className='h-5 w-5' />
                  </a>
                </Link>
              ) : (
                <Link href='/login'>
                  <a className='inline-flex items-center gap-2 rounded-full bg-[#C97D60] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#B56540] dark:bg-[#C97D60] dark:hover:bg-[#B56540]'>
                    Sign In to Get Started
                    <ArrowRight className='h-5 w-5' />
                  </a>
                </Link>
              )}
              <Link href='/'>
                <a className='inline-flex items-center gap-2 rounded-full border-2 border-[#C9A96E] px-6 py-3 text-base font-semibold text-[#C9A96E] transition-colors hover:bg-[rgba(201,169,110,0.06)] dark:border-[rgba(201,169,110,0.45)] dark:text-[#C9A96E] dark:hover:bg-[rgba(201,169,110,0.06)]'>
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
