import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import {
  createReview,
  createRating,
  updateReview
} from '@lib/firebase/utils/review';
import { cn } from '@lib/utils';
import { Modal } from '@components/modal/modal';
import { HeroIcon } from '@components/ui/hero-icon';
import type { ReviewWithUser } from '@lib/types/review';
import type { ViewingActivity } from '@components/activity/types';

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  viewingActivity: ViewingActivity;
  existingReview?: ReviewWithUser | null;
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
  existingReview,
  onReviewAdded
}: ReviewModalProps): JSX.Element {
  const { user } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingReview) {
      // Convert rating to emoji
      const ratingToEmoji = {
        love: '😍',
        hate: '😢',
        meh: '😐'
      };
      setSelectedEmoji(ratingToEmoji[existingReview.rating] ?? '😐');
      setSelectedTags(existingReview.tags ?? []);
      setReviewText(existingReview.review ?? '');
    } else {
      setSelectedEmoji(null);
      setSelectedTags([]);
      setReviewText('');
    }
  }, [existingReview]);

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
      const emojiToRating = {
        '😍': 'love',
        '😊': 'love',
        '😐': 'meh',
        '😕': 'hate',
        '😢': 'hate'
      } as const;

      const ratingType = selectedEmoji
        ? emojiToRating[selectedEmoji as keyof typeof emojiToRating]
        : 'love';

      let newReview;

      if (existingReview) {
        // Update existing review
        newReview = await updateReview(existingReview.id, user.id, {
          review: reviewText,
          rating: ratingType,
          tags: selectedTags
        });
      } else {
        // Create new review
        const reviewData = {
          tmdbId: Number(viewingActivity.tmdbId),
          userId: user.id,
          title: viewingActivity.title,
          mediaType: viewingActivity.mediaType ?? 'movie',
          rating: ratingType,
          review: reviewText,
          tags: selectedTags,
          posterPath: viewingActivity.poster_path
        };

        newReview = await createReview(reviewData);

        // Also save a rating based on the emoji selection
        try {
          await createRating({
            tmdbId: Number(viewingActivity.tmdbId),
            userId: user.id,
            title: viewingActivity.title,
            mediaType: viewingActivity.mediaType ?? 'movie',
            posterPath: viewingActivity.poster_path,
            rating: ratingType,
            overview: viewingActivity.overview,
            releaseDate: viewingActivity.releaseDate,
            voteAverage: 0 // Default value if not available
          });
        } catch (ratingError) {
          // console.error('Error saving rating:', ratingError);
          // Don't fail the review if rating fails
        }
      }

      onReviewAdded?.(newReview);
      onClose();
      toast.success(
        existingReview
          ? 'Review updated successfully!'
          : 'Review posted successfully!'
      );
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
        'bg-white dark:bg-[#1c1510]',
        'rounded-2xl',
        'shadow-xl',
        'border border-gray-100 dark:border-[#2a1d10]'
      )}
      open={isOpen}
      closeModal={onClose}
    >
      <div className='flex flex-col p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-bold'>Review {viewingActivity.title}</h2>
          <button
            onClick={onClose}
            className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-[#231a10]'
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
                    ? 'bg-[rgba(201,169,110,0.06)] dark:bg-[rgba(201,169,110,0.08)]'
                    : 'hover:bg-gray-50 dark:hover:bg-[#231a10]'
                )}
                title={label}
              >
                <span className='text-xl transition-transform duration-200 group-hover:scale-110'>
                  {emoji}
                </span>
                <span className='text-xs text-gray-500 dark:text-[#9E8B76]'>
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
                  ? 'bg-[#C97D60] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1c1510] dark:text-[#C4B5A0] dark:hover:bg-[#231a10]'
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
            'bg-gray-50 dark:bg-[#1c1510]',
            'border border-gray-200 dark:border-[#2a1d10]',
            'focus:border-[#C9A96E] focus:ring-[rgba(201,169,110,0.35)]',
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
              'bg-gray-100 dark:bg-[#1c1510]',
              'text-gray-700 dark:text-[#C4B5A0]',
              'hover:bg-gray-200 dark:hover:bg-[#231a10]'
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading ?? !reviewText.trim()}
            className={cn(
              'flex items-center gap-2',
              'px-4 py-2',
              'rounded-lg',
              'font-medium',
              'bg-[#C97D60] dark:bg-[#C97D60]',
              'text-white',
              'hover:bg-[#C97D60] dark:hover:bg-[#B56540]',
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
