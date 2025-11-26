import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Heart,
  ArrowRight,
  Flower2,
  Moon,
  Waves,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { Button } from '@components/ui/button-shadcn';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import { WellnessAgentCard } from '@components/wellness/wellness-agent-card';
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

  const wellnessAgents = [
    {
      type: 'yoga' as const,
      title: 'Yoga AI Pal',
      description:
        'Find your flow and cultivate inner peace through mindful movement.',
      icon: Flower2,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      type: 'meditation' as const,
      title: 'Meditation & Mindfulness AI Pal',
      description: 'Deepen your meditation practice and cultivate present-moment awareness.',
      icon: Moon,
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      type: 'harmony' as const,
      title: 'Harmony AI Pal',
      description: 'Find balance and spread positive energy to the world.',
      icon: Waves,
      gradient: 'from-teal-500 to-cyan-600'
    }
  ];

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Buzzwin',
    description:
      'AI-powered wellness platform promoting world peace, meditation, mindfulness, yoga, and harmony',
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
      'AI-powered wellness platform dedicated to promoting world peace, good thoughts, happiness, and positive vibes',
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
        title='Buzzwin - AI-Powered Wellness Platform for World Peace'
        description='Discover AI pals that guide you through yoga, meditation & mindfulness, and harmony. Join our community promoting world peace, good thoughts, happiness, and positive vibes.'
        keywords='yoga, meditation, mindfulness, world peace, AI wellness, harmony, positive vibes, mental health, spiritual growth, inner peace'
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

      {/* AI Agents Section */}
      <div id='agents'>
        <SectionShell className='py-32'>
        <div className='mx-auto max-w-6xl px-6'>
          <div className='mb-20 text-center'>
            <h2 className='mb-4 text-3xl font-light text-gray-900 dark:text-white sm:text-4xl'>
              Your AI Wellness Pals
            </h2>
            <p className='mx-auto max-w-2xl text-lg font-light text-gray-600 dark:text-gray-300'>
              Discover personalized guidance for your wellness journey
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            {wellnessAgents.map((agent) => (
              <WellnessAgentCard
                key={agent.type}
                agentType={agent.type}
                title={agent.title}
                description={agent.description}
                icon={agent.icon}
                gradient={agent.gradient}
                onLoginRequest={handleSignIn}
              />
            ))}
          </div>

          {/* Disclaimer Notice */}
          <div className='mt-12 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center dark:border-yellow-800 dark:bg-yellow-900/20'>
            <p className='text-sm text-yellow-800 dark:text-yellow-200'>
              <strong>Disclaimer:</strong> Buzzwin does not provide medical
              advice. Consult a healthcare professional before starting any
              wellness practice.{' '}
              <Link
                href='/disclaimer'
                className='underline hover:text-yellow-900 dark:hover:text-yellow-100'
              >
                Read full disclaimer
              </Link>
            </p>
          </div>
        </div>
        </SectionShell>
      </div>

      {/* Current Events Section */}
      <SectionShell className='py-20'>
        <div className='mx-auto max-w-4xl px-6'>
          <CurrentEvents />
        </div>
      </SectionShell>

      {/* YouTube Videos Section */}
      <SectionShell variant='dark' className='py-20'>
        <div className='mx-auto max-w-6xl px-6'>
          <YouTubeVideos category='all' limit={6} />
        </div>
      </SectionShell>

      {/* Simple CTA Section */}
      {!user && (
        <SectionShell variant='dark' className='py-32'>
          <div className='mx-auto max-w-3xl px-6 text-center'>
            <h2 className='mb-6 text-3xl font-light text-gray-900 dark:text-white sm:text-4xl'>
              Ready to begin?
            </h2>
            <p className='mb-10 text-lg font-light text-gray-600 dark:text-gray-300'>
              Join our community dedicated to peace, wellness, and positive
              transformation.
            </p>
            <Button
              onClick={handleSignIn}
              size='lg'
              className='rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 px-12 py-6 text-lg font-medium text-white shadow-lg transition-all hover:shadow-xl'
            >
              <Heart className='mr-3 h-5 w-5' />
              Start Your Journey
              <ArrowRight className='ml-3 h-5 w-5' />
            </Button>
          </div>
        </SectionShell>
      )}
    </HomeLayout>
  );
}
