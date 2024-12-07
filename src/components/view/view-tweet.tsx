import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { Modal } from '@components/modal/modal';
import { TweetReplyModal } from '@components/modal/tweet-reply-modal';
import { ImagePreview } from '@components/input/image-preview';
import { Input } from '@components/input/input';
import { UserAvatar } from '@components/user/user-avatar';
import { UserTooltip } from '@components/user/user-tooltip';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { TweetActions, variants } from '@components/tweet/tweet-actions';
import { TweetStats } from '@components/tweet/tweet-stats';
import { TweetDate } from '@components/tweet/tweet-date';
import { cn } from '@lib/utils';
import type { Tweet } from '@lib/types/tweet';
import type { User } from '@lib/types/user';
import Image from 'next/image';
import { useState } from 'react';
import type { ViewingActivity } from '@components/activity/types';

export type ViewTweetProps = Tweet & {
  user: User;
  profile?: User | null;
  viewTweetRef?: React.RefObject<HTMLElement>;
};

export function ViewTweet({
  id: tweetId,
  text,
  images,
  parent,
  userLikes,
  createdBy,
  createdAt,
  updatedAt,
  userReplies,
  userRetweets,
  userWatching = [],
  totalWatchers = 0,
  viewingActivity,
  viewTweetRef,
  photoURL: tweetPhotoURL,
  user: tweetUser
}: ViewTweetProps): JSX.Element {
  const { user: authUser } = useAuth();

  const { id: ownerId, name, username, verified, photoURL } = tweetUser;

  const userId = authUser?.id as string;
  const isOwner = userId === createdBy;
  const reply = !!parent;

  const { open, openModal, closeModal } = useModal();
  const tweetLink = `/buzz/${tweetId}`;
  const { id: parentId, username: parentUsername = username } = parent ?? {};

  const handleReply = async (data: ViewingActivity): Promise<void> => {
    try {
      // Handle the reply logic here
      await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      closeModal();
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  return (
    <motion.article
      className={cn(
        `accent-tab h- relative flex cursor-default flex-col gap-3 border-b
         border-light-border px-4 py-3 outline-none dark:border-dark-border`,
        reply && 'scroll-m-[3.25rem] pt-0'
      )}
      {...variants}
      animate={{ ...variants.animate, transition: { duration: 0.2 } }}
      exit={undefined}
      ref={viewTweetRef}
    >
      <Modal
        className='flex items-start justify-center'
        modalClassName='bg-main-background rounded-2xl max-w-xl w-full mt-8 overflow-hidden'
        open={open}
        closeModal={closeModal}
      >
        <TweetReplyModal
          tweet={{
            id: tweetId,
            text,
            images,
            parent,
            userLikes,
            createdBy,
            createdAt,
            updatedAt,
            userReplies,
            userRetweets,
            userWatching,
            totalWatchers,
            viewingActivity,
            photoURL: tweetPhotoURL,
            user: tweetUser,
            modal: true
          }}
          closeModal={closeModal}
          onReply={handleReply}
        />
      </Modal>

      <div className='flex flex-col gap-2'>
        {reply && (
          <div className='flex w-12 items-center justify-center'>
            <i className='hover-animation h-2 w-0.5 bg-light-line-reply dark:bg-dark-line-reply' />
          </div>
        )}

        <div className='grid grid-cols-[auto,1fr] gap-3'>
          <UserTooltip avatar {...tweetUser}>
            <UserAvatar src={photoURL} alt={name} username={username} />
          </UserTooltip>
          <div className='flex min-w-0 justify-between'>
            <div className='flex flex-col truncate xs:overflow-visible xs:whitespace-normal'>
              <UserTooltip {...tweetUser}>
                <UserName
                  className='-mb-1'
                  name={name}
                  username={username}
                  verified={verified}
                />
              </UserTooltip>
              <UserTooltip {...tweetUser}>
                <UserUsername username={username} />
              </UserTooltip>
            </div>

            <div className='px-10 py-4'>
              <div className='h-full w-full'>
                <Image
                  className='h-24 rounded-r-xl'
                  src={
                    viewingActivity?.poster_path
                      ? `https://image.tmdb.org/t/p/w500/${viewingActivity.poster_path}`
                      : '/movie.png'
                  }
                  alt={viewingActivity?.title || 'No Image'}
                  width={125}
                  height={187}
                />
              </div>
              <TweetActions
                viewTweet
                isOwner={isOwner}
                ownerId={ownerId}
                tweetId={tweetId}
                parentId={parentId}
                username={username}
                hasImages={!!images}
                createdBy={createdBy}
              />
            </div>
          </div>
        </div>
      </div>

      {reply && (
        <p className='text-light-secondary dark:text-dark-secondary'>
          Replying to{' '}
          <Link href={`/user/${parentUsername}`}>
            <a className='custom-underline text-main-accent'>
              @{parentUsername}
            </a>
          </Link>
        </p>
      )}
      <div>
        {text && <p className='whitespace-pre-line break-words pt-4'>{text}</p>}
        {viewingActivity?.review && (
          <p className='whitespace-pre-line break-words pt-4 text-sm'>
            {viewingActivity.review}
          </p>
        )}
        {images && (
          <ImagePreview
            viewTweet
            imagesPreview={images}
            previewCount={images.length}
          />
        )}
        <div className='inner:hover-animation inner:border-b inner:border-light-border dark:inner:border-dark-border'>
          <TweetDate viewTweet tweetLink={tweetLink} createdAt={createdAt} />
          <TweetStats
            viewTweet
            reply={reply}
            userId={userId}
            isOwner={isOwner}
            tweetId={tweetId}
            userLikes={userLikes}
            userRetweets={userRetweets}
            userReplies={userReplies}
            userWatching={userWatching}
            totalWatchers={totalWatchers}
            viewingActivity={viewingActivity}
            text={text ?? ''}
            openModal={openModal}
          />
        </div>
      </div>
    </motion.article>
  );
}
