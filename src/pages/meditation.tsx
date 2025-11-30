import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Moon, ArrowLeft } from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { HomeLayout } from '@components/layout/common-layout';
import { SectionShell } from '@components/layout/section-shell';
import { WellnessChat } from '@components/wellness/wellness-chat';
import { WellnessContentGrid } from '@components/wellness/wellness-content-grid';
import { Loading } from '@components/ui/loading';
import {
  DisclaimerModal,
  hasAcceptedDisclaimer,
  setDisclaimerAccepted
} from '@components/wellness/disclaimer-modal';
import { siteURL } from '@lib/env';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function MeditationPage(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [disclaimerAccepted, setDisclaimerAcceptedState] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsChecking(false);
      return;
    }

    let cancelled = false;

    async function checkAcceptance() {
      setIsChecking(true);
      try {
        const accepted = await hasAcceptedDisclaimer(user?.id);
        if (!cancelled) {
          setDisclaimerAcceptedState(accepted);
          setShowContent(accepted);
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Error checking disclaimer:', error);
        if (!cancelled) {
          setIsChecking(false);
          toast.error('Failed to load. Please refresh the page.');
        }
      }
    }

    void checkAcceptance();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleAcceptDisclaimer = async (): Promise<void> => {
    try {
      await setDisclaimerAccepted(user?.id);
      setDisclaimerAcceptedState(true);
      setShowContent(true);
    } catch (error) {
      console.error('Error accepting disclaimer:', error);
      toast.error('Failed to save acceptance. Please try again.');
    }
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
        image={`${siteURL || 'https://Buzzwin.com'}/assets/og-meditation.jpg`}
        structuredData={structuredData}
      />

      {/* Disclaimer Modal */}
      {!isChecking && !disclaimerAccepted && (
        <DisclaimerModal
          onAccept={handleAcceptDisclaimer}
          onDecline={() => router.push('/')}
        />
      )}

      {/* Loading State */}
      {isChecking && (
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <Loading size='lg' />
            <p className='mt-4 text-sm text-gray-600 dark:text-gray-400'>
              Preparing your AI companion...
            </p>
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
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg sm:h-16 sm:w-16 sm:rounded-2xl'>
                  <Moon className='h-6 w-6 text-white sm:h-8 sm:w-8' />
                </div>
                <div>
                  <h1 className='mb-1 text-2xl font-light text-gray-900 dark:text-white sm:mb-2 sm:text-3xl md:text-4xl'>
                    Meditation & Mindfulness AI Pal
                  </h1>
                  <p className='text-sm font-light text-gray-600 dark:text-gray-300 sm:text-base md:text-lg'>
                    Your AI companion for meditation and mindfulness practice
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
                  agentType='meditation'
                  className='min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]'
                  onLoginRequest={handleSignIn}
                  userId={user?.id}
                />
              </div>
            </div>
          </SectionShell>

          {/* Wellness Content - Only shown when user requests */}
          <SectionShell variant='dark' className='py-12 sm:py-16 md:py-20'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6'>
              <WellnessContentGrid category='meditation' limit={10} title='Wellness Content Recommendations' autoFetch={false} />
            </div>
          </SectionShell>
        </>
      ) : !isChecking ? (
        <div className='flex min-h-screen items-center justify-center px-4'>
          <div className='max-w-md text-center'>
            <div className='mb-4 text-5xl'>🧘‍♀️</div>
            <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
              Disclaimer Required
            </h2>
            <p className='mb-6 text-gray-600 dark:text-gray-400'>
              To use the Meditation AI Pal, please review and accept our wellness disclaimer.
            </p>
            <button
              onClick={() => {
                setDisclaimerAcceptedState(false);
                setShowContent(false);
              }}
              className='rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-600 hover:to-violet-700 hover:shadow-lg'
            >
              Review Disclaimer
            </button>
          </div>
        </div>
      ) : null}
    </HomeLayout>
  );
}
