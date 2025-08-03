/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useMemo } from 'react';
import cn from 'clsx';
import { manageLike, manageWatching } from '@lib/firebase/utils';
import { ViewTweetStats } from '@components/view/view-tweet-stats';
import { TweetOption } from './tweet-option';
import type { Tweet } from '@lib/types/tweet';
import { TweetShare } from './tweet-share';
import { ViewingActivity } from '@components/activity/types';

type TweetStatsProps = Pick<
  Tweet,
  | 'userLikes'
  | 'userRetweets'
  | 'userReplies'
  | 'userWatching'
  | 'totalWatchers'
> & {
  reply?: boolean;
  userId: string;
  isOwner: boolean;
  tweetId: string;
  viewTweet?: boolean;
  viewingActivity: ViewingActivity;
  text: string;
  openModal: (data?: ViewingActivity) => void;
};

export function TweetStats({
  reply,
  userId,
  isOwner,
  tweetId,
  userLikes,
  viewTweet,
  userRetweets,
  viewingActivity,
  text,
  userReplies: totalReplies,
  openModal,
  userWatching = [],
  totalWatchers = 0
}: TweetStatsProps): JSX.Element {
  const totalLikes = userLikes.length;
  const totalTweets = userRetweets.length;

  const [
    { currentReplies, currentTweets, currentLikes, currentWatchers },
    setCurrentStats
  ] = useState({
    currentReplies: totalReplies,
    currentLikes: totalLikes,
    currentTweets: totalTweets,
    currentWatchers: totalWatchers
  });

  useEffect(() => {
    setCurrentStats({
      currentReplies: totalReplies,
      currentLikes: totalLikes,
      currentTweets: totalTweets,
      currentWatchers: totalWatchers
    });
  }, [totalReplies, totalLikes, totalTweets, totalWatchers]);

  const watchingMove = useMemo(
    () => (totalWatchers > currentWatchers ? -25 : 25),
    [totalWatchers, currentWatchers]
  );

  const replyMove = useMemo(
    () => (totalReplies > currentReplies ? -25 : 25),
    [totalReplies]
  );

  const likeMove = useMemo(
    () => (totalLikes > currentLikes ? -25 : 25),
    [totalLikes]
  );

  const tweetMove = useMemo(
    () => (totalTweets > currentTweets ? -25 : 25),
    [totalTweets]
  );

  const tweetIsLiked = userLikes.includes(userId);
  const tweetIsRetweeted = userRetweets.includes(userId);
  const isWatching = userWatching.includes(userId);

  const isStatsVisible = !!(
    totalReplies ??
    totalTweets ??
    totalLikes ??
    totalWatchers
  );

  return (
    <>
      {viewTweet && (
        <ViewTweetStats
          likeMove={likeMove}
          userLikes={userLikes}
          tweetMove={tweetMove}
          replyMove={replyMove}
          watchingMove={watchingMove}
          userRetweets={userRetweets}
          userWatching={userWatching}
          currentLikes={currentLikes}
          currentTweets={currentTweets}
          currentReplies={currentReplies}
          currentWatchers={currentWatchers}
          isStatsVisible={isStatsVisible}
        />
      )}
      <div
        className={cn(
          'flex text-light-secondary inner:outline-none dark:text-dark-secondary',
          viewTweet ? 'justify-around py-2' : 'max-w-md justify-between'
        )}
      >
        <TweetOption
          className={cn(
            'hover:text-emerald-500 focus-visible:text-emerald-500',
            isWatching && 'text-emerald-500 [&>i>svg]:[stroke-width:2px]'
          )}
          iconClassName='group-hover:bg-emerald-500/10 group-active:bg-emerald-500/20
                         group-focus-visible:bg-emerald-500/10 group-focus-visible:ring-emerald-500/80'
          tip={isWatching ? 'Watching' : 'Watch this'}
          move={watchingMove}
          stats={totalWatchers}
          iconName='EyeIcon'
          viewTweet={viewTweet}
          onClick={manageWatching(
            isWatching ? 'unwatch' : 'watch',
            userId,
            tweetId
          )}
        />
        <TweetOption
          className='hover:text-accent-blue focus-visible:text-accent-blue'
          iconClassName='group-hover:bg-accent-blue/10 group-active:bg-accent-blue/20 
                         group-focus-visible:bg-accent-blue/10 group-focus-visible:ring-accent-blue/80'
          tip='Add Review'
          move={replyMove}
          stats={currentReplies}
          iconName='ChatBubbleOvalLeftIcon'
          viewTweet={viewTweet}
          onClick={() => openModal()}
          disabled={reply}
        />
        {/* <TweetOption
          className={cn(
            'hover:text-accent-green focus-visible:text-accent-green',
            tweetIsRetweeted && 'text-accent-green [&>i>svg]:[stroke-width:2px]'
          )}
          iconClassName='group-hover:bg-accent-green/10 group-active:bg-accent-green/20
                         group-focus-visible:bg-accent-green/10 group-focus-visible:ring-accent-green/80'
          tip={tweetIsRetweeted ? 'Undo Boost' : 'Boost'}
          move={tweetMove}
          stats={currentTweets}
          iconName='ArrowPathRoundedSquareIcon'
          viewTweet={viewTweet}
          onClick={manageRetweet(
            tweetIsRetweeted ? 'unretweet' : 'retweet',
            userId,
            tweetId
          )}
        /> */}
        <TweetOption
          className={cn(
            'hover:text-accent-pink focus-visible:text-accent-pink',
            tweetIsLiked && 'text-accent-pink [&>i>svg]:fill-accent-pink'
          )}
          iconClassName='group-hover:bg-accent-pink/10 group-active:bg-accent-pink/20
                         group-focus-visible:bg-accent-pink/10 group-focus-visible:ring-accent-pink/80'
          tip={tweetIsLiked ? 'Unlike' : 'Like'}
          move={likeMove}
          stats={currentLikes}
          iconName='FireIcon'
          viewTweet={viewTweet}
          onClick={manageLike(
            tweetIsLiked ? 'unlike' : 'like',
            userId,
            tweetId
          )}
        />
        <TweetShare
          userId={userId}
          tweetId={tweetId}
          viewTweet={viewTweet}
          viewingActivity={viewingActivity}
          text={text}
        />
        {/* {isOwner && (
          <TweetOption
            className='hover:text-accent-blue focus-visible:text-accent-blue'
            iconClassName='group-hover:bg-accent-blue/10 group-active:bg-accent-blue/20 
                           group-focus-visible:bg-accent-blue/10 group-focus-visible:ring-accent-blue/80'
            tip='Analytics'
            iconName='ChartPieIcon'
            disabled
          />
        )} */}
      </div>
    </>
  );
}
