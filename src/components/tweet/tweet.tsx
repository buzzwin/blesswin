import Link from 'next/link';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { Modal } from '@components/modal/modal';
import { TweetReplyModal } from '@components/modal/tweet-reply-modal';
import { ImagePreview } from '@components/input/image-preview';
import { UserAvatar } from '@components/user/user-avatar';
import { UserTooltip } from '@components/user/user-tooltip';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { TweetActions } from './tweet-actions';
import { TweetStats } from './tweet-stats';
import { TweetDate } from './tweet-date';
import { HeroIcon } from '@components/ui/hero-icon';
import { Button } from '@components/ui/button';
import { Popover } from '@headlessui/react';
import { cn, preventBubbling } from '@lib/utils';
import { manageBookmark } from '@lib/firebase/utils';
import { toast } from 'react-hot-toast';
import { variants } from './tweet-actions';
import type { Tweet } from '@lib/types/tweet';
import type { User } from '@lib/types/user';
import { useState } from 'react';
import { IconName } from '@components/ui/hero-icon';

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
    parentTweet
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

  const handleBookmark = (closeMenu: () => void) => async (): Promise<void> => {
    closeMenu();
    const type = tweetIsBookmarked ? 'unbookmark' : 'bookmark';

    await manageBookmark(type, userId as string, tweetId);

    toast.success(
      type === 'bookmark'
        ? (): JSX.Element => (
            <span className='flex gap-2'>
              Added to your Watchlist
              <Link href='/bookmarks'>
                <a className='custom-underline font-bold'>View</a>
              </Link>
            </span>
          )
        : 'Removed from your Watchlist'
    );
  };

  const bookmarkIconName: IconName = tweetIsBookmarked
    ? 'BookmarkIcon'
    : 'BookmarkIcon';
  const menuIconName: IconName = 'EllipsisHorizontalIcon';
  const deleteIconName: IconName = 'TrashIcon';

  return (
    <article
      className={cn(
        'relative',
        'p-1',
        'transition-all duration-300',
        !parentTweet && 'hover:scale-[1.01]',
        'group'
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
          <TweetReplyModal tweet={tweet} closeModal={closeModal} />
        </Modal>

        {/* Blog Post Layout */}
        <div className='flex flex-col'>
          {/* Movie/Show Poster Section */}
          {viewingActivity?.poster_path && (
            <div className='relative'>
              {/* Background Banner */}
              <div className='relative h-32 overflow-hidden'>
                <div
                  className='absolute inset-0 bg-cover bg-center blur-sm'
                  style={{
                    backgroundImage: `url(https://image.tmdb.org/t/p/w500${viewingActivity.poster_path})`,
                    transform: 'scale(1.1)'
                  }}
                />
                <div className='absolute inset-0 bg-black/40' />

                {/* Watchlist Button */}
                <div className='absolute top-4 right-4'>
                  <Popover className='relative'>
                    {({ open, close }): JSX.Element => (
                      <>
                        <Popover.Button
                          as={Button}
                          className={cn(
                            'flex items-center gap-2',
                            'px-3 py-1.5',
                            'rounded-full',
                            'text-sm font-medium',
                            'transition-all duration-200',
                            'backdrop-blur-md',
                            tweetIsBookmarked
                              ? [
                                  'bg-emerald-500/90 hover:bg-emerald-600/90',
                                  'text-white',
                                  'ring-2 ring-emerald-500/20'
                                ]
                              : [
                                  'bg-black/20 hover:bg-black/30',
                                  'text-white',
                                  'ring-1 ring-white/20'
                                ]
                          )}
                        >
                          <HeroIcon
                            iconName={bookmarkIconName}
                            className={cn(
                              'h-4 w-4',
                              'transition-transform duration-200',
                              'group-hover:scale-110',
                              tweetIsBookmarked && 'text-white'
                            )}
                          />
                          <span className='hidden xs:inline'>
                            {tweetIsBookmarked
                              ? 'In your Watchlist'
                              : 'Add to Watchlist'}
                          </span>
                        </Popover.Button>
                        <AnimatePresence>
                          {open && (
                            <Popover.Panel
                              className='absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800'
                              as={motion.div}
                              {...variants}
                              static
                            >
                              <Popover.Button
                                className={cn(
                                  'flex w-full items-center gap-3 p-4 text-left text-sm',
                                  tweetIsBookmarked
                                    ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                                    : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                                )}
                                as={Button}
                                onClick={preventBubbling(handleBookmark(close))}
                              >
                                <HeroIcon
                                  iconName={
                                    tweetIsBookmarked
                                      ? 'BookmarkSlashIcon'
                                      : bookmarkIconName
                                  }
                                  className={cn(
                                    'h-5 w-5',
                                    tweetIsBookmarked
                                      ? 'text-red-500'
                                      : 'text-emerald-500'
                                  )}
                                />
                                {tweetIsBookmarked
                                  ? 'Remove from Watchlist'
                                  : 'Add to Watchlist'}
                              </Popover.Button>
                            </Popover.Panel>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </Popover>
                </div>
              </div>

              {/* Content Layout */}
              <div className='px-6'>
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
                    <img
                      src={`https://image.tmdb.org/t/p/w500${viewingActivity.poster_path}`}
                      alt={viewingActivity.title}
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
          <div className='space-y-4 px-6 py-4'>
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
                    <img
                      src={image.src}
                      alt={image.alt}
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
                  openModal={openModal}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
