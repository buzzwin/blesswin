import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Flower2, ArrowLeft } from 'lucide-react';
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

export default function YogaPage(): JSX.Element {
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
      void router.push('/login?redirect=/yoga');
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
        image={`${siteURL || 'https://Buzzwin.com'}/assets/og-yoga.jpg`}
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
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm'>
                <Flower2 className='h-4 w-4 text-white' />
              </div>
              <h1 className='text-sm font-semibold text-gray-900 dark:text-white sm:text-base'>
                Yoga AI Pal
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
                agentType='yoga'
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
            <div className='mb-4 text-5xl'>🧘</div>
            <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
              Disclaimer Required
            </h2>
            <p className='mb-6 text-gray-600 dark:text-gray-400'>
              To use the Yoga AI Pal, please review and accept our wellness disclaimer.
            </p>
            <button
              onClick={() => {
                // Reset states to trigger modal
                setDisclaimerAcceptedState(false);
                setShowContent(false);
                setIsChecking(false);
              }}
              className='rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:from-green-600 hover:to-emerald-700 hover:shadow-lg'
            >
              Review Disclaimer
            </button>
          </div>
        </div>
      ) : null}
    </HomeLayout>
  );
}
