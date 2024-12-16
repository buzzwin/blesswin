import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { Modal } from '@components/modal/modal';
import { HeroIcon } from '@components/ui/hero-icon';
import { cn } from '@lib/utils';
import type { ReviewWithUser } from '@lib/types/review';
import type { ViewingActivity } from '@components/activity/types';
import { createReview } from '@lib/firebase/utils/review';

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  viewingActivity: ViewingActivity;
  onReviewAdded?: (review: ReviewWithUser) => void;
};

const EMOJI_RATINGS = [
  { emoji: '😍', label: 'Loved it' },
  { emoji: '😊', label: 'Liked it' },
  { emoji: '😐', label: 'It was okay' },
  { emoji: '😕', label: 'Not great' },
  { emoji: '😢', label: 'Disappointed' }
];

const QUICK_TAGS = [
  'Great story!',
  'Amazing visuals',
  'Great acting',
  'Highly recommended',
  'Must watch',
  'Not worth it',
  'Overrated',
  'Underrated'
];

export function ReviewModal({
  isOpen,
  onClose,
  viewingActivity,
  onReviewAdded
}: ReviewModalProps): JSX.Element {
  const { user } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Please sign in to post a review');
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        tmdbId: Number(viewingActivity.tmdbId),
        userId: user.id,
        title: viewingActivity.title,
        mediaType: viewingActivity.mediaType || 'movie',
        rating: selectedEmoji || '',
        review: reviewText,
        tags: selectedTags,
        posterPath: viewingActivity.poster_path
      };

      const newReview = await createReview(reviewData);
      onReviewAdded?.(newReview);
      onClose();
      toast.success('Review posted successfully!');
    } catch (error) {
      toast.error('Failed to post review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      modalClassName={cn(
        'relative w-full max-w-xl',
        'bg-white dark:bg-gray-900',
        'rounded-2xl',
        'shadow-xl',
        'border border-gray-100 dark:border-gray-800'
      )}
      open={isOpen}
      closeModal={onClose}
    >
      <div className='flex flex-col p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-bold'>Review {viewingActivity.title}</h2>
          <button
            onClick={onClose}
            className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <HeroIcon iconName='XMarkIcon' className='h-5 w-5' />
          </button>
        </div>

        {/* Emoji Rating */}
        <div className='mb-4'>
          <div className='flex justify-between'>
            {EMOJI_RATINGS.map(({ emoji, label }) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={cn(
                  'group flex flex-col items-center',
                  'rounded-lg px-2 py-1.5',
                  'transition-all duration-200',
                  selectedEmoji === emoji
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                title={label}
              >
                <span className='text-xl transition-transform duration-200 group-hover:scale-110'>
                  {emoji}
                </span>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Tags */}
        <div className='mb-4 flex flex-wrap gap-2'>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={cn(
                'rounded-full px-3 py-1',
                'text-sm font-medium',
                'transition-colors duration-200',
                selectedTags.includes(tag)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Review Text */}
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder='Share your thoughts...'
          className={cn(
            'mb-4 h-32 w-full resize-none rounded-lg p-3',
            'bg-gray-50 dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'focus:border-emerald-500 focus:ring-emerald-500',
            'placeholder-gray-400 dark:placeholder-gray-500'
          )}
        />

        {/* Action Buttons */}
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className={cn(
              'px-4 py-2',
              'rounded-lg',
              'font-medium',
              'bg-gray-100 dark:bg-gray-800',
              'text-gray-700 dark:text-gray-300',
              'hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reviewText.trim()}
            className={cn(
              'flex items-center gap-2',
              'px-4 py-2',
              'rounded-lg',
              'font-medium',
              'bg-emerald-500 dark:bg-emerald-600',
              'text-white',
              'hover:bg-emerald-600 dark:hover:bg-emerald-700',
              'disabled:opacity-50'
            )}
          >
            {loading ? (
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
            ) : (
              <HeroIcon iconName='PaperAirplaneIcon' className='h-4 w-4' />
            )}
            {loading ? 'Posting...' : 'Share Review'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
