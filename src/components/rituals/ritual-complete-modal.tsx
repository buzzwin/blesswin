import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { Modal } from '@components/modal/modal';
import { UserAvatar } from '@components/user/user-avatar';
import { 
  impactTagLabels, 
  impactTagColors, 
  effortLevelLabels, 
  effortLevelIcons,
  type ImpactTag,
  type EffortLevel
} from '@lib/types/impact-moment';
import { Smile, Frown, X, Loader2 } from 'lucide-react';
import type { RitualDefinition } from '@lib/types/ritual';

interface RitualCompleteModalProps {
  ritual: RitualDefinition;
  open: boolean;
  closeModal: () => void;
  onComplete: (sharedMomentId?: string) => void;
}

export function RitualCompleteModal({
  ritual,
  open,
  closeModal,
  onComplete
}: RitualCompleteModalProps): JSX.Element {
  const { user } = useAuth();
  const [text, setText] = useState(ritual.prefillTemplate);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputLimit = 280;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setText(ritual.prefillTemplate);
      setMoodBefore(null);
      setMoodAfter(null);
      setTimeout(() => {
        textareaRef.current?.focus();
        // Select the text so user can easily edit
        const textLength = ritual.prefillTemplate.length;
        textareaRef.current?.setSelectionRange(textLength, textLength);
      }, 100);
    }
  }, [open, ritual]);

  const handleCompleteQuietly = async (): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/rituals/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          ritualId: ritual.id,
          completedQuietly: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete ritual');
      }

      toast.success('Ritual completed! ✨');
      closeModal();
      onComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete ritual';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!text.trim()) {
      toast.error('Please describe your ritual completion');
      return;
    }

    if (text.length > inputLimit) {
      toast.error(`Text must be ${inputLimit} characters or less`);
      return;
    }

    setLoading(true);

    try {
      // Create Impact Moment
      const response = await fetch('/api/impact-moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text.trim(),
          tags: ritual.tags,
          effortLevel: ritual.effortLevel,
          moodCheckIn: moodBefore !== null && moodAfter !== null 
            ? { before: moodBefore, after: moodAfter }
            : undefined,
          userId: user?.id,
          fromDailyRitual: true,
          ritualId: ritual.id,
          ritualTitle: ritual.title
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to share moment');
      }

      const data = await response.json();
      
      // Now complete the ritual with the moment ID
      const completeResponse = await fetch('/api/rituals/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          ritualId: ritual.id,
          completedQuietly: false,
          sharedAsMomentId: data.momentId || data.id
        })
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to mark ritual as complete');
      }

      toast.success('Ritual completed and shared! 🌱');
      closeModal();
      onComplete(data.momentId || data.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to share moment';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      modalClassName='max-w-2xl bg-white dark:bg-gray-900 w-full p-6 rounded-2xl'
      open={open}
      closeModal={closeModal}
    >
      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700'>
          <div>
            <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
              Share Your Ritual Completion
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
              Complete & share: {ritual.title}
            </p>
          </div>
          <button
            onClick={closeModal}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Ritual Preview */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-start gap-3'>
            <div className='text-2xl'>{ritual.icon || '🌱'}</div>
            <div className='flex-1'>
              <h3 className='mb-1 text-sm font-semibold text-gray-900 dark:text-white'>
                {ritual.title}
              </h3>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                {ritual.description}
              </p>
            </div>
          </div>
        </div>

        {/* User Avatar and Text Input */}
        <div className='flex gap-3'>
          <UserAvatar
            src={user?.photoURL ?? ''}
            alt={user?.name ?? 'User'}
            username={user?.username ?? 'user'}
          />
          <div className='flex-1'>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Describe how you completed this ritual...'
              className={cn(
                'w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3',
                'text-gray-900 placeholder-gray-500',
                'dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400',
                'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                'transition-colors'
              )}
              rows={3}
              maxLength={inputLimit}
              disabled={loading}
            />
            <div className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              {text.length} / {inputLimit}
            </div>
          </div>
        </div>

        {/* Tags (read-only) */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Tags
          </label>
          <div className='flex flex-wrap gap-2'>
            {ritual.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium',
                  impactTagColors[tag]
                )}
              >
                {impactTagLabels[tag]}
              </span>
            ))}
          </div>
        </div>

        {/* Effort Level (read-only) */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Effort Level
          </label>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>{effortLevelIcons[ritual.effortLevel]}</span>
            <span className='text-sm font-medium'>{effortLevelLabels[ritual.effortLevel]} Effort</span>
          </div>
        </div>

        {/* Mood Check-in (Optional) */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Mood Check-in (optional)
          </label>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1 block text-xs text-gray-600 dark:text-gray-400'>
                Before
              </label>
              <div className='flex items-center gap-2'>
                <Frown className='h-4 w-4 text-gray-400' />
                <input
                  type='range'
                  min='1'
                  max='5'
                  value={moodBefore ?? 3}
                  onChange={(e) => setMoodBefore(Number(e.target.value))}
                  disabled={loading}
                  className={cn(
                    'flex-1 accent-purple-500',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                />
                <Smile className='h-4 w-4 text-gray-400' />
                <span className='w-8 text-center text-sm font-medium'>
                  {moodBefore ?? 3}
                </span>
              </div>
            </div>
            <div>
              <label className='mb-1 block text-xs text-gray-600 dark:text-gray-400'>
                After
              </label>
              <div className='flex items-center gap-2'>
                <Frown className='h-4 w-4 text-gray-400' />
                <input
                  type='range'
                  min='1'
                  max='5'
                  value={moodAfter ?? 3}
                  onChange={(e) => setMoodAfter(Number(e.target.value))}
                  disabled={loading}
                  className={cn(
                    'flex-1 accent-purple-500',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                />
                <Smile className='h-4 w-4 text-gray-400' />
                <span className='w-8 text-center text-sm font-medium'>
                  {moodAfter ?? 3}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={handleCompleteQuietly}
            disabled={loading}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold',
              'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Completing...
              </span>
            ) : (
              'Complete without sharing'
            )}
          </button>
          <div className='flex gap-2'>
            <button
              onClick={closeModal}
              disabled={loading}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold',
                'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || loading}
              className={cn(
                'rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700',
                (!text.trim() || loading) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Sharing...
                </span>
              ) : (
                'Share Moment 🌱'
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

