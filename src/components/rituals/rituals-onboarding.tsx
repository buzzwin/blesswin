import { useState, useEffect } from 'react';
import { Modal } from '@components/modal/modal';
import { useModal } from '@lib/hooks/useModal';
import { cn } from '@lib/utils';
import { ArrowRight, Check } from 'lucide-react';
import type { ImpactTag } from '@lib/types/impact-moment';
import { impactTagLabels, impactTagColors } from '@lib/types/impact-moment';

interface RitualsOnboardingProps {
  onComplete: (preferences: {
    selectedTags: ImpactTag[];
    notifications: {
      morning: boolean;
      evening: boolean;
      milestones: boolean;
      morningTime?: string;
      eveningTime?: string;
    };
  }) => void;
  onSkip?: () => void;
}

type OnboardingStep = 'welcome' | 'interests' | 'notifications' | 'complete';

export function RitualsOnboarding({
  onComplete,
  onSkip
}: RitualsOnboardingProps): JSX.Element {
  const { open, openModal, closeModal } = useModal();
  
  // Auto-open on mount
  useEffect(() => {
    openModal();
  }, [openModal]);
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedTags, setSelectedTags] = useState<ImpactTag[]>([]);
  const [notifications, setNotifications] = useState({
    morning: true,
    evening: true,
    milestones: true,
    morningTime: '08:00',
    eveningTime: '19:00'
  });

  const allTags: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community'];

  const toggleTag = (tag: ImpactTag): void => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleNext = (): void => {
    if (step === 'welcome') {
      setStep('interests');
    } else if (step === 'interests') {
      if (selectedTags.length === 0) {
        // Require at least one tag
        return;
      }
      setStep('notifications');
    } else if (step === 'notifications') {
      setStep('complete');
      onComplete({ selectedTags, notifications });
      setTimeout(() => {
        closeModal();
      }, 1500);
    }
  };

  const handleSkip = (): void => {
    closeModal();
    onSkip?.();
  };

  return (
    <>
      <Modal
        modalClassName='max-w-lg bg-white dark:bg-gray-900 w-full p-6 rounded-2xl'
        open={open}
        closeModal={handleSkip}
      >
        <div className='space-y-6'>
          {/* Welcome Step */}
          {step === 'welcome' && (
            <>
              <div className='text-center'>
                <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
                  <span className='text-3xl'>🌱</span>
                </div>
                <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
                  Welcome to Daily Rituals
                </h2>
                <p className='text-gray-600 dark:text-gray-400'>
                  Small actions, big impact. We'll suggest one tiny thing each day to help you build positive habits.
                </p>
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={handleSkip}
                  className='flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleNext}
                  className='flex-1 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700'
                >
                  Get Started
                  <ArrowRight className='ml-2 inline h-4 w-4' />
                </button>
              </div>
            </>
          )}

          {/* Interests Step */}
          {step === 'interests' && (
            <>
              <div>
                <h2 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                  What matters to you?
                </h2>
                <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
                  We'll personalize suggestions based on what you care about.
                </p>
                <div className='space-y-2'>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'w-full rounded-lg border-2 p-3 text-left transition-all',
                        selectedTags.includes(tag)
                          ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20'
                          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                      )}
                    >
                      <div className='flex items-center justify-between'>
                        <span className={cn(
                          'rounded-full px-3 py-1 text-sm font-medium',
                          impactTagColors[tag]
                        )}>
                          {impactTagLabels[tag]}
                        </span>
                        {selectedTags.includes(tag) && (
                          <Check className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {selectedTags.length === 0 && (
                  <p className='mt-2 text-xs text-red-500'>
                    Please select at least one interest
                  </p>
                )}
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={() => setStep('welcome')}
                  className='rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedTags.length === 0}
                  className={cn(
                    'flex-1 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700',
                    selectedTags.length === 0 && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  Continue
                  <ArrowRight className='ml-2 inline h-4 w-4' />
                </button>
              </div>
            </>
          )}

          {/* Notifications Step */}
          {step === 'notifications' && (
            <>
              <div>
                <h2 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                  When would you like gentle reminders?
                </h2>
                <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
                  You can always change this later in settings.
                </p>
                <div className='space-y-3'>
                  <label className='flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700'>
                    <div>
                      <div className='font-medium text-gray-900 dark:text-white'>Morning</div>
                      <div className='text-xs text-gray-500 dark:text-gray-400'>8:00 AM</div>
                    </div>
                    <input
                      type='checkbox'
                      checked={notifications.morning}
                      onChange={(e) =>
                        setNotifications((prev) => ({ ...prev, morning: e.target.checked }))
                      }
                      className='h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500'
                    />
                  </label>
                  <label className='flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700'>
                    <div>
                      <div className='font-medium text-gray-900 dark:text-white'>Evening</div>
                      <div className='text-xs text-gray-500 dark:text-gray-400'>7:00 PM</div>
                    </div>
                    <input
                      type='checkbox'
                      checked={notifications.evening}
                      onChange={(e) =>
                        setNotifications((prev) => ({ ...prev, evening: e.target.checked }))
                      }
                      className='h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500'
                    />
                  </label>
                  <label className='flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700'>
                    <div>
                      <div className='font-medium text-gray-900 dark:text-white'>Streak Milestones</div>
                      <div className='text-xs text-gray-500 dark:text-gray-400'>Celebrate your progress</div>
                    </div>
                    <input
                      type='checkbox'
                      checked={notifications.milestones}
                      onChange={(e) =>
                        setNotifications((prev) => ({ ...prev, milestones: e.target.checked }))
                      }
                      className='h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500'
                    />
                  </label>
                </div>
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={() => setStep('interests')}
                  className='rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className='flex-1 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700'
                >
                  Start My Rituals
                  <ArrowRight className='ml-2 inline h-4 w-4' />
                </button>
              </div>
            </>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className='text-center'>
              <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                <Check className='h-8 w-8 text-green-600 dark:text-green-400' />
              </div>
              <h2 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                You're all set!
              </h2>
              <p className='text-gray-600 dark:text-gray-400'>
                Your first ritual is ready. Let's get started!
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

// Export hook to use the modal
export function useRitualsOnboarding() {
  const { open, openModal, closeModal } = useModal();
  return { open, openModal, closeModal };
}

