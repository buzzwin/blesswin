import { useState, useRef } from 'react';

// Components
import {
  Plus,
  Image as ImageIcon,
  Smile,
  Send,
  BookOpen,
  Search,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { UserAvatar } from '@components/user/user-avatar';
import { Button } from '@components/ui/button-shadcn';
import { Card, CardContent } from '@components/ui/card';
import { Textarea } from '@components/ui/textarea';
import { Separator } from '@components/ui/separator';
import { MediaSearch } from './media-search';

// Utils
import type { ChangeEvent } from 'react';

type ModernInputProps = {
  placeholder?: string;
  onChange?: (value: string) => void;
  value?: string;
  onSubmit?: () => void;
  onSignIn?: () => void;
  onMediaSelect?: (media: any) => void;
  compact?: boolean;
};

export function ModernInput({
  placeholder = 'Share what you are watching...',
  onChange,
  value = '',
  onSubmit,
  onSignIn,
  onMediaSelect,
  compact = false
}: ModernInputProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMediaSearch, setShowMediaSearch] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  // Movie review generation removed

  const { user } = useAuth();
  const { name, username, photoURL } = user ?? {};

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputLimit = 500; // Increased for AI-generated reviews

  const handleSubmit = (): void => {
    if (!value.trim()) return;

    setLoading(true);
    try {
      onSubmit?.();
      setIsExpanded(false);
    } catch (error) {
      // console.error('Error submitting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    onChange?.(e.target.value);
  };

  const inputLength = value.length;
  const isValidInput = !!value.trim().length;
  const isCharLimitExceeded = inputLength > inputLimit;

  const isValidTweet = !isCharLimitExceeded && isValidInput;

  const handleCancel = (): void => {
    setIsExpanded(false);
    onChange?.('');
    setSelectedMedia(null);
    setShowMediaSearch(false);
  };

  const handleMediaSelect = (media: any): void => {
    setSelectedMedia(media);
    onMediaSelect?.(media);
  };

  // Movie review generation removed

  return (
    <div className='w-full transition-all duration-300'>
      {/* Collapsed view - Goodreads Style */}
      {!isExpanded && (
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md',
            'border-amber-200 dark:border-amber-800/30',
            'hover:border-amber-300 dark:hover:border-amber-700',
            'bg-white dark:bg-gray-800',
            'dark:hover:bg-amber-950/10 hover:bg-amber-50',
            compact && 'border-0 shadow-none hover:shadow-none'
          )}
          onClick={() => (user ? setIsExpanded(true) : onSignIn?.())}
        >
          <CardContent className={cn('p-2 md:p-4', compact && 'p-2')}>
            <div className='flex items-center gap-2 md:gap-4'>
              <UserAvatar
                src={photoURL ?? ''}
                alt={name ?? 'User'}
                username={username ?? 'user'}
                className={cn(compact && 'h-6 w-6')}
              />
              <p
                className={cn(
                  'flex-1 text-gray-500 dark:text-gray-400',
                  compact ? 'text-xs' : 'text-xs md:text-base'
                )}
              >
                {placeholder}
              </p>
              {!compact && (
                <div className='flex items-center gap-1 md:gap-2'>
                  <BookOpen className='h-4 w-4 text-amber-500 md:h-5 md:w-5' />
                  <Plus className='h-4 w-4 text-amber-500 md:h-5 md:w-5' />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expanded view - Goodreads Style */}
      {isExpanded && (
        <Card className='border-amber-200 bg-white shadow-lg dark:border-amber-800/30 dark:bg-gray-800'>
          <CardContent className='p-3 md:p-6'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
                // console.log('Form submitted successfully');
              }}
            >
              {loading && (
                <div className='mb-4 h-1 animate-pulse rounded-full bg-amber-500' />
              )}

              <div className='flex gap-2 md:gap-4'>
                <UserAvatar
                  src={photoURL ?? ''}
                  alt={name ?? 'User'}
                  username={username ?? 'user'}
                />

                <div className='flex-1 space-y-2 md:space-y-4'>
                  {/* Media Search */}
                  {showMediaSearch ? (
                    <div className='space-y-2 md:space-y-3'>
                      <MediaSearch
                        onMediaSelect={handleMediaSelect}
                        onClose={() => setShowMediaSearch(false)}
                      />
                      <div className='text-center text-xs text-amber-600 dark:text-amber-400 md:text-sm'>
                        Please search for and select a movie or TV show to
                        review.
                      </div>
                    </div>
                  ) : !selectedMedia ? (
                    <div className='text-center text-xs text-amber-600 dark:text-amber-400 md:text-sm'>
                      Please search for and select a movie or TV show to review.
                    </div>
                  ) : (
                    <div className='space-y-2 md:space-y-4'>
                      {/* Selected Media Display */}
                      <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-900/20 md:gap-4 md:p-4'>
                        <img
                          src={`https://image.tmdb.org/t/p/w154${
                            selectedMedia?.poster_path
                              ? String(selectedMedia.poster_path)
                              : ''
                          }`}
                          alt={
                            selectedMedia?.title
                              ? String(selectedMedia.title)
                              : 'Movie poster'
                          }
                          className='h-16 w-12 rounded-lg object-cover shadow-md md:h-24 md:w-16'
                        />
                        <div className='flex-1'>
                          <div className='flex items-start justify-between'>
                            <div>
                              <h3 className='text-sm font-semibold text-gray-900 dark:text-white md:text-lg'>
                                {selectedMedia?.title
                                  ? String(selectedMedia.title)
                                  : 'Unknown Title'}
                              </h3>
                              <p className='text-xs text-gray-500 dark:text-gray-400 md:text-sm'>
                                {selectedMedia.mediaType === 'movie'
                                  ? 'Movie'
                                  : 'TV Show'}
                              </p>
                              {selectedMedia.releaseDate && (
                                <p className='text-xs text-gray-400 dark:text-gray-500'>
                                  {selectedMedia?.releaseDate
                                    ? new Date(
                                        String(selectedMedia.releaseDate)
                                      ).getFullYear()
                                    : ''}
                                </p>
                              )}
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => setSelectedMedia(null)}
                              className='p-1 text-gray-400 hover:text-gray-600 md:p-2'
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Review Textarea */}
                      <div className='space-y-2 md:space-y-3'>
                        <div className='flex items-center justify-between'>
                          <h4 className='text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm'>
                            Write your review
                          </h4>
                        </div>
                        <Textarea
                          ref={inputRef}
                          placeholder={`Share your thoughts about ${
                            selectedMedia?.title
                              ? String(selectedMedia.title)
                              : 'this show'
                          }...`}
                          value={value}
                          onChange={handleChange}
                          className='min-h-[80px] resize-none border-0 bg-transparent text-sm text-gray-900 shadow-none placeholder:text-gray-400 focus-visible:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500 md:min-h-[120px] md:text-base'
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <Separator className='bg-amber-200 dark:bg-amber-800/30' />

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1 md:gap-2'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        disabled={loading}
                        onClick={() => setShowMediaSearch(!showMediaSearch)}
                        className={cn(
                          'text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20',
                          showMediaSearch && 'bg-amber-100 dark:bg-amber-900/20'
                        )}
                      >
                        <Search className='h-3 w-3 md:h-4 md:w-4' />
                      </Button>

                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        disabled={loading}
                        className='text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20'
                      >
                        <ImageIcon className='h-3 w-3 md:h-4 md:w-4' />
                      </Button>

                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        disabled={loading}
                        className='text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20'
                      >
                        <Smile className='h-3 w-3 md:h-4 md:w-4' />
                      </Button>
                    </div>

                    <div className='flex items-center gap-1 md:gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={handleCancel}
                        disabled={loading}
                        className='border-amber-300 px-2 text-xs text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20 md:px-4 md:text-sm'
                      >
                        Cancel
                      </Button>

                      <Button
                        type='submit'
                        disabled={!isValidTweet || loading || !selectedMedia}
                        className='gap-1 bg-amber-600 px-2 text-xs text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 md:gap-2 md:px-4 md:text-sm'
                      >
                        <Send className='h-3 w-3 md:h-4 md:w-4' />
                        Share Review
                      </Button>
                    </div>
                  </div>

                  {inputLength > 0 && (
                    <div className='text-right text-xs text-amber-600 dark:text-amber-400 md:text-sm'>
                      {inputLength}/{inputLimit}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
