import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Heart,
  ArrowRight,
  Users,
  Sparkles,
  BookOpen,
  HandHeart,
  Loader2
} from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { Button } from '@components/ui/button-shadcn';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import { ImpactCard } from '@components/home/impact-card';
import { StoryCard } from '@components/home/story-card';
import { CurrentEvents } from '@components/home/current-events';
import { YouTubeVideos } from '@components/home/youtube-videos';
import { siteURL } from '@lib/env';
import Head from 'next/head';

export default function Home(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const handleRouteChangeStart = (): void => {
      setNavigating(true);
    };
    const handleRouteChangeComplete = (): void => {
      setNavigating(false);
    };
    const handleRouteChangeError = (): void => {
      setNavigating(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  const handleSignIn = (): void => {
    void router.push('/login');
  };

  const handleGetInvolved = (): void => {
    if (user) {
      void router.push('/home');
    } else {
      void router.push('/login');
    }
  };

  const impactAreas = [
    {
      title: 'Amplify Stories',
      description: 'We share authentic human stories that inspire action and create meaningful connections.',
      icon: <BookOpen className='h-6 w-6' />,
      color: 'earth' as const,
      onClick: () => void router.push('/blog')
    },
    {
      title: 'Build Community',
      description: 'Connect with like-minded individuals committed to making a positive impact.',
      icon: <Users className='h-6 w-6' />,
      color: 'sage' as const,
      onClick: () => void router.push('/login')
    },
    {
      title: 'Inspire Action',
      description: 'Turn inspiration into action with tools and resources for meaningful change.',
      icon: <Sparkles className='h-6 w-6' />,
      color: 'sky' as const,
      onClick: () => void router.push('/login')
    },
    {
      title: 'Support Wellness',
      description: 'Promote mental health, mindfulness, and holistic well-being for all.',
      icon: <HandHeart className='h-6 w-6' />,
      color: 'terracotta' as const,
      onClick: () => void router.push('/yoga')
    }
  ];

  const featuredStories = [
    {
      title: 'How One Community Transformed Their Neighborhood',
      excerpt: 'A small group of neighbors came together to create a community garden, bringing fresh food and hope to their area.',
      author: 'Sarah Chen',
      href: '/blog'
    },
    {
      title: 'The Power of Small Acts of Kindness',
      excerpt: 'Discover how simple gestures can create ripple effects of positivity and change.',
      author: 'Marcus Johnson',
      href: '/blog'
    },
    {
      title: 'Finding Purpose Through Service',
      excerpt: 'One person\'s journey from feeling lost to finding meaning through helping others.',
      author: 'Elena Rodriguez',
      href: '/blog'
    }
  ];

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Buzzwin',
    description:
      'A storytelling studio that amplifies good causes',
    url: siteURL || 'https://Buzzwin.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${
          siteURL || 'https://Buzzwin.com'
        }/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Buzzwin',
      description: 'Promoting world peace through individual transformation',
      url: siteURL || 'https://Buzzwin.com'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    }
  };

  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Buzzwin',
    description:
      'A storytelling studio that amplifies good causes',
    url: siteURL || 'https://Buzzwin.com',
    logo: `${siteURL || 'https://Buzzwin.com'}/logo192.png`,
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      availableLanguage: ['English']
    }
  };

  return (
    <HomeLayout>
      <SEO
        title='Buzzwin - Empowering People. One Small Action at a Time.'
        description='A storytelling studio that amplifies good causes. We create and share stories that inspire positive change, wellness, and harmony in the world.'
        keywords='social good, community impact, positive change, wellness, storytelling, human stories, community building, social impact'
        structuredData={structuredData}
      />
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData)
          }}
        />
      </Head>

      {/* Hero Section - Full Screen */}
      <SectionShell className='bg-gradient-to-br from-cream to-sky/20'>
        <div className='mx-auto w-full max-w-4xl px-6'>
          <div className='text-center'>
              <h1 className='mb-6 text-4xl font-bold leading-[1.2] text-gray-900 dark:text-white md:text-5xl lg:text-6xl'>
                Empowering people.{' '}
                <span className='text-action'>One small action</span> at a time.
              </h1>
              <p className='mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300 md:text-xl lg:text-2xl'>
                We amplify stories of creativity, kindness, and community impact. 
                Join us in building a more hopeful world.
              </p>
              <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
                <button
                  onClick={handleGetInvolved}
                  className='rounded-full bg-action px-8 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80'
                >
                  Get Involved
                  <ArrowRight className='ml-2 inline h-4 w-4' />
                </button>
                <Link href='/real-stories'>
                  <a
                    onClick={() => setNavigating(true)}
                    className='inline-flex items-center justify-center rounded-full border-2 border-gray-900 bg-white px-8 py-4 text-base font-semibold text-gray-900 transition-all hover:bg-gray-900 hover:text-white dark:border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-200 dark:hover:text-gray-900'
                  >
                    {navigating ? (
                      <span className='flex items-center gap-2'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Loading...
                      </span>
                    ) : (
                      <>
                        See Real Stories
                        <ArrowRight className='ml-2 h-4 w-4' />
                      </>
                    )}
                  </a>
                </Link>
              </div>
            </div>
          </div>
      </SectionShell>

      {/* What We Do Section - Full Screen */}
      <SectionShell>
        <div className='mx-auto w-full max-w-6xl px-6'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl'>
              What We Do
            </h2>
            <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300'>
              We believe in the power of small actions to create big change. 
              Here's how we're making a difference.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {impactAreas.map((area, index) => (
              <ImpactCard
                key={index}
                title={area.title}
                description={area.description}
                icon={area.icon}
                color={area.color}
                onClick={area.onClick}
              />
            ))}
          </div>
        </div>
      </SectionShell>

      {/* Ripple System Section - Full Screen */}
      <SectionShell variant='dark'>
        <div className='mx-auto w-full max-w-6xl px-6'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl'>
              How Ripples Work
            </h2>
            <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300'>
              We don't just "like" posts here. We create ripples of real action.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            {/* Reactions */}
            <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
                  <span className='text-2xl'>✨</span>
                </div>
                <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                  Simple Reactions
                </h3>
              </div>
              <p className='mb-4 text-gray-600 dark:text-gray-400'>
                Show your appreciation with quick reactions:
              </p>
              <ul className='space-y-2 text-sm text-gray-700 dark:text-gray-300'>
                <li className='flex items-center gap-2'>
                  <span>✨</span>
                  <span><strong>Inspired</strong> - This moved you</span>
                </li>
                <li className='flex items-center gap-2'>
                  <span>🙏</span>
                  <span><strong>Grateful</strong> - You're thankful</span>
                </li>
                <li className='flex items-center gap-2'>
                  <span>💚</span>
                  <span><strong>Sent Love</strong> - You care</span>
                </li>
              </ul>
            </div>

            {/* Joined You */}
            <div className='rounded-xl border-2 border-purple-300 bg-purple-50 p-6 dark:border-purple-700 dark:bg-purple-900/20'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-800'>
                  <span className='text-2xl'>🌱</span>
                </div>
                <h3 className='text-xl font-bold text-purple-900 dark:text-purple-100'>
                  Joined You
                </h3>
              </div>
              <p className='mb-4 text-purple-800 dark:text-purple-200'>
                <strong>This is different.</strong> When you click "Joined You", you're not just reacting—you're committing to do the same action yourself.
              </p>
              <ul className='space-y-2 text-sm text-purple-700 dark:text-purple-300'>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5'>✓</span>
                  <span>Creates your own impact moment</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5'>✓</span>
                  <span>Links to the original action</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5'>✓</span>
                  <span>Builds visible chains of impact</span>
                </li>
              </ul>
              <div className='mt-4 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50'>
                <p className='text-xs font-medium text-purple-900 dark:text-purple-100'>
                  💡 Example: Someone posts "Cooked a healthy meal for my family". You click "Joined You" and share your own version. Now there's a chain showing how this action spread!
                </p>
              </div>
            </div>
          </div>

          {/* Chain Visualization */}
          <div className='mt-12 rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800'>
            <h3 className='mb-6 text-center text-xl font-bold text-gray-900 dark:text-white'>
              See the Chain in Action
            </h3>
            <div className='flex flex-col items-center gap-4'>
              {/* Original */}
              <div className='w-full max-w-md rounded-lg border-2 border-purple-300 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20'>
                <div className='mb-2 text-xs font-semibold uppercase text-purple-600 dark:text-purple-400'>
                  Original Action
                </div>
                <p className='text-sm text-purple-900 dark:text-purple-100'>
                  "Cooked a healthy meal for my family"
                </p>
              </div>
              
              {/* Connector */}
              <div className='h-8 w-0.5 bg-purple-200 dark:bg-purple-800' />
              
              {/* Joined 1 */}
              <div className='w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900'>
                <div className='mb-2 flex items-center gap-2'>
                  <span className='text-xs'>🌱</span>
                  <span className='text-xs font-semibold text-purple-600 dark:text-purple-400'>
                    Joined @originaluser
                  </span>
                </div>
                <p className='text-sm text-gray-900 dark:text-white'>
                  "I joined @originaluser in: Made a nutritious dinner tonight"
                </p>
              </div>

              {/* Connector */}
              <div className='h-8 w-0.5 bg-purple-200 dark:bg-purple-800' />

              {/* Joined 2 */}
              <div className='w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900'>
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

              <div className='mt-4 text-center'>
                <p className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Impact is spreading! 🌱
                </p>
              </div>
            </div>
          </div>

          {user && (
            <div className='mt-8 text-center'>
              <Link href='/home'>
                <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-purple-700'>
                  Start Creating Ripples
                  <ArrowRight className='h-4 w-4' />
                </a>
              </Link>
            </div>
          )}
        </div>
      </SectionShell>

      {/* Real Stories Section - Full Screen */}
      <SectionShell variant='dark'>
        <div className='mx-auto w-full max-w-6xl px-6'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl'>
              Real Stories, Real Impact
            </h2>
            <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300'>
              Discover how people are creating positive change in their communities.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {featuredStories.map((story, index) => (
              <StoryCard
                key={index}
                title={story.title}
                excerpt={story.excerpt}
                author={story.author}
                href={story.href}
              />
            ))}
          </div>

          <div className='mt-12 text-center'>
            <Link href='/blog'>
              <a className='inline-flex items-center gap-2 text-base font-semibold text-action hover:underline'>
                Read More Stories
                <ArrowRight className='h-4 w-4' />
              </a>
            </Link>
          </div>
        </div>
      </SectionShell>

      {/* Current Events Section - Full Screen */}
      <SectionShell>
        <div className='mx-auto w-full max-w-4xl px-6'>
          <CurrentEvents />
        </div>
      </SectionShell>

      {/* YouTube Videos Section - Full Screen */}
      <SectionShell variant='dark'>
        <div className='mx-auto w-full max-w-5xl px-6'>
          <YouTubeVideos category='all' limit={6} />
        </div>
      </SectionShell>

      {/* Final CTA Section - Full Screen */}
      {!user && (
        <SectionShell>
          <div className='mx-auto w-full max-w-3xl px-6 text-center'>
            <div className='mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-action text-white'>
              <Heart className='h-8 w-8' />
            </div>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl'>
              Ready to Make a Difference?
            </h2>
            <p className='mb-10 text-lg leading-relaxed text-gray-700 dark:text-gray-300 md:text-xl'>
              Join our community of changemakers. Together, we can create a more hopeful, 
              connected, and compassionate world.
            </p>
            <button
              onClick={handleSignIn}
              className='rounded-full bg-action px-10 py-5 text-lg font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80'
            >
              Get Started Today
            </button>
          </div>
        </SectionShell>
      )}
    </HomeLayout>
  );
}
