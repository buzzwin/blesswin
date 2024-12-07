import { useState } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { Popover } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import type { ReactNode } from 'react';
import Image from 'next/image';

// Firebase imports
import { query, where, orderBy, getDocs } from 'firebase/firestore';
import { tweetsCollection } from '@lib/firebase/collections';
import { manageBookmark } from '@lib/firebase/utils';
import { getMediaReviews } from '@lib/firebase/utils/review';

// Context imports
import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';

// Component imports
import { Modal } from '@components/modal/modal';
import { TweetReplyModal } from '@components/modal/tweet-reply-modal';
import { UserAvatar } from '@components/user/user-avatar';
import { TweetDate } from './tweet-date';
import { TweetStats } from './tweet-stats';
import { TweetReviews } from './tweet-reviews';
import { Loading } from '@components/ui/loading';
import { HeroIcon } from '@components/ui/hero-icon';
import type { IconName } from '@components/ui/hero-icon';

// Utils and types
import { cn } from '@lib/utils';
import type { Tweet } from '@lib/types/tweet';
import type { User } from '@lib/types/user';
import type { ViewingActivity } from '@components/activity/types';
import type { ReviewWithUser } from '@lib/types/review';
import type { TweetWithUser } from '@lib/types/tweet';
import { AddToWatchlistModal } from '@components/bookmarks/add-to-watchlist-modal';

export type TweetProps = Tweet & {
  user: User;
  profile?: User | null;
  modal?: boolean;
  pinned?: boolean;
  parentTweet?: boolean;
};

export function Tweet(tweet: TweetProps): JSX.Element {
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWatchlistModalOpen, setIsWatchlistModalOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<TweetWithUser[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const {
    id: tweetId,
    text,
    images,
    parent,
    userLikes,
    createdBy,
    createdAt,
    userReplies,
    userRetweets,
    viewingActivity,
    photoURL,
    user: tweetUserData,
    modal,
    pinned,
    parentTweet,
    userWatching,
    totalWatchers
  } = tweet;

  const { user, userBookmarks } = useAuth();
  const { push } = useRouter();
  const { open, openModal, closeModal } = useModal();

  const tweetLink = `/buzz/${tweetId}`;
  const userId = user?.id;

  const { id: tweetUserId, name, username, verified } = tweetUserData;
  const isOwner = userId === createdBy;

  const tweetIsBookmarked = !!userBookmarks?.some(({ id }) => id === tweetId);

  const toggleUserInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUserInfoOpen(!isUserInfoOpen);
    setIsMenuOpen(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    setIsUserInfoOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this buzz?')) {
      try {
        const result = await fetch(`/api/tweets/${tweetId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!result.ok) {
          throw new Error(`Failed to delete buzz: ${result.statusText}`);
        }

        toast.success('Buzz deleted successfully');

        try {
          await push('/');
        } catch (navigationError) {
          console.error('Navigation error:', navigationError);
          // Still consider the operation successful since deletion worked
        }
      } catch (error) {
        console.error('Error deleting buzz:', error);
        toast.error('Failed to delete buzz');
      } finally {
        setIsMenuOpen(false);
      }
    } else {
      setIsMenuOpen(false);
    }
  };

  const handleAddToWatchlist = async (watchlistId: string): Promise<void> => {
    if (!viewingActivity || !userId) return;

    const bookmarkData = {
      title: viewingActivity.title,
      description: viewingActivity.review || viewingActivity.overview || '',
      mediaType: viewingActivity.mediaType || 'movie',
      posterPath: viewingActivity.poster_path || '',
      watchlistId,
      mediaId: viewingActivity.tmdbId.toString(),
      tags: [],
      userId,
      createdAt: new Date()
    };

    try {
      await manageBookmark(
        'bookmark',
        userId,
        viewingActivity.tmdbId.toString(),
        bookmarkData
      );
      toast.success('Added to watchlist!');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
    }
  };

  const handleWatchlistClick = (e: React.MouseEvent): void => {
    setIsWatchlistModalOpen(true);
  };

  const bookmarkIconName: IconName = tweetIsBookmarked
    ? 'BookmarkIcon'
    : 'BookmarkIcon';
  const menuIconName: IconName = 'EllipsisHorizontalIcon';
  const deleteIconName: IconName = 'TrashIcon';

  interface ErrorResponse {
    message?: string;
  }

  const handleReplyClick = async (
    replyData?: ViewingActivity
  ): Promise<void> => {
    if (!userId || !user) {
      toast.error('Please sign in to reply');
      return;
    }

    if (!replyData) {
      openModal();
      return;
    }

    try {
      const tweetData = {
        text: replyData.review || '',
        images: null,
        parent: {
          id: tweetId,
          username: username
        },
        userLikes: [],
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: null,
        userReplies: 0,
        userRetweets: [],
        viewingActivity: {
          ...replyData,
          tmdbId: replyData.tmdbId
        },
        photoURL: user.photoURL || '',
        userWatching: [],
        totalWatchers: 0
      };

      const result = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tweetData)
      });

      if (!result.ok) {
        const error = (await result.json()) as ErrorResponse;
        throw new Error(error.message ?? 'Failed to post reply');
      }

      toast.success('Review posted successfully!');
      closeModal();
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to post reply'
      );
    }
  };

  const loadReplies = async () => {
    if (!showReplies) {
      setLoadingReplies(true);
      setLoadingReviews(true);
      try {
        console.log('Loading replies and reviews for tweet:', tweet.id);
        console.log('Media ID:', tweet.viewingActivity?.tmdbId);

        const [repliesSnapshot, reviewsData] = await Promise.all([
          getDocs(
            query(
              tweetsCollection,
              where('parent.id', '==', tweet.id),
              orderBy('createdAt', 'desc')
            )
          ),
          getMediaReviews(Number(tweet.viewingActivity?.tmdbId))
        ]);

        const replyDocs = repliesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt
          };
        }) as TweetWithUser[];

        const typedReviews = reviewsData.map((review) => ({
          ...review,
          createdAt: {
            ...review.createdAt,
            toDate: () => new Date(review.createdAt)
          }
        })) as unknown as ReviewWithUser[];

        console.log('Loaded replies:', replyDocs);
        console.log('Loaded reviews:', typedReviews);

        setReplies(replyDocs);
        setReviews(typedReviews);
      } catch (error) {
        console.error('Error loading replies and reviews:', error);
      } finally {
        setLoadingReplies(false);
        setLoadingReviews(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const handleReviewAdded = (newReview: ReviewWithUser) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleError = (error: unknown): void => {
    console.error('Error:', error);
    const message =
      error instanceof Error ? error.message : 'An error occurred';
    toast.error(message);
  };

  return (
    <>
      <article
        className={cn(
          'relative',
          'p-1',
          'transition-all duration-300',
          !parentTweet && 'hover:scale-[1.01]',
          'group',
          'pb-2'
        )}
      >
        {/* Film Border Effect */}
        <div
          className={cn(
            'absolute inset-0',
            'bg-gradient-to-r from-black via-transparent to-black',
            'opacity-10 dark:opacity-20'
          )}
        />

        {/* Main Content Card */}
        <div
          className={cn(
            'relative',
            'bg-white dark:bg-gray-900',
            'overflow-hidden rounded-xl',
            'shadow-md hover:shadow-xl',
            'transition-all duration-300',
            'border border-gray-100 dark:border-gray-800'
          )}
        >
          <Modal
            className='flex items-start justify-center'
            modalClassName='bg-main-background rounded-2xl max-w-xl w-full my-8 overflow-hidden'
            open={open}
            closeModal={closeModal}
          >
            <TweetReplyModal
              tweet={tweet}
              closeModal={closeModal}
              onReply={handleReplyClick}
              onReviewAdded={handleReviewAdded}
            />
          </Modal>

          {/* Blog Post Layout */}
          <div className='flex flex-col'>
            {/* Movie/Show Poster Section */}
            {viewingActivity?.poster_path && (
              <div className='relative'>
                {/* Background Banner */}
                <div className='relative h-16 overflow-hidden'>
                  <div
                    className='absolute inset-0 bg-cover bg-center blur-sm'
                    style={{
                      backgroundImage: `url(https://image.tmdb.org/t/p/w500${viewingActivity.poster_path})`,
                      transform: 'scale(1.1)'
                    }}
                  />
                  <div className='absolute inset-0 bg-black/40' />

                  {/* Watchlist Button */}
                  {viewingActivity && (
                    <>
                      <AddToWatchlistModal
                        isOpen={isWatchlistModalOpen}
                        onClose={() => setIsWatchlistModalOpen(false)}
                        onAdd={handleAddToWatchlist}
                        mediaData={{
                          id: viewingActivity.tmdbId.toString(),
                          title: viewingActivity.title,
                          description: viewingActivity.review || '',
                          mediaType: viewingActivity.mediaType || 'movie',
                          posterPath: viewingActivity.poster_path
                        }}
                      />
                      <div
                        className='absolute top-4 right-4 z-50'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type='button'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsWatchlistModalOpen(true);
                          }}
                          className={cn(
                            'rounded-lg',
                            'px-4 py-2',
                            'bg-white/10 backdrop-blur-sm',
                            'hover:bg-white/20',
                            'transition-colors duration-200',
                            'z-10',
                            'relative',
                            'cursor-pointer',
                            'flex items-center gap-2',
                            'min-h-[44px]',
                            'focus:outline-none focus:ring-2 focus:ring-white/50',
                            'active:scale-95',
                            'shadow-lg'
                          )}
                        >
                          <HeroIcon
                            iconName='BookmarkIcon'
                            className='pointer-events-none h-5 w-5 text-white'
                          />
                          <span className='text-sm font-medium text-white'>
                            Add to Watchlist
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Content Layout */}
                <div className='px-6 pt-4'>
                  {/* Poster and Title Section */}
                  <div className='relative -mt-16 flex gap-4 pb-4'>
                    {/* Poster */}
                    <div
                      className={cn(
                        'relative shrink-0',
                        'h-36 w-24 xs:h-48 xs:w-32',
                        'overflow-hidden rounded-lg',
                        'shadow-lg ring-1 ring-black/10',
                        'transition-transform duration-300',
                        'group-hover:scale-105'
                      )}
                    >
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${viewingActivity.poster_path}`}
                        alt={viewingActivity.title}
                        width={144}
                        height={216}
                        className='h-full w-full object-cover'
                      />
                    </div>

                    {/* Title and User Info */}

                    <div className='min-w-0 flex-1 pt-10'>
                      <div className='flex items-start justify-between'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-3'>
                            <button
                              onClick={toggleUserInfo}
                              className={cn(
                                'flex items-center gap-3',
                                'transition-colors duration-200',
                                'hover:bg-gray-100 dark:hover:bg-gray-800/50',
                                '-ml-2 rounded-xl p-2'
                              )}
                            >
                              <UserAvatar
                                src={photoURL}
                                alt={name}
                                username={username}
                              />
                              <div className='flex flex-col'>
                                <span
                                  className={cn(
                                    'text-sm font-medium',
                                    'text-gray-900 dark:text-gray-100'
                                  )}
                                >
                                  {name}
                                  {verified && (
                                    <HeroIcon
                                      className='ml-1 inline-block h-4 w-4 text-emerald-500'
                                      iconName='CheckBadgeIcon'
                                    />
                                  )}
                                </span>
                                <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                                  <span>@{username}</span>
                                  <span>·</span>
                                  <TweetDate
                                    tweetLink={tweetLink}
                                    createdAt={createdAt}
                                  />
                                </div>
                              </div>
                            </button>
                          </div>
                          <span
                            className={cn(
                              'inline-flex items-center',
                              'rounded-full px-2.5 py-0.5',
                              'text-sm font-medium',
                              'bg-emerald-50 dark:bg-emerald-900/20',
                              'text-emerald-600 dark:text-emerald-400',
                              'border border-emerald-100 dark:border-emerald-800'
                            )}
                          >
                            {viewingActivity.status}
                          </span>
                          <h2
                            className={cn(
                              'text-xl font-bold',
                              'text-gray-900 dark:text-white',
                              'line-clamp-2'
                            )}
                          >
                            {viewingActivity.title}
                          </h2>
                        </div>

                        {/* Menu Button */}
                        {isOwner && (
                          <div className='relative'>
                            <button
                              onClick={toggleMenu}
                              className={cn(
                                'rounded-full p-2',
                                'hover:bg-gray-100 dark:hover:bg-gray-800',
                                'transition-colors duration-200'
                              )}
                            >
                              <HeroIcon
                                iconName={menuIconName}
                                className='h-5 w-5 text-gray-500 dark:text-gray-400'
                              />
                            </button>

                            {/* Menu Popup */}
                            <AnimatePresence>
                              {isMenuOpen && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                  className={cn(
                                    'absolute right-0 mt-2',
                                    'w-48',
                                    'rounded-xl',
                                    'bg-white dark:bg-gray-900',
                                    'shadow-lg ring-1 ring-gray-200 dark:ring-gray-800',
                                    'py-1',
                                    'z-50'
                                  )}
                                >
                                  <button
                                    onClick={handleDelete}
                                    className={cn(
                                      'w-full px-4 py-2',
                                      'flex items-center gap-3',
                                      'text-left text-sm',
                                      'hover:bg-red-50 dark:hover:bg-red-900/20',
                                      'transition-colors duration-200'
                                    )}
                                  >
                                    <HeroIcon
                                      iconName={deleteIconName}
                                      className='h-5 w-5 text-red-500'
                                    />
                                    <span className='text-red-600 dark:text-red-400'>
                                      Delete Buzz
                                    </span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className='space-y-4 px-6 py-4 pb-24'>
              {/* User Info */}

              {/* Review */}
              {viewingActivity?.review && (
                <p
                  className={cn(
                    'text-gray-600 dark:text-gray-400',
                    'text-[15px] leading-relaxed'
                  )}
                >
                  {viewingActivity.review}
                </p>
              )}

              {/* Additional Images */}
              {images && images.length > 0 && (
                <div
                  className={cn(
                    'grid gap-2',
                    images.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
                    'overflow-hidden rounded-xl'
                  )}
                >
                  {images.map((image, i) => (
                    <div
                      key={image.id}
                      className={cn(
                        'relative overflow-hidden',
                        'aspect-square',
                        images.length === 3 && i === 0 && 'col-span-2'
                      )}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={500}
                        height={500}
                        className={cn(
                          'h-full w-full object-cover',
                          'transition duration-300',
                          'hover:scale-105'
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Tweet Stats */}
              {!parentTweet && (
                <div className='border-t border-gray-100 pt-3 dark:border-gray-800'>
                  <TweetStats
                    reply={!!parent}
                    userId={userId as string}
                    isOwner={isOwner}
                    tweetId={tweetId}
                    userLikes={userLikes}
                    userRetweets={userRetweets}
                    userReplies={userReplies}
                    viewTweet={false}
                    viewingActivity={viewingActivity}
                    text={text || ''}
                    openModal={handleReplyClick}
                    userWatching={userWatching}
                    totalWatchers={totalWatchers}
                  />
                </div>
              )}

              {/* Add Watching Badge when applicable */}
              {userId && userWatching?.includes(userId) && (
                <div className='absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1'>
                  <HeroIcon
                    iconName='EyeIcon'
                    className='h-4 w-4 text-emerald-500'
                  />
                  <span className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                    Watching this
                  </span>
                </div>
              )}

              {/* Show total watchers prominently */}
              {totalWatchers > 0 && (
                <div className='mt-2 flex items-center gap-1.5 text-gray-500 dark:text-gray-400'>
                  <HeroIcon iconName='UsersIcon' className='h-5 w-5' />
                  <span className='text-sm'>
                    {totalWatchers} {totalWatchers === 1 ? 'person' : 'people'}{' '}
                    watching
                  </span>
                </div>
              )}

              {/* Show replies button */}
              {tweet.userReplies > 0 && (
                <button
                  onClick={loadReplies}
                  className={cn(
                    'mt-2 flex items-center gap-2',
                    'text-sm text-gray-500 hover:text-gray-700',
                    'dark:text-gray-400 dark:hover:text-gray-200',
                    'transition-colors duration-200'
                  )}
                >
                  <HeroIcon
                    iconName={showReplies ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                    className='h-5 w-5'
                  />
                  {showReplies ? 'Hide' : 'Show'} {tweet.userReplies}{' '}
                  {tweet.userReplies === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Replies section */}
      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='ml-12 border-l border-gray-200 pl-4 dark:border-gray-800'
          >
            {/* Reviews Section */}
            <div className='mb-6'>
              <h3 className='mb-4 font-medium text-gray-900 dark:text-white'>
                Reviews ({reviews.length})
              </h3>
              <TweetReviews reviews={reviews} loading={loadingReviews} />
            </div>

            {/* Replies Section */}
            {loadingReplies ? (
              <div className='py-4'>
                <Loading />
              </div>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className='py-4'>
                  <div className='flex items-start gap-3'>
                    <UserAvatar
                      src={reply.photoURL}
                      alt={reply.user.name}
                      username={reply.user.username}
                    />
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-gray-900 dark:text-white'>
                          {reply.user.name}
                        </span>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>
                          @{reply.user.username}
                        </span>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>
                          ·
                        </span>
                        <TweetDate
                          tweetLink={`/buzz/${reply.id}`}
                          createdAt={reply.createdAt}
                        />
                      </div>
                      {reply.viewingActivity?.review && (
                        <p className='mt-2 text-gray-600 dark:text-gray-300'>
                          {reply.viewingActivity.review}
                        </p>
                      )}
                      {reply.viewingActivity?.tags &&
                        reply.viewingActivity.tags.length > 0 && (
                          <div className='mt-2 flex flex-wrap gap-2'>
                            {reply.viewingActivity.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className={cn(
                                  'rounded-full px-2 py-1 text-xs',
                                  'bg-gray-100 dark:bg-gray-800',
                                  'text-gray-600 dark:text-gray-300'
                                )}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
