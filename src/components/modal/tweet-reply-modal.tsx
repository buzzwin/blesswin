import type { TweetProps } from '@components/tweet/tweet';
import { Input } from '@components/input/input';
import type { ReviewWithUser } from '@lib/types/review';
import { ViewingActivity } from '@components/activity/types';
import { cn } from '@lib/utils';
import { useState } from 'react';
import { createReview } from '@lib/firebase/utils/review';
import { createRating } from '@lib/firebase/utils/review';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import { HeroIcon } from '@components/ui/hero-icon';

type TweetReplyModalProps = {
  tweet: TweetProps;
  closeModal: () => void;
  onReply: (data: ViewingActivity) => Promise<void>;
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

export function TweetReplyModal({
  tweet,
  closeModal,
  onReply,
  onReviewAdded
}: TweetReplyModalProps): JSX.Element {
  const { user } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState('');

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleSubmit = async (data: ViewingActivity) => {
    setLoading(true);

    try {
      if (!user?.id) {
        toast.error('Please sign in to post a review');
        return;
      }

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

      // Create review with the actual input value
      const reviewData = {
        tmdbId: Number(tweet.viewingActivity.tmdbId),
        userId: user.id,
        title: tweet.viewingActivity.title,
        mediaType: tweet.viewingActivity.mediaType ?? 'movie',
        rating: ratingType,
        review: inputValue, // Use the stored input value instead of data.review
        tags: selectedTags,
        posterPath: tweet.viewingActivity.poster_path,
        tweetId: tweet.id
      };

      // First create the review
      try {
        const newReview = await createReview(reviewData);
        onReviewAdded?.(newReview);
      } catch (error) {
        // console.error('Error creating review:', error);
        throw new Error('Failed to save review. Please try again.');
      }

      // Also save a rating based on the emoji selection
      try {
        await createRating({
          tmdbId: Number(tweet.viewingActivity.tmdbId),
          userId: user.id,
          title: tweet.viewingActivity.title,
          mediaType: tweet.viewingActivity.mediaType ?? 'movie',
          posterPath: tweet.viewingActivity.poster_path,
          rating: ratingType,
          overview: tweet.viewingActivity.overview,
          releaseDate: tweet.viewingActivity.releaseDate,
          voteAverage: 0 // Default value if not available
        });
      } catch (ratingError) {
        // console.error('Error saving rating:', ratingError);
        // Don't fail the review if rating fails
      }

      // Then create the associated tweet
      try {
        const tweetData = {
          ...tweet.viewingActivity,
          parent: {
            id: tweet.id,
            username: tweet.user.username
          },
          review: inputValue, // Use the stored input value
          tags: selectedTags,
          rating: selectedEmoji ?? '😐'
        };
        await onReply(tweetData);
      } catch (error) {
        // console.error('Error creating tweet:', error);
        throw new Error('Failed to post tweet. Please try again.');
      }

      closeModal();
      toast.success('Review posted successfully!');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to post review';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col'>
      {/* Header */}
      <div className='p-3'>
        <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
          Review {tweet.viewingActivity?.title}
        </h2>
        {selectedEmoji && <span className='text-2xl'>{selectedEmoji}</span>}
      </div>

      {/* Content */}
      <div className='space-y-4 p-3'>
        {/* Emoji Rating */}
        <div>
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
                <span
                  className={cn(
                    'text-xs',
                    'transition-colors duration-200',
                    selectedEmoji === emoji
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Tags */}
        <div className='flex flex-wrap gap-1.5'>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={cn(
                'rounded-full px-2.5 py-1',
                'text-xs font-medium',
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

        {/* Review Input */}
        <Input
          modal
          replyModal
          placeholder='Share your thoughts...'
          parent={{
            id: tweet.id,
            username: tweet.user.username,
            viewingActivity: tweet.viewingActivity
          }}
          closeModal={closeModal}
          onSubmit={handleSubmit}
          selectedTags={selectedTags}
          selectedEmoji={selectedEmoji}
          onChange={handleInputChange}
          value={inputValue}
        />

        {/* Add Share Review Button */}
        <div className='flex justify-end gap-3 border-t border-gray-100 pt-3 dark:border-gray-800'>
          <button
            onClick={closeModal}
            className={cn(
              'px-4 py-2',
              'rounded-xl',
              'text-sm font-medium',
              'bg-gray-100 dark:bg-gray-800',
              'text-gray-700 dark:text-gray-300',
              'hover:bg-gray-200 dark:hover:bg-gray-700',
              'transition-colors duration-200'
            )}
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit(tweet.viewingActivity)}
            disabled={loading}
            className={cn(
              'px-4 py-2',
              'rounded-xl',
              'text-sm font-medium',
              'bg-emerald-500 dark:bg-emerald-600',
              'text-white',
              'hover:bg-emerald-600 dark:hover:bg-emerald-700',
              'transition-colors duration-200',
              'flex items-center gap-2',
              'disabled:cursor-not-allowed disabled:opacity-50'
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
    </div>
  );
}
