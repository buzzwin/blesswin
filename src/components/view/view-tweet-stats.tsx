import { useState } from 'react';
import cn from 'clsx';
import { useArrayDocument } from '@lib/hooks/useArrayDocument';
import { useModal } from '@lib/hooks/useModal';
import { usersCollection } from '@lib/firebase/collections';
import { Modal } from '@components/modal/modal';
import { TweetStatsModal } from '@components/modal/tweet-stats-modal';
import { NumberStats } from '@components/tweet/number-stats';
import { UserCards } from '@components/user/user-cards';
import type { Tweet } from '@lib/types/tweet';

type viewTweetStats = Pick<
  Tweet,
  'userRetweets' | 'userLikes' | 'userWatching'
> & {
  likeMove: number;
  tweetMove: number;
  replyMove: number;
  watchingMove: number;
  currentLikes: number;
  currentTweets: number;
  currentReplies: number;
  currentWatchers: number;
  isStatsVisible: boolean;
};

export type StatsType = 'retweets' | 'likes' | 'watching';

type Stats = [string, StatsType | null, number, number];

export function ViewTweetStats({
  likeMove,
  userLikes,
  tweetMove,
  replyMove,
  watchingMove,
  userRetweets,
  userWatching,
  currentLikes,
  currentTweets,
  currentReplies,
  currentWatchers,
  isStatsVisible
}: viewTweetStats): JSX.Element {
  const [statsType, setStatsType] = useState<StatsType | null>(null);
  const { open, openModal, closeModal } = useModal();

  const { data, loading } = useArrayDocument(
    statsType
      ? statsType === 'likes'
        ? userLikes
        : statsType === 'watching'
        ? userWatching
        : userRetweets
      : [],
    usersCollection,
    { disabled: !statsType }
  );

  const handleOpen = (type: StatsType) => (): void => {
    setStatsType(type);
    openModal();
  };

  const handleClose = (): void => {
    setStatsType(null);
    closeModal();
  };

  const allStats: Readonly<Stats[]> = [
    ['Watching', 'watching', watchingMove, currentWatchers],
    ['Reply', null, replyMove, currentReplies],
    ['ReBuzz', 'retweets', tweetMove, currentTweets],
    ['Like', 'likes', likeMove, currentLikes]
  ];

  return (
    <>
      <Modal
        modalClassName={cn(
          'relative w-full max-w-xl',
          'h-[672px] overflow-hidden',
          'bg-white dark:bg-gray-900',
          'rounded-2xl',
          'shadow-xl',
          'border border-gray-100 dark:border-gray-800',
          'transition-all duration-200'
        )}
        open={open}
        closeModal={handleClose}
      >
        <TweetStatsModal statsType={statsType} handleClose={handleClose}>
          <UserCards
            follow
            type={statsType as StatsType}
            data={data}
            loading={loading}
          />
        </TweetStatsModal>
      </Modal>
      {isStatsVisible && (
        <div
          className={cn(
            'flex flex-wrap gap-4 px-4 py-4',
            'border-b border-gray-100 dark:border-gray-800',
            'transition-all duration-200'
          )}
        >
          {allStats.map(
            ([title, type, move, stats], index) =>
              !!stats && (
                <button
                  className={cn(
                    'group flex items-center gap-2',
                    'transition-all duration-200',
                    'outline-none',
                    'border-b-2 border-transparent',
                    'hover:border-emerald-500 dark:hover:border-emerald-400',
                    'focus-visible:border-emerald-500 dark:focus-visible:border-emerald-400',
                    index === 0 && 'cursor-not-allowed opacity-50'
                  )}
                  key={title}
                  onClick={type ? handleOpen(type) : undefined}
                >
                  <div
                    className={cn(
                      'font-bold',
                      'text-gray-900 dark:text-white',
                      'transition-colors duration-200'
                    )}
                  >
                    <NumberStats move={move} stats={stats} />
                  </div>
                  <div
                    className={cn(
                      'text-gray-600 dark:text-gray-400',
                      'transition-colors duration-200'
                    )}
                  >
                    {`${
                      stats === 1
                        ? title
                        : stats > 1 && index === 0
                        ? `${title.slice(0, -1)}ies`
                        : `${title}s`
                    }`}
                  </div>
                </button>
              )
          )}
        </div>
      )}
    </>
  );
}
