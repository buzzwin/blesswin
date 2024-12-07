import { useState, useEffect, useRef, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode, ChangeEvent, ClipboardEvent } from 'react';
import type { Variants } from 'framer-motion';
import type { ViewingActivity } from '@components/activity/types';

// Components
import { InputForm } from './input-form';
import { ImagePreview } from './image-preview';
import { InputOptions } from './input-options';
import { HeroIcon } from '@components/ui/hero-icon';
import { UserAvatar } from '@components/user/user-avatar';

// Utils
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import { getImagesData } from '@lib/validation';

// Types
type FilesWithId = Array<{ id: string; file: File }>;
type ImagesPreview = Array<{ id: string; src: string; alt: string }>;
type ImageData = { id: string; src: string; alt: string };

interface ErrorResponse {
  message?: string;
}

type InputProps = {
  modal?: boolean;
  replyModal?: boolean;
  parent?: {
    id: string;
    username: string;
    viewingActivity?: ViewingActivity;
  };
  children?: ReactNode;
  closeModal?: () => void;
  selectedTags?: string[];
  placeholder?: string;
  onSubmit?: (data: ViewingActivity) => Promise<void>;
  selectedEmoji?: string | null;
};

export const variants: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 }
};

export function Input({
  modal,
  replyModal,
  parent,
  children,
  closeModal,
  selectedTags = [],
  placeholder = 'Share what you are watching...',
  onSubmit,
  selectedEmoji
}: InputProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImages, setSelectedImages] = useState<FilesWithId>([]);
  const [imagesPreview, setImagesPreview] = useState<ImagesPreview>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [visited, setVisited] = useState(false);

  const { user } = useAuth();
  const { name, username, photoURL } = user ?? {};

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputLimit = 280;

  const previewCount = imagesPreview.length;
  const isUploadingImages = !!previewCount;

  useEffect(() => {
    if (modal) {
      inputRef.current?.focus();
    }
    return () => {
      cleanImage();
    };
  }, [modal]);

  const handleSubmit = async (): Promise<void> => {
    if (!inputValue && !selectedImages.length) return;

    setLoading(true);

    try {
      const tweetData = {
        text: inputValue,
        images: selectedImages.length ? selectedImages : null,
        parent: parent ?? null,
        userLikes: [],
        createdBy: user?.id ?? '',
        createdAt: new Date(),
        updatedAt: null,
        userReplies: 0,
        userRetweets: [],
        viewingActivity: replyModal
          ? {
              ...parent?.viewingActivity,
              review: inputValue,
              tags: selectedTags
            }
          : null,
        photoURL: user?.photoURL ?? '',
        userWatching: [],
        totalWatchers: 0
      };

      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tweetData)
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.message ?? 'Failed to post review');
      }

      discardTweet();
      closeModal?.();
      toast.success('Review posted successfully!');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to post review';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (
    e: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLTextAreaElement>
  ): void => {
    const isClipboardEvent = 'clipboardData' in e;
    if (isClipboardEvent && e.clipboardData.getData('text')) return;

    const files = isClipboardEvent ? e.clipboardData.files : e.target.files;
    const imagesData = getImagesData(files, previewCount);
    if (!imagesData) {
      toast.error('Please choose a GIF or photo up to 4');
      return;
    }

    const { imagesPreviewData, selectedImagesData } = imagesData;
    setImagesPreview([...imagesPreview, ...imagesPreviewData]);

    const newSelectedImages = selectedImagesData.map((image) => ({
      id: image.id,
      file: image instanceof File ? image : image
    }));

    setSelectedImages([...selectedImages, ...newSelectedImages]);
    void inputRef.current?.focus();
  };

  const removeImage = (targetId: string): (() => void) => {
    return () => {
      setSelectedImages(selectedImages.filter(({ id }) => id !== targetId));
      setImagesPreview(imagesPreview.filter(({ id }) => id !== targetId));

      const foundImage = imagesPreview.find(({ id }) => id === targetId);
      if (foundImage) {
        URL.revokeObjectURL(foundImage.src);
      }
    };
  };

  const cleanImage = (): void => {
    imagesPreview.forEach((image) => URL.revokeObjectURL(image.src));
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

  const handleFocus = (): void => setVisited(!loading);

  const formId = useId();

  const inputLength = inputValue.length;
  const isValidInput = !!inputValue.trim().length;
  const isCharLimitExceeded = inputLength > inputLimit;

  const isValidTweet =
    !isCharLimitExceeded && (isValidInput || isUploadingImages);

  const handleCancel = (): void => {
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
      {/* Only show the collapsed view if not a reply/review modal */}
      {!isExpanded && !replyModal && (
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
          <UserAvatar
            src={photoURL || ''}
            alt={name ?? 'User'}
            username={username ?? 'user'}
          />
          <p
            className={cn(
              'text-gray-500 dark:text-gray-400',
              'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
              'transition-colors duration-200'
            )}
          >
            {placeholder}
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

      {/* Always show the form for reply/review modal */}
      <AnimatePresence>
        {(isExpanded || replyModal) && (
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
                  'gap-2': replyModal
                }
              )}
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit()
                  .then(() => {
                    console.log('Form submitted successfully');
                  })
                  .catch((err) => {
                    console.error('Error during form submission:', err);
                  });
              }}
            >
              {loading && (
                <motion.i
                  className='h-1 animate-pulse bg-main-accent'
                  {...variants}
                />
              )}
              {children}

              <div
                className={cn(
                  'hover-animation grid w-full grid-cols-[auto,1fr] gap-3 px-4 py-3',
                  replyModal && 'pt-0',
                  loading && 'pointer-events-none opacity-50'
                )}
              >
                <UserAvatar
                  src={photoURL || ''}
                  alt={name ?? 'User'}
                  username={username ?? 'user'}
                />
                <div className='flex w-full flex-col gap-4'>
                  <InputForm
                    modal={modal}
                    replyModal={replyModal}
                    formId={formId}
                    visited={visited}
                    loading={loading}
                    inputRef={inputRef}
                    inputValue={inputValue}
                    isValidTweet={isValidTweet}
                    isUploadingImages={isUploadingImages}
                    sendTweet={handleSubmit}
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
                    {replyModal && (
                      <button
                        type='submit'
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
                          <HeroIcon
                            iconName='PaperAirplaneIcon'
                            className='h-4 w-4'
                          />
                        )}
                        {loading ? 'Posting...' : 'Share Review'}
                      </button>
                    )}
                  </div>

                  {!loading && (
                    <InputOptions
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
