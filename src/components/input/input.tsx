import Link from 'next/link';
import { useState, useEffect, useRef, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import cn from 'clsx';
import { toast } from 'react-hot-toast';
import { addDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { tweetsCollection } from '@lib/firebase/collections';
import {
  manageReply,
  uploadImages,
  manageTotalTweets,
  manageTotalPhotos
} from '@lib/firebase/utils';
import { useAuth } from '@lib/context/auth-context';
import { sleep } from '@lib/utils';
import { getImagesData } from '@lib/validation';
import { UserAvatar } from '@components/user/user-avatar';
import { InputForm, fromTop } from './input-form';
import { ImagePreview } from './image-preview';
import { InputOptions } from './input-options';
import { HeroIcon } from '@components/ui/hero-icon';
import type { ReactNode, FormEvent, ChangeEvent, ClipboardEvent } from 'react';
import type { WithFieldValue } from 'firebase/firestore';
import type { Variants } from 'framer-motion';
import type { User } from '@lib/types/user';
import type { Tweet } from '@lib/types/tweet';
import type { FilesWithId, ImagesPreview, ImageData } from '@lib/types/file';
import { ViewingActivity } from '@components/activity/types';
import { Button } from '@components/ui/button';

type InputProps = {
  modal?: boolean;
  reply?: boolean;
  parent?: { id: string; username: string };
  disabled?: boolean;
  children?: ReactNode;
  replyModal?: boolean;
  closeModal?: () => void;
};

export const variants: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 }
};

export function Input({
  modal,
  reply,
  parent,
  disabled,
  children,
  replyModal,
  closeModal
}: InputProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImages, setSelectedImages] = useState<FilesWithId>([]);
  const [imagesPreview, setImagesPreview] = useState<ImagesPreview>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [visited, setVisited] = useState(false);

  const { user, isAdmin } = useAuth();
  const { name, username, photoURL } = user as User;

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const previewCount = imagesPreview.length;
  const isUploadingImages = !!previewCount;

  useEffect(
    () => {
      if (modal) inputRef.current?.focus();
      return cleanImage;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const sendTweet = async (data: ViewingActivity): Promise<void> => {
    console.log('Send Tweet *********', data);
    console.log('Reply  *********', replyModal);
    console.log('inputValue  *********', inputValue);
    inputRef.current?.blur();

    setLoading(true);

    const isReplying = reply ?? replyModal;

    const userId = user?.id as string;
    const text = `${user?.name ?? ''} ' ' ${data.status} ${data.title ?? ''}`;

    const tweetData: WithFieldValue<Omit<Tweet, 'id'>> = {
      text: replyModal ? inputValue : text,
      viewingActivity: data,
      parent: isReplying && parent ? parent : null,
      images: await uploadImages(userId, selectedImages),
      userLikes: [],
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: null,
      userReplies: 0,
      userRetweets: [],
      photoURL: user?.photoURL as string
    };

    await sleep(500);

    const [tweetRef] = await Promise.all([
      addDoc(tweetsCollection, tweetData),
      manageTotalTweets('increment', userId),
      tweetData.images && manageTotalPhotos('increment', userId),
      isReplying && manageReply('increment', parent?.id as string)
    ]);

    const { id: tweetId } = await getDoc(tweetRef);

    if (!modal && !replyModal) {
      discardTweet();
      setLoading(false);
    }

    if (closeModal) closeModal();

    toast.success(
      () => (
        <span className='flex gap-2'>
          Your Buzz was sent
          <Link href={`/buzz/${tweetId}`}>
            <a className='custom-underline font-bold'>View</a>
          </Link>
        </span>
      ),
      { duration: 6000 }
    );
  };

  const handleImageUpload = (
    e: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLTextAreaElement>
  ): void => {
    const isClipboardEvent = 'clipboardData' in e;

    if (isClipboardEvent) {
      const isPastingText = e.clipboardData.getData('text');
      if (isPastingText) return;
    }

    const files = isClipboardEvent ? e.clipboardData.files : e.target.files;

    const imagesData = getImagesData(files, previewCount);

    if (!imagesData) {
      toast.error('Please choose a GIF or photo up to 4');
      return;
    }

    const { imagesPreviewData, selectedImagesData } = imagesData;

    setImagesPreview([...imagesPreview, ...imagesPreviewData]);
    setSelectedImages([...selectedImages, ...selectedImagesData]);

    inputRef.current?.focus();
  };

  const removeImage = (targetId: string) => (): void => {
    setSelectedImages(selectedImages.filter(({ id }) => id !== targetId));
    setImagesPreview(imagesPreview.filter(({ id }) => id !== targetId));

    const { src } = imagesPreview.find(
      ({ id }) => id === targetId
    ) as ImageData;

    URL.revokeObjectURL(src);
  };

  const cleanImage = (): void => {
    imagesPreview.forEach(({ src }) => URL.revokeObjectURL(src));

    setSelectedImages([]);
    setImagesPreview([]);
  };

  const discardTweet = (): void => {
    setInputValue('');
    setVisited(false);
    cleanImage();

    inputRef.current?.blur();
  };

  const handleChange = ({
    target: { value }
  }: ChangeEvent<HTMLTextAreaElement>): void => setInputValue(value);

  const handleReply = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log('Button clicked', inputValue);
    const viewingActivity: ViewingActivity = {
      tmdbId: '',
      id: 0,
      username: '',
      title: '',
      status: 'is replying',
      rating: '',
      review: '',
      network: '',
      poster_path: '',
      releaseDate: '',
      time: '',
      photoURL: ''
    };

    await sendTweet(viewingActivity);
  };

  const handleFocus = (): void => setVisited(!loading);

  const formId = useId();

  const inputLimit = isAdmin ? 560 : 280;

  const inputLength = inputValue.length;
  const isValidInput = !!inputValue.trim().length;
  const isCharLimitExceeded = inputLength > inputLimit;

  const isValidTweet =
    !isCharLimitExceeded && (isValidInput || isUploadingImages);

  const handleCancel = () => {
    setIsExpanded(false);
    discardTweet();
  };

  return (
    <div
      className={cn(
        'w-full transition-all duration-300',
        'hover:bg-gray-50 dark:hover:bg-gray-900/50',
        isExpanded ? 'bg-white dark:bg-gray-800/50' : 'bg-transparent'
      )}
    >
      {/* Collapsed View */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            'w-full px-6 py-3',
            'flex items-center gap-4',
            'text-left',
            'transition-all duration-200',
            'group'
          )}
        >
          <UserAvatar src={photoURL} alt={name} username={username} />
          <p
            className={cn(
              'text-gray-500 dark:text-gray-400',
              'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
              'transition-colors duration-200'
            )}
          >
            Share what you are watching ...
          </p>
          <div className='ml-auto flex items-center gap-2 text-gray-400'>
            <HeroIcon
              iconName='PlusCircleIcon'
              className={cn(
                'h-5 w-5',
                'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
                'transition-colors duration-200'
              )}
            />
          </div>
        </button>
      )}

      {/* Expanded Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial='initial'
            animate='animate'
            exit='exit'
            variants={variants}
          >
            <form
              className={cn(
                'flex flex-col',
                'border-b border-gray-100 dark:border-gray-800',
                {
                  '-mx-4': reply,
                  'gap-2': replyModal,
                  'cursor-not-allowed': disabled
                }
              )}
            >
              {loading && (
                <motion.i
                  className='h-1 animate-pulse bg-main-accent'
                  {...variants}
                />
              )}
              {children}
              {reply && visited && (
                <motion.p
                  className='ml-[75px] -mb-2 mt-2 text-light-secondary dark:text-dark-secondary'
                  {...fromTop}
                >
                  Replying to{' '}
                  <Link href={`/user/${parent?.username as string}`}>
                    <a className='custom-underline text-main-accent'>
                      {parent?.username as string}
                    </a>
                  </Link>
                </motion.p>
              )}
              <div
                className={cn(
                  'hover-animation grid w-full grid-cols-[auto,1fr] gap-3 px-4 py-3',
                  reply ? 'pt-3 pb-1' : replyModal ? 'pt-0' : '',
                  (disabled || loading) && 'pointer-events-none opacity-50'
                )}
              >
                <UserAvatar src={photoURL} alt={name} username={username} />
                <div className='flex w-full flex-col gap-4'>
                  <InputForm
                    modal={modal}
                    reply={reply}
                    formId={formId}
                    visited={visited}
                    loading={loading}
                    inputRef={inputRef}
                    replyModal={replyModal}
                    inputValue={inputValue}
                    isValidTweet={isValidTweet}
                    isUploadingImages={isUploadingImages}
                    sendTweet={sendTweet}
                    handleFocus={handleFocus}
                    discardTweet={handleCancel}
                    handleChange={handleChange}
                    handleImageUpload={handleImageUpload}
                  >
                    {isUploadingImages && (
                      <ImagePreview
                        imagesPreview={imagesPreview}
                        previewCount={previewCount}
                        removeImage={!loading ? removeImage : undefined}
                      />
                    )}
                  </InputForm>

                  {/* Action Buttons */}
                  <div className='flex items-center justify-end gap-3 pt-2'>
                    <button
                      type='button'
                      onClick={handleCancel}
                      className={cn(
                        'px-4 py-2',
                        'rounded-xl',
                        'text-sm font-medium',
                        'bg-gray-100 dark:bg-gray-800',
                        'text-gray-700 dark:text-gray-300',
                        'hover:bg-gray-200 dark:hover:bg-gray-700',
                        'transition-colors duration-200',
                        'flex items-center gap-2'
                      )}
                    >
                      <HeroIcon iconName='XMarkIcon' className='h-4 w-4' />
                      Cancel
                    </button>
                    {replyModal ? (
                      <button
                        className={cn(
                          'px-4 py-2',
                          'rounded-xl',
                          'text-sm font-medium',
                          'bg-emerald-500 dark:bg-emerald-600',
                          'text-white',
                          'hover:bg-emerald-600 dark:hover:bg-emerald-700',
                          'transition-colors duration-200',
                          'flex items-center gap-2'
                        )}
                        onClick={handleReply}
                      >
                        <HeroIcon
                          iconName='PaperAirplaneIcon'
                          className='h-4 w-4'
                        />
                        Share
                      </button>
                    ) : null}
                  </div>

                  {(reply ? reply && visited && !loading : !loading) && (
                    <InputOptions
                      reply={reply}
                      modal={modal}
                      inputLimit={inputLimit}
                      inputLength={inputLength}
                      isValidTweet={isValidTweet}
                      isCharLimitExceeded={isCharLimitExceeded}
                      handleImageUpload={handleImageUpload}
                    />
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
