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
  type EffortLevel,
  type ImpactMomentWithUser
} from '@lib/types/impact-moment';
import { Smile, Frown, X, Loader2 } from 'lucide-react';

interface JoinMomentModalProps {
  originalMoment: ImpactMomentWithUser;
  open: boolean;
  closeModal: () => void;
  onJoin: (joinedMomentData: {
    text: string;
    tags: ImpactTag[];
    effortLevel: EffortLevel;
    moodCheckIn?: { before: number; after: number };
    images?: string[];
  }) => Promise<void>;
}

export function JoinMomentModal({ originalMoment, open, closeModal, onJoin }: JoinMomentModalProps): JSX.Element {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState<ImpactTag[]>(originalMoment.tags);
  const [effortLevel, setEffortLevel] = useState<EffortLevel>(originalMoment.effortLevel);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputLimit = 280;

  const allTags: ImpactTag[] = ['mind', 'body', 'relationships', 'nature', 'community', 'chores'];
  const allEffortLevels: EffortLevel[] = ['tiny', 'medium', 'deep'];

  // Initialize text when modal opens
  useEffect(() => {
    if (open) {
      const prefillText = `I joined @${originalMoment.user.username} in: ${originalMoment.text}`;
      setText(prefillText);
      setSelectedTags(originalMoment.tags);
      setEffortLevel(originalMoment.effortLevel);
      setMoodBefore(null);
      setMoodAfter(null);
      
      // Focus textarea after a brief delay
      setTimeout(() => {
        textareaRef.current?.focus();
        // Select the text so user can easily edit
        textareaRef.current?.setSelectionRange(prefillText.length, prefillText.length);
      }, 100);
    }
  }, [open, originalMoment]);

  const handleSubmit = async (): Promise<void> => {
    if (!text.trim()) {
      toast.error('Please describe your joined action');
      return;
    }

    if (selectedTags.length === 0) {
      toast.error('Please select at least one tag');
      return;
    }

    if (!effortLevel) {
      toast.error('Please select an effort level');
      return;
    }

    if (text.length > inputLimit) {
      toast.error(`Text must be ${inputLimit} characters or less`);
      return;
    }

    setLoading(true);

    try {
      await onJoin({
        text: text.trim(),
        tags: selectedTags,
        effortLevel,
        moodCheckIn: moodBefore !== null && moodAfter !== null 
          ? { before: moodBefore, after: moodAfter }
          : undefined,
        images: [] // TODO: Add image upload support
      });
      
      closeModal();
      toast.success('You joined this action! 🌱');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join action';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: ImpactTag): void => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
      <Modal
        modalClassName='max-w-2xl bg-[#faf8f4] dark:bg-[#1c1510] w-full p-6 rounded-2xl'
        open={open}
        closeModal={closeModal}
      >
        <div className='space-y-4'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-200 pb-4 dark:border-[#2a1d10]'>
            <div>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Join This Action
              </h2>
              <p className='text-sm text-gray-600 dark:text-[#9E8B76] mt-1'>
                Share how you joined @{originalMoment.user.username}'s positive action
              </p>
            </div>
            <button
              onClick={closeModal}
              className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          {/* Original Moment Preview */}
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <div className='flex items-start gap-3'>
              <UserAvatar
                src={originalMoment.user.photoURL}
                alt={originalMoment.user.name}
                username={originalMoment.user.username}
              />
              <div className='flex-1 min-w-0'>
                <div className='mb-1 text-sm font-semibold text-gray-900 dark:text-white'>
                  {originalMoment.user.name}
                </div>
                <p className='text-sm text-gray-700 dark:text-[#C4B5A0]'>
                  {originalMoment.text}
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
                placeholder='Describe how you joined this action...'
                className={cn(
                  'w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3',
                  'text-gray-900 placeholder-gray-500',
                  'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white dark:placeholder-gray-400',
                  'focus:border-[#C9A96E] focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50/20',
                  'transition-colors'
                )}
                rows={3}
                maxLength={inputLimit}
                disabled={loading}
              />
              <div className='mt-1 text-xs text-gray-500 dark:text-[#9E8B76]'>
                {text.length} / {inputLimit}
              </div>
            </div>
          </div>

          {/* Tags Selection */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-[#C4B5A0]'>
              Tags (select at least one)
            </label>
            <div className='flex flex-wrap gap-2'>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  disabled={loading}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                    selectedTags.includes(tag)
                      ? impactTagColors[tag]
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#231a10] dark:text-[#C4B5A0] dark:hover:bg-[#2a1d10]',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {impactTagLabels[tag]}
                </button>
              ))}
            </div>
          </div>

          {/* Effort Level */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-[#C4B5A0]'>
              Effort Level
            </label>
            <div className='flex gap-2'>
              {allEffortLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setEffortLevel(level)}
                  disabled={loading}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5',
                    'text-sm font-medium transition-all',
                    effortLevel === level
                      ? 'bg-[rgba(201,169,110,0.1)] text-[#7a5a18] dark:bg-[rgba(201,169,110,0.08)] dark:text-[#C4B5A0]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#231a10] dark:text-[#C4B5A0] dark:hover:bg-[#2a1d10]',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span>{effortLevelIcons[level]}</span>
                  <span>{effortLevelLabels[level]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Check-in (Optional) */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-[#C4B5A0]'>
              Mood Check-in (optional)
            </label>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='mb-1 block text-xs text-gray-600 dark:text-[#9E8B76]'>
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
                <label className='mb-1 block text-xs text-gray-600 dark:text-[#9E8B76]'>
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
          <div className='flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-[#2a1d10]'>
            <button
              onClick={closeModal}
              disabled={loading}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold',
                'text-gray-700 hover:bg-gray-100 dark:text-[#C4B5A0] dark:hover:bg-[#231a10]',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || selectedTags.length === 0 || !effortLevel || loading}
              className={cn(
                'rounded-full bg-[#C97D60] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B56540]',
                (!text.trim() || selectedTags.length === 0 || !effortLevel || loading) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Joining...
                </span>
              ) : (
                'Join Action 🌱'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

