import { Input } from '@components/input/input';
import type { TweetProps } from '@components/tweet/tweet';
import { ViewingActivity } from '@components/activity/types';
import { cn } from '@lib/utils';
import { useState } from 'react';
import { createReview } from '@lib/firebase/utils/review';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';

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

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (data: ViewingActivity) => {
    console.log('Starting review submission:', { data, user });

    if (!user?.id) {
      console.error('No authenticated user found');
      toast.error('Please sign in to post a review');
      return;
    }

    try {
      const reviewData = {
        tmdbId: Number(data.tmdbId),
        userId: user.id,
        title: data.title,
        mediaType: data.mediaType || 'movie',
        rating: selectedEmoji || '',
        review: data.review || '',
        tags: selectedTags,
        posterPath: data.poster_path,
        tweetId: tweet.id
      };

      console.log('Creating review with data:', reviewData);
      const newReview = await createReview(reviewData);
      console.log('Review created successfully:', newReview);

      // Update UI
      onReviewAdded?.(newReview);

      // Create associated tweet
      const tweetData = {
        ...data,
        review: data.review || '',
        tags: selectedTags,
        rating: selectedEmoji || '😐'
      };

      await onReply(tweetData);
      closeModal();
      toast.success('Review posted successfully!');
    } catch (error) {
      console.error('Error posting review:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to post review'
      );
    }
  };

  return (
    <div className='flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-100 p-3 dark:border-gray-800'>
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
        />
      </div>
    </div>
  );
}
