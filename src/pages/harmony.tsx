import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Waves, ArrowLeft } from 'lucide-react';
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

export default function HarmonyPage(): JSX.Element {
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
    name: 'Harmony AI Pal - Find Balance & Inner Peace | Buzzwin',
    description:
      'Find balance and harmony in all aspects of life with your Harmony AI Pal.',
    url: `${siteURL || 'https://Buzzwin.com'}/harmony`
  };

  return (
    <HomeLayout>
      <SEO
        title='Harmony AI Pal - Find Balance & Inner Peace | Buzzwin'
        description='Find balance and harmony in all aspects of life with your Harmony AI Pal.'
        keywords='harmony, inner peace, world peace, balance'
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
          <SectionShell className='py-12'>
            <div className='mx-auto max-w-5xl px-6'>
              <Link
                href='/'
                className='mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              >
                <span className='inline-flex items-center gap-2'>
                  <ArrowLeft className='h-4 w-4' />
                  <span className='font-medium'>Back</span>
                </span>
              </Link>

              <div className='mb-8 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg'>
                  <Waves className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='mb-2 text-4xl font-light text-gray-900 dark:text-white'>
                    Harmony AI Pal
                  </h1>
                  <p className='text-lg font-light text-gray-600 dark:text-gray-300'>
                    Your AI companion for finding harmony
                  </p>
                </div>
              </div>
            </div>
          </SectionShell>

          {/* Chat Interface */}
          <SectionShell className='py-12'>
            <div className='mx-auto max-w-5xl px-6'>
              <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900'>
                <WellnessChat
                  agentType='harmony'
                  className='min-h-[600px]'
                  onLoginRequest={handleSignIn}
                  userId={user?.id}
                />
              </div>
            </div>
          </SectionShell>

          {/* Wellness Content - Only shown when user requests */}
          <SectionShell variant='dark' className='py-20'>
            <div className='mx-auto max-w-7xl px-6'>
              <WellnessContentGrid category='harmony' limit={10} title='Wellness Content Recommendations' autoFetch={false} />
            </div>
          </SectionShell>
        </>
      ) : (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='text-center'>
            <p className='text-gray-600 dark:text-gray-400'>
              Please accept the disclaimer to continue.
            </p>
          </div>
        </div>
      )}
    </HomeLayout>
  );
}
