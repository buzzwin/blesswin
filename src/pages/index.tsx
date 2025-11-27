import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Heart,
  ArrowRight,
  Users,
  Sparkles,
  BookOpen,
  HandHeart
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

  const handleSignIn = (): void => {
    void router.push('/login');
  };

  const handleGetInvolved = (): void => {
    void router.push('/login');
  };

  const handleSeeStories = (): void => {
    void router.push('/blog');
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
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link href='https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Inter:wght@400;500;600;700&display=swap' rel='stylesheet' />
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
                <button
                  onClick={handleSeeStories}
                  className='rounded-full border-2 border-gray-900 bg-white px-8 py-4 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white dark:border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-200 dark:hover:text-gray-900'
                >
                  See Real Stories
                </button>
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
