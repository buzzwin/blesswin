import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Moon, ArrowLeft } from 'lucide-react';
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

export default function MeditationPage(): JSX.Element {
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
    name: 'Meditation & Mindfulness AI Pal - AI-Powered Practice | Buzzwin',
    description:
      'Deepen your meditation practice and cultivate present-moment awareness with personalized guidance from your Meditation & Mindfulness AI Pal.',
    url: `${siteURL || 'https://Buzzwin.com'}/meditation`
  };

  return (
    <HomeLayout>
      <SEO
        title='Meditation & Mindfulness AI Pal - AI-Powered Practice | Buzzwin'
        description='Deepen your meditation practice and cultivate present-moment awareness with personalized guidance from your Meditation & Mindfulness AI Pal.'
        keywords='meditation, mindfulness, meditation AI pal, guided meditation, present-moment awareness, inner peace'
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
                <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg'>
                  <Moon className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='mb-2 text-4xl font-light text-gray-900 dark:text-white'>
                    Meditation & Mindfulness AI Pal
                  </h1>
                  <p className='text-lg font-light text-gray-600 dark:text-gray-300'>
                    Your AI companion for meditation and mindfulness practice
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
                  agentType='meditation'
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
              <WellnessContentGrid category='meditation' limit={10} title='Wellness Content Recommendations' autoFetch={false} />
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
