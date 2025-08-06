import Link from 'next/link';
import cn from 'clsx';
import { Dialog, Popover } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { manageBookmark } from '@lib/firebase/utils';
import { preventBubbling } from '@lib/utils';
import { siteURL } from '@lib/env';
import { Tweet } from '@lib/types/tweet';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { ToolTip } from '@components/ui/tooltip';
import { Modal } from '@components/modal/modal';
import ShareButtons from '@components/share/sharebuttons';
import { variants } from './tweet-actions';
import type { ViewingActivity } from '@components/activity/types';

type TweetShareProps = {
  userId: string;
  tweetId: string;
  viewTweet?: boolean;
  viewingActivity: ViewingActivity; // Added  this line
  text: string;
};

export function TweetShare({
  userId,
  tweetId,
  viewTweet,
  viewingActivity,
  text
}: TweetShareProps): JSX.Element {
  const { userBookmarks } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);

  const handleBookmark =
    (closeMenu: () => void, ...args: Parameters<typeof manageBookmark>) =>
    async (): Promise<void> => {
      const [type] = args;

      closeMenu();
      await manageBookmark(...args);

      toast.success(
        type === 'bookmark'
          ? (): JSX.Element => (
              <span className='flex gap-2'>
                Buzz added to your Bookmarks
                <Link href='/bookmarks'>
                  <a className='custom-underline font-bold'>View</a>
                </Link>
              </span>
            )
          : 'Buzz removed from your bookmarks'
      );
    };

  const handleCopy = (closeMenu: () => void) => async (): Promise<void> => {
    closeMenu();
    await navigator.clipboard.writeText(`${siteURL}/public/${tweetId}`);
    toast.success('Copied to clipboard');
  };

  const handleShare = (closeMenu: () => void) => async (): Promise<void> => {
    closeMenu();
    await navigator.clipboard.writeText(`${siteURL}/public/${tweetId}`);
    setShowShareModal(true);

    toast.success('Buzz URL Copied to clipboard');
  };

  const handleCloseModal = (): void => setShowShareModal(false);

  const handleShareClick = (): void => {
    setShowShareModal(false);
    toast.success('Copied to clipboard');
  };

  const tweetIsBookmarked = !!userBookmarks?.some(({ id }) => id === tweetId);

  return (
    <Popover className='relative'>
      {({ open, close }): JSX.Element => (
        <>
          {showShareModal && (
            <Modal
              open={showShareModal}
              closeModal={handleCloseModal}
              className='fixed top-0 left-0 flex h-full w-full items-center justify-center'
            >
              <ShareButtons
                viewingActivity={viewingActivity}
                text={text}
                id={tweetId}
                shareURL={`https://www.buzzwin.com/public/${tweetId}`}
                close={handleCloseModal}
              />
            </Modal>
          )}
          <Popover.Button
            className={cn(
              `group relative flex items-center gap-1 p-0 outline-none 
               transition-none hover:text-accent-blue focus-visible:text-accent-blue`,
              open && 'text-accent-blue inner:bg-accent-blue/10'
            )}
          >
            <i className='relative rounded-full p-2 not-italic duration-200 group-hover:bg-accent-blue/10 group-focus-visible:bg-accent-blue/10 group-focus-visible:ring-2 group-focus-visible:ring-accent-blue/80 group-active:bg-accent-blue/20'>
              <HeroIcon
                className={viewTweet ? 'h-6 w-6' : 'h-5 w-5'}
                iconName='ArrowUpTrayIcon'
              />
              {!open && <ToolTip tip='Share' />}
            </i>
          </Popover.Button>
          <AnimatePresence>
            {open && (
              <Popover.Panel
                className={cn(
                  'menu-container absolute right-0',
                  'whitespace-nowrap text-light-primary dark:text-dark-primary',
                  'z-[60]',
                  'fixed',
                  'bg-main-background shadow-lg',
                  'ring-1 ring-black/5 dark:ring-white/5',
                  'top-0 -translate-y-full',
                  'transform'
                )}
                as={motion.div}
                {...variants}
                static
              >
                <div className='relative py-2'>
                  <Popover.Button
                    className='accent-tab flex w-full gap-3 rounded-md rounded-b-none p-4 hover:bg-main-sidebar-background'
                    as={Button}
                    onClick={preventBubbling(handleShare(close))}
                  >
                    <HeroIcon iconName='ShareIcon' />
                    Share on Social Media
                  </Popover.Button>
                  <Popover.Button
                    className='accent-tab flex w-full gap-3 p-4 hover:bg-main-sidebar-background'
                    as={Button}
                    onClick={preventBubbling(handleCopy(close))}
                  >
                    <HeroIcon iconName='LinkIcon' />
                    Copy link to Buzz
                  </Popover.Button>
                  {/* {!tweetIsBookmarked ? (
                    <Popover.Button
                      className='flex w-full gap-3 p-4 rounded-md rounded-t-none accent-tab hover:bg-main-sidebar-background'
                      as={Button}
                      onClick={preventBubbling(
                        handleBookmark(close, 'bookmark', userId, tweetId)
                      )}
                    >
                      <HeroIcon iconName='BookmarkIcon' />
                      Add to WatchList
                    </Popover.Button>
                  ) : (
                    <Popover.Button
                      className='flex w-full gap-3 p-4 rounded-md rounded-t-none accent-tab hover:bg-main-sidebar-background'
                      as={Button}
                      onClick={preventBubbling(
                        handleBookmark(close, 'unbookmark', userId, tweetId)
                      )}
                    >
                      <HeroIcon iconName='BookmarkSlashIcon' />
                      Remove Buzz from Bookmarks
                    </Popover.Button>
                  )} */}
                </div>
              </Popover.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Popover>
  );
}
