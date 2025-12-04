import { useState, useEffect, useRef } from 'react';
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
  type EffortLevel,
  type ImpactMomentWithUser
} from '@lib/types/impact-moment';
import { X, Loader2, Repeat } from 'lucide-react';
import type { RitualTimeOfDay } from '@lib/types/ritual';

interface CreateRitualFromMomentModalProps {
  moment: ImpactMomentWithUser;
  open: boolean;
  closeModal: () => void;
  onSuccess?: (ritualId: string) => void;
}

const timeOfDayOptions: { value: RitualTimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'anytime', label: 'Anytime' }
];

export function CreateRitualFromMomentModal({
  moment,
  open,
  closeModal,
  onSuccess
}: CreateRitualFromMomentModalProps): JSX.Element {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suggestedTimeOfDay, setSuggestedTimeOfDay] = useState<RitualTimeOfDay>('anytime');
  const [durationEstimate, setDurationEstimate] = useState('5 minutes');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Pre-fill form when modal opens
  useEffect(() => {
    if (open && moment) {
      // Use moment text as title (truncated) and description
      const momentText = moment.text || '';
      setTitle(momentText.substring(0, 50) || 'New Ritual');
      setDescription(momentText || 'A ritual inspired by an impact moment');
      setSuggestedTimeOfDay('anytime');
      setDurationEstimate('5 minutes');
      
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [open, moment]);

  const handleSubmit = async (): Promise<void> => {
    if (!title.trim()) {
      toast.error('Please enter a title for your ritual');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description for your ritual');
      return;
    }

    if (!user?.id || !moment.id) {
      toast.error('Please sign in to create a ritual');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/rituals/create-from-moment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          momentId: moment.id,
          title: title.trim(),
          description: description.trim(),
          suggestedTimeOfDay,
          durationEstimate
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create ritual');
      }

      const data = await response.json();
      
      toast.success('Ritual created! You can now do this regularly 🌱');
      closeModal();
      onSuccess?.(data.ritualId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create ritual';
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
              Make this recurring
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
              Create a ritual to do this regularly
            </p>
          </div>
          <button
            onClick={closeModal}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Moment Preview */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-start gap-3'>
            <UserAvatar
              src={moment.user.photoURL ?? ''}
              alt={moment.user.name ?? 'User'}
              username={moment.user.username ?? 'user'}
            />
            <div className='flex-1'>
              <p className='text-sm text-gray-700 dark:text-gray-300'>
                {moment.text}
              </p>
              <div className='mt-2 flex flex-wrap gap-2'>
                {moment.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      impactTagColors[tag]
                    )}
                  >
                    {impactTagLabels[tag]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className='space-y-4'>
          {/* Title */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Ritual Title
            </label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Enter ritual title...'
              className={cn(
                'w-full rounded-lg border border-gray-300 bg-gray-50 p-3',
                'text-gray-900 placeholder-gray-500',
                'dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400',
                'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                'transition-colors'
              )}
              maxLength={100}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Description
            </label>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Describe your ritual...'
              className={cn(
                'w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3',
                'text-gray-900 placeholder-gray-500',
                'dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400',
                'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                'transition-colors'
              )}
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Time of Day */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Suggested Time
            </label>
            <div className='grid grid-cols-4 gap-2'>
              {timeOfDayOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSuggestedTimeOfDay(option.value)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    suggestedTimeOfDay === option.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                  disabled={loading}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Duration Estimate
            </label>
            <input
              type='text'
              value={durationEstimate}
              onChange={(e) => setDurationEstimate(e.target.value)}
              placeholder='e.g., 5 minutes'
              className={cn(
                'w-full rounded-lg border border-gray-300 bg-gray-50 p-3',
                'text-gray-900 placeholder-gray-500',
                'dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400',
                'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                'transition-colors'
              )}
              disabled={loading}
            />
          </div>

          {/* Tags and Effort Level (read-only from moment) */}
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800'>
            <div className='mb-2 text-xs font-medium text-gray-600 dark:text-gray-400'>
              Tags & Effort Level (from moment)
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex flex-wrap gap-2'>
                {moment.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium',
                      impactTagColors[tag]
                    )}
                  >
                    {impactTagLabels[tag]}
                  </span>
                ))}
              </div>
              <div className='ml-auto flex items-center gap-2'>
                <span className='text-lg'>{effortLevelIcons[moment.effortLevel]}</span>
                <span className='text-sm font-medium'>{effortLevelLabels[moment.effortLevel]} Effort</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700'>
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
            disabled={!title.trim() || !description.trim() || loading}
            className={cn(
              'rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700',
              'flex items-center gap-2',
              (!title.trim() || !description.trim() || loading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Creating...
              </>
            ) : (
              <>
                <Repeat className='h-4 w-4' />
                Create Ritual
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

