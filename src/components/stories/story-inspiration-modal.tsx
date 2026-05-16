import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/context/auth-context';
import { Modal } from '@components/modal/modal';
import { ImpactMomentInput } from '@components/impact/impact-moment-input';
import { Sparkles, X } from 'lucide-react';
import type { RealStory } from '@lib/types/real-story';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';

interface StoryInspirationModalProps {
  story: RealStory;
  open: boolean;
  closeModal: () => void;
  onSuccess?: () => void;
}

// Map story categories to Impact Tags
function mapCategoryToTags(category: RealStory['category']): ImpactTag[] {
  const categoryMap: Record<RealStory['category'], ImpactTag[]> = {
    community: ['community'],
    environment: ['nature'],
    education: ['mind', 'community'],
    health: ['body', 'mind'],
    'social-justice': ['community', 'relationships'],
    innovation: ['mind', 'community']
  };
  return categoryMap[category] || ['community'];
}

// Generate suggested text based on story
function generateSuggestedText(story: RealStory): string {
  return `Inspired by "${story.title}" - ${story.description.substring(0, 100)}...`;
}

export function StoryInspirationModal({
  story,
  open,
  closeModal,
  onSuccess
}: StoryInspirationModalProps): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleSuccess = (): void => {
    setIsCreating(false);
    closeModal();
    onSuccess?.();
    // Optionally redirect to home feed to see the new moment
    void router.push('/home');
  };

  const handleCancel = (): void => {
    setIsCreating(false);
    closeModal();
  };

  const handleGetStarted = (): void => {
    if (!user) {
      void router.push('/login');
      return;
    }
    setIsCreating(true);
  };

  if (!user) {
    return (
      <Modal open={open} closeModal={closeModal} modalClassName='max-w-2xl'>
        <div className='p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'>
                <Sparkles className='h-5 w-5 text-[#C9A96E] dark:text-[#C9A96E]' />
              </div>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Get Inspired
              </h2>
            </div>
            <button
              onClick={closeModal}
              className='rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-[#9E8B76] dark:hover:bg-[#231a10]'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          <div className='mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
              {story.title}
            </h3>
            <p className='text-sm text-gray-600 dark:text-[#9E8B76]'>
              {story.description}
            </p>
          </div>

          <p className='mb-6 text-gray-600 dark:text-[#9E8B76]'>
            Sign in to create an Impact Moment inspired by this story and share how it motivates you to take action.
          </p>

          <div className='flex gap-3'>
            <button
              onClick={() => void router.push('/login')}
              className='flex-1 rounded-lg bg-[#C97D60] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#B56540]'
            >
              Sign In to Get Started
            </button>
            <button
              onClick={closeModal}
              className='rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#2a1d10] dark:text-[#C4B5A0] dark:hover:bg-[#231a10]'
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  if (!isCreating) {
    return (
      <Modal open={open} closeModal={closeModal} modalClassName='max-w-2xl'>
        <div className='p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'>
                <Sparkles className='h-5 w-5 text-[#C9A96E] dark:text-[#C9A96E]' />
              </div>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Get Inspired by This Story
              </h2>
            </div>
            <button
              onClick={closeModal}
              className='rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-[#9E8B76] dark:hover:bg-[#231a10]'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          <div className='mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
              {story.title}
            </h3>
            <p className='text-sm text-gray-600 dark:text-[#9E8B76]'>
              {story.description}
            </p>
            {story.location && (
              <p className='mt-2 text-xs text-gray-500 dark:text-[#9E8B76]'>
                📍 {story.location}
              </p>
            )}
          </div>

          <p className='mb-6 text-gray-600 dark:text-[#9E8B76]'>
            Share how this story inspires you to take action. Create an Impact Moment to document your response and inspire others.
          </p>

          <div className='flex gap-3'>
            <button
              onClick={handleGetStarted}
              className='flex-1 rounded-lg bg-[#C97D60] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#B56540]'
            >
              Create Impact Moment
            </button>
            <button
              onClick={closeModal}
              className='rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#2a1d10] dark:text-[#C4B5A0] dark:hover:bg-[#231a10]'
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // Show Impact Moment Input with pre-filled data
  return (
    <Modal open={open} closeModal={closeModal} modalClassName='max-w-2xl'>
      <div className='p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'>
              <Sparkles className='h-5 w-5 text-[#C9A96E] dark:text-[#C9A96E]' />
            </div>
            <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
              Create Impact Moment
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className='rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-[#9E8B76] dark:hover:bg-[#231a10]'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='mb-4 rounded-lg border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.06)] p-3 dark:border-[rgba(201,169,110,0.25)] dark:bg-[rgba(201,169,110,0.08)]'>
          <p className='text-sm text-[#7a5a18] dark:text-[#C4B5A0]'>
            ✨ Inspired by: <span className='font-semibold'>{story.title}</span>
          </p>
        </div>

        <ImpactMomentInput
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          defaultExpanded={true}
          initialText={generateSuggestedText(story)}
          initialTags={mapCategoryToTags(story.category)}
          initialEffortLevel={'medium' as EffortLevel}
          storyId={story.title} // Use title as identifier for tracking
          storyTitle={story.title}
        />
      </div>
    </Modal>
  );
}

