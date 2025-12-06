import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Heart,
  Users,
  Sparkles,
  BookOpen,
  HandHeart,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import { ImpactCard } from '@components/home/impact-card';
import { CurrentEvents } from '@components/home/current-events';
import { YouTubeVideos } from '@components/home/youtube-videos';
import { HeroSection } from '@components/home/hero-section';
import { RippleSystem } from '@components/home/ripple-system';
import { RealStoriesSection } from '@components/home/real-stories-section';
import { DailyRitualsSection } from '@components/home/daily-rituals-section';
import { siteURL } from '@lib/env';
import Head from 'next/head';

export default function Home(): JSX.Element {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  // Use auth hook - must be called unconditionally
  // The AuthContextProvider wraps all pages in _app.tsx
  const authContext = useAuth();
  const user = authContext.user;

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
      void router.push('/rituals');
    } else {
      void router.push('/login');
    }
  };

  const impactAreas = [
    {
      title: 'Amplify Stories',
      description:
        'We share authentic human stories that inspire action and create meaningful connections.',
      icon: <BookOpen className='h-6 w-6' />,
      color: 'earth' as const,
      onClick: () => void router.push('/blog')
    },
    {
      title: 'Build Community',
      description:
        'Connect with like-minded individuals committed to making a positive impact.',
      icon: <Users className='h-6 w-6' />,
      color: 'sage' as const,
      onClick: () => void router.push('/login')
    },
    {
      title: 'Inspire Action',
      description:
        'Turn inspiration into action with tools and resources for meaningful change.',
      icon: <Sparkles className='h-6 w-6' />,
      color: 'sky' as const,
      onClick: () => void router.push('/login')
    },
    {
      title: 'Support Wellness',
      description:
        'Promote mental health, mindfulness, and holistic well-being for all.',
      icon: <HandHeart className='h-6 w-6' />,
      color: 'terracotta' as const,
      onClick: () => void router.push('/yoga')
    }
  ];

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Buzzwin',
    description: 'A storytelling studio that amplifies good causes',
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
    description: 'A storytelling studio that amplifies good causes',
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

      {/* Hero Section */}
      <HeroSection
        onGetInvolved={handleGetInvolved}
        onSeeRealStories={() => setNavigating(true)}
        navigating={navigating}
      />

      {/* What We Do Section - Full Screen */}
      <SectionShell>
        <div className='mx-auto w-full max-w-6xl px-6'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl lg:text-5xl'>
              What We Do
            </h2>
            <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl'>
              We believe in the power of small actions to create big change.
              Here&apos;s how we&apos;re making a difference.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
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

      {/* Ripple System Section */}
      <RippleSystem user={user} />

      {/* How It Works Link */}
      <SectionShell>
        <div className='mx-auto w-full max-w-4xl px-6 text-center'>
          <p className='mb-4 text-lg text-gray-600 dark:text-gray-300'>
            Want to learn more about how reactions, joining, and ripples work?
          </p>
          <Link href='/how-it-works'>
            <a className='inline-flex items-center gap-2 rounded-full border-2 border-purple-600 px-6 py-3 text-base font-semibold text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20'>
              Learn How It Works
              <ArrowRight className='h-5 w-5' />
            </a>
          </Link>
        </div>
      </SectionShell>

      {/* Real Stories Section */}
      <RealStoriesSection />

      {/* Current Events Section - Full Screen */}
      <SectionShell>
        <div className='mx-auto w-full max-w-4xl px-6'>
          <CurrentEvents />
        </div>
      </SectionShell>

      {/* Daily Rituals Section */}
      <DailyRitualsSection user={user} onSignIn={handleSignIn} />

      {/* Wellness AI Pals Section */}
      <SectionShell variant='dark'>
        <div className='mx-auto w-full max-w-6xl px-6'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl lg:text-5xl'>
              Your Wellness Journey
            </h2>
            <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl'>
              Personalized AI companions to guide you through yoga, meditation,
              and harmony practices.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {/* Yoga Card */}
            <button
              onClick={() => void router.push('/yoga')}
              className='group rounded-2xl border-2 border-gray-200 bg-white p-8 text-left transition-all duration-300 hover:scale-105 hover:border-green-500 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'
            >
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg'>
                <span className='text-3xl'>🧘</span>
              </div>
              <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                Yoga AI Pal
              </h3>
              <p className='mb-4 text-gray-600 dark:text-gray-300'>
                Discover personalized yoga poses, sequences, and breathing
                techniques.
              </p>
              <span className='inline-flex items-center gap-2 text-green-600 transition-transform group-hover:translate-x-1 dark:text-green-400'>
                Start Practice
                <ArrowRight className='h-4 w-4' />
              </span>
            </button>

            {/* Meditation Card */}
            <button
              onClick={() => void router.push('/meditation')}
              className='group rounded-2xl border-2 border-gray-200 bg-white p-8 text-left transition-all duration-300 hover:scale-105 hover:border-purple-500 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'
            >
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg'>
                <span className='text-3xl'>🧘‍♀️</span>
              </div>
              <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                Meditation AI Pal
              </h3>
              <p className='mb-4 text-gray-600 dark:text-gray-300'>
                Deepen your meditation practice and cultivate present-moment
                awareness.
              </p>
              <span className='inline-flex items-center gap-2 text-purple-600 transition-transform group-hover:translate-x-1 dark:text-purple-400'>
                Begin Meditation
                <ArrowRight className='h-4 w-4' />
              </span>
            </button>

            {/* Harmony Card */}
            <button
              onClick={() => void router.push('/harmony')}
              className='group rounded-2xl border-2 border-gray-200 bg-white p-8 text-left transition-all duration-300 hover:scale-105 hover:border-teal-500 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'
            >
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg'>
                <span className='text-3xl'>☮️</span>
              </div>
              <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                Harmony AI Pal
              </h3>
              <p className='mb-4 text-gray-600 dark:text-gray-300'>
                Find balance and inner peace through personalized guidance.
              </p>
              <span className='inline-flex items-center gap-2 text-teal-600 transition-transform group-hover:translate-x-1 dark:text-teal-400'>
                Find Harmony
                <ArrowRight className='h-4 w-4' />
              </span>
            </button>
          </div>
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
        <SectionShell className='relative overflow-hidden bg-gradient-to-br from-action/5 via-hope/5 to-sky/5'>
          {/* Decorative elements */}
          <div className='absolute inset-0 overflow-hidden'>
            <div className='absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-action/10 to-hope/10 blur-3xl' />
          </div>

          <div className='relative mx-auto w-full max-w-3xl px-6 text-center'>
            <div className='mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-action to-hope shadow-lg shadow-action/25'>
              <Heart className='h-10 w-10 text-white' />
            </div>

            <h2 className='mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl lg:text-5xl'>
              Ready to Make a Difference?
            </h2>

            <p className='mb-10 text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl'>
              Join our community of changemakers. Together, we can create a more
              hopeful, connected, and compassionate world.
            </p>

            <button
              onClick={handleSignIn}
              className='group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-action to-hope px-10 py-5 text-lg font-semibold text-white shadow-xl shadow-action/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-action/40 active:scale-95'
            >
              <span className='relative z-10'>Get Started Today</span>
              <ArrowRight className='relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1' />
              <div className='absolute inset-0 bg-gradient-to-r from-hope to-action opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
            </button>
          </div>
        </SectionShell>
      )}
    </HomeLayout>
  );
}
