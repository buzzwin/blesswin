import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { Button } from '@components/ui/button-shadcn';
import Link from 'next/link';
import { useAuth } from '@lib/context/auth-context';

interface DisclaimerModalProps {
  onAccept: () => void;
  onDecline?: () => void;
}

const DISCLAIMER_STORAGE_KEY = 'blesswin_disclaimer_accepted';

// Check disclaimer acceptance (database first, then localStorage fallback)
export async function hasAcceptedDisclaimer(userId?: string): Promise<boolean> {
  // If user is logged in, check database
  if (userId) {
    try {
      const response = await fetch(
        `/api/disclaimer-acceptance?userId=${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.accepted) {
          // Also update localStorage for quick access
          if (typeof window !== 'undefined') {
            localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
          }
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking disclaimer acceptance:', error);
      // Fall back to localStorage
    }
  }

  // Fallback to localStorage for anonymous users
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DISCLAIMER_STORAGE_KEY) === 'true';
}

// Save disclaimer acceptance to database
export async function setDisclaimerAccepted(userId?: string): Promise<void> {
  // Save to localStorage immediately for quick access
  if (typeof window !== 'undefined') {
    localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
  }

  // If user is logged in, save to database
  if (userId) {
    try {
      const response = await fetch('/api/disclaimer-acceptance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        console.error('Failed to save disclaimer acceptance to database');
      }
    } catch (error) {
      console.error('Error saving disclaimer acceptance:', error);
      // Continue even if database save fails - localStorage is already set
    }
  }
}

export function DisclaimerModal({
  onAccept,
  onDecline
}: DisclaimerModalProps): JSX.Element | null {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkAcceptance() {
      setIsChecking(true);
      const accepted = await hasAcceptedDisclaimer(user?.id);
      if (accepted) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
      setIsChecking(false);
    }

    void checkAcceptance();
  }, [user?.id]);

  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const handleScroll = (): void => {
      const element = contentRef.current;
      if (!element) return;

      const { scrollTop, scrollHeight, clientHeight } = element;
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

      if (scrolledToBottom) {
        setHasScrolled(true);
      }
    };

    const element = contentRef.current;
    element.addEventListener('scroll', handleScroll);

    // Check initial scroll position
    handleScroll();

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  const handleAccept = async (): Promise<void> => {
    await setDisclaimerAccepted(user?.id);
    setIsOpen(false);
    onAccept();
  };

  const handleDecline = (): void => {
    setIsOpen(false);
    if (onDecline) {
      onDecline();
    } else {
      // Default: redirect to homepage
      window.location.href = '/';
    }
  };

  // Don't show modal while checking or if already accepted
  if (isChecking || !isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
      <div className='relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900'>
        {/* Header */}
        <div className='sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30'>
              <AlertTriangle className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
            </div>
            <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
              Important Disclaimer
            </h2>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className='max-h-[60vh] overflow-y-auto px-6 py-6'
        >
          <div className='mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20'>
            <p className='font-semibold text-yellow-900 dark:text-yellow-200'>
              Please read and accept this disclaimer before using Buzzwin.
            </p>
          </div>

          <div className='space-y-4 text-sm text-gray-700 dark:text-gray-300'>
            <div>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                Medical Disclaimer
              </h3>
              <p className='leading-relaxed'>
                <strong>
                  Buzzwin is NOT intended to provide medical advice, diagnosis,
                  or treatment.
                </strong>{' '}
                The content and services provided are for informational and
                educational purposes only and are not a substitute for
                professional medical advice.
              </p>
            </div>

            <div>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                Limitation of Liability
              </h3>
              <p className='leading-relaxed'>
                The creators, operators, and contributors to Buzzwin are{' '}
                <strong>
                  not responsible for any harm, injury, loss, or damage
                </strong>{' '}
                that may result from your use of this platform or reliance on
                any information provided herein.
              </p>
            </div>

            <div>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                Assumption of Risk
              </h3>
              <p className='leading-relaxed'>
                By using Buzzwin, you acknowledge that you understand and accept
                the risks associated with wellness practices. You agree to
                assume full responsibility for any risks, injuries, or damages
                that may result from your participation in any activities
                suggested on this platform.
              </p>
            </div>

            <div>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                Professional Consultation Required
              </h3>
              <p className='leading-relaxed'>
                Always consult with a qualified healthcare professional before
                starting any new wellness practice, exercise program, or making
                changes to your health routine. If you have a medical emergency,
                call emergency services immediately.
              </p>
            </div>

            <div className='pt-4'>
              <Link
                href='/disclaimer'
                target='_blank'
                className='text-sm font-medium text-blue-600 hover:underline dark:text-blue-400'
              >
                Read full disclaimer →
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
            <Button
              onClick={handleDecline}
              variant='outline'
              className='w-full sm:w-auto'
            >
              Decline
            </Button>
            {!hasScrolled && (
              <p className='w-full text-center text-xs text-gray-500 dark:text-gray-400 sm:hidden'>
                Please scroll to read the full disclaimer
              </p>
            )}
            <Button
              onClick={handleAccept}
              disabled={!hasScrolled}
              className='w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white sm:w-auto'
            >
              <Check className='mr-2 h-4 w-4' />I Accept & Continue
            </Button>
          </div>
          {!hasScrolled && (
            <p className='mt-2 text-center text-xs text-gray-500 dark:text-gray-400'>
              Please scroll to read the full disclaimer before accepting
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
