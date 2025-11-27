import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Flower2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import { WellnessChat } from '@components/wellness/wellness-chat';
import { WellnessContentGrid } from '@components/wellness/wellness-content-grid';
import {
  DisclaimerModal,
  hasAcceptedDisclaimer,
  setDisclaimerAccepted
} from '@components/wellness/disclaimer-modal';
import { siteURL } from '@lib/env';
import Head from 'next/head';
import Link from 'next/link';

export default function YogaPage(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [disclaimerAccepted, setDisclaimerAcceptedState] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAcceptance() {
      setIsChecking(true);
      const accepted = await hasAcceptedDisclaimer(user?.id);
      if (accepted) {
        setDisclaimerAcceptedState(true);
        setShowContent(true);
      }
      setIsChecking(false);
    }

    void checkAcceptance();
  }, [user?.id]);

  const handleAcceptDisclaimer = async (): Promise<void> => {
    await setDisclaimerAccepted(user?.id);
    setDisclaimerAcceptedState(true);
    setShowContent(true);
  };

  const handleSignIn = (): void => {
    void router.push('/login');
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Yoga AI Pal - AI-Powered Yoga Practice | Buzzwin',
    description:
      'Discover personalized yoga poses, sequences, and breathing techniques with your Yoga AI Pal.',
    url: `${siteURL || 'https://Buzzwin.com'}/yoga`
  };

  return (
    <HomeLayout>
      <SEO
        title='Yoga AI Pal - AI-Powered Yoga Practice | Buzzwin'
        description='Discover personalized yoga poses, sequences, and breathing techniques with your Yoga AI Pal. Find your flow and cultivate inner peace through mindful movement.'
        keywords='yoga, yoga poses, yoga sequences, pranayama, yoga for beginners, yoga practice, mindful movement'
        structuredData={structuredData}
      />
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      {/* Disclaimer Modal */}
      {!isChecking && !disclaimerAccepted && (
        <DisclaimerModal
          onAccept={handleAcceptDisclaimer}
          onDecline={() => router.push('/')}
        />
      )}

      {/* Loading State */}
      {isChecking && (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='text-center'>
            <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
          </div>
        </div>
      )}

      {/* Content - Hidden until disclaimer accepted */}
      {!isChecking && showContent ? (
        <>
          {/* Simple Header */}
          <SectionShell className='py-8 sm:py-12'>
            <div className='mx-auto max-w-5xl px-4 sm:px-6'>
              <Link
                href='/'
                className='mb-6 inline-flex items-center gap-1.5 text-xs text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:mb-8 sm:gap-2 sm:text-sm'
              >
                <span className='inline-flex items-center gap-1.5 sm:gap-2'>
                  <ArrowLeft className='h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='font-medium'>Back</span>
                </span>
              </Link>

              <div className='mb-6 flex flex-col items-start gap-3 sm:mb-8 sm:flex-row sm:items-center sm:gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg sm:h-16 sm:w-16 sm:rounded-2xl'>
                  <Flower2 className='h-6 w-6 text-white sm:h-8 sm:w-8' />
                </div>
                <div>
                  <h1 className='mb-1 text-2xl font-light text-gray-900 dark:text-white sm:mb-2 sm:text-3xl md:text-4xl'>
                    Yoga AI Pal
                  </h1>
                  <p className='text-sm font-light text-gray-600 dark:text-gray-300 sm:text-base md:text-lg'>
                    Your AI companion for yoga practice
                  </p>
                </div>
              </div>
            </div>
          </SectionShell>

          {/* Chat Interface */}
          <SectionShell className='py-8 sm:py-12'>
            <div className='mx-auto max-w-5xl px-4 sm:px-6'>
              <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900'>
                <WellnessChat
                  agentType='yoga'
                  className='min-h-[600px]'
                  onLoginRequest={handleSignIn}
                  userId={user?.id}
                />
              </div>
            </div>
          </SectionShell>

          {/* Wellness Content - Only shown when user requests */}
          <SectionShell variant='dark' className='py-12 sm:py-16 md:py-20'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6'>
              <WellnessContentGrid category='yoga' limit={10} title='Wellness Content Recommendations' autoFetch={false} />
            </div>
          </SectionShell>
        </>
      ) : !isChecking ? (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='text-center'>
            <p className='text-gray-600 dark:text-gray-400'>
              Please accept the disclaimer to continue.
            </p>
          </div>
        </div>
      ) : null}
    </HomeLayout>
  );
}
