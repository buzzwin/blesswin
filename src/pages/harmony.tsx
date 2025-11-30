import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Waves, ArrowLeft } from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import { HomeLayout } from '@components/layout/common-layout';
import { WellnessChat } from '@components/wellness/wellness-chat';
import { Loading } from '@components/ui/loading';
import {
  DisclaimerModal,
  hasAcceptedDisclaimer,
  setDisclaimerAccepted
} from '@components/wellness/disclaimer-modal';
import { siteURL } from '@lib/env';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function HarmonyPage(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [disclaimerAccepted, setDisclaimerAcceptedState] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Redirect to login if not authenticated (only after initial auth check)
  useEffect(() => {
    // Wait a moment for auth to initialize
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (authChecked && !user) {
      void router.push('/login?redirect=/harmony');
    }
  }, [authChecked, user, router]);

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
    name: 'Harmony AI Pal - Find Balance & Inner Peace | Buzzwin',
    description:
      'Find balance and harmony in all aspects of life with your Harmony AI Pal.',
    url: `${siteURL || 'https://Buzzwin.com'}/harmony`
  };

  return (
    <HomeLayout>
      <SEO
        title='Harmony AI Pal - Find Balance & Inner Peace | Buzzwin'
        description='Discover balance and harmony in all aspects of life with personalized AI guidance. Learn conflict resolution, emotional balance, stress management, and mindful living practices for inner peace.'
        keywords='harmony, inner peace, world peace, balance, conflict resolution, emotional balance, stress management, mindful living, peaceful relationships, inner harmony practices, emotional wellness, mental balance'
        image={`${siteURL || 'https://Buzzwin.com'}/assets/og-harmony.jpg`}
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
        <div className='flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950'>
          {/* Compact Sticky Header */}
          <header className='sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900 sm:px-4 md:px-6'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-sm'>
                <Waves className='h-4 w-4 text-white' />
              </div>
              <h1 className='text-sm font-semibold text-gray-900 dark:text-white sm:text-base'>
                Harmony AI Pal
              </h1>
            </div>
            <Link
              href='/'
              className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
            >
              <ArrowLeft className='h-5 w-5' />
            </Link>
          </header>

          {/* Chat Interface - Full Height with Responsive Padding */}
          <div className='flex-1 overflow-hidden px-0 sm:px-4 md:px-6 lg:px-8'>
            <div className='mx-auto h-full max-w-5xl'>
              <WellnessChat
                agentType='harmony'
                className='h-full'
                onLoginRequest={handleSignIn}
                userId={user?.id}
              />
            </div>
          </div>
        </div>
      ) : !isChecking ? (
        <div className='flex min-h-screen items-center justify-center px-4'>
          <div className='max-w-md text-center'>
            <div className='mb-4 text-5xl'>☮️</div>
            <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
              Disclaimer Required
            </h2>
            <p className='mb-6 text-gray-600 dark:text-gray-400'>
              To use the Harmony AI Pal, please review and accept our wellness disclaimer.
            </p>
            <button
              onClick={() => {
                // Reset states to trigger modal
                setDisclaimerAcceptedState(false);
                setShowContent(false);
                setIsChecking(false);
              }}
              className='rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-3 font-semibold text-white transition-all hover:from-teal-600 hover:to-cyan-700 hover:shadow-lg'
            >
              Review Disclaimer
            </button>
          </div>
        </div>
      ) : null}
    </HomeLayout>
  );
}
