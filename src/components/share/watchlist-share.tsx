import { useState } from 'react';
import { Modal } from '@components/modal/modal';
import { HeroIcon } from '@components/ui/hero-icon';
import { toast } from 'react-hot-toast';
import type { Watchlist } from '@lib/types/bookmark';
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TelegramShareButton,
  TelegramIcon
} from 'next-share';

type WatchlistShareProps = {
  watchlist: Watchlist;
  isOpen: boolean;
  onClose: () => void;
};

export function WatchlistShare({
  watchlist,
  isOpen,
  onClose
}: WatchlistShareProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://buzzwin.com/watchlist/${watchlist.id}`;
  const title = `Check out "${watchlist.name}" watchlist on Buzzwin`;
  const description =
    watchlist.description ?? 'A curated collection of movies and TV shows';

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <Modal open={isOpen} closeModal={onClose}>
      <div className='w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-900'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-xl font-bold'>Share Watchlist</h2>
          <button
            onClick={onClose}
            className='rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <HeroIcon className='h-5 w-5' iconName='XMarkIcon' />
          </button>
        </div>

        <div className='mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800'>
          <h3 className='font-medium'>{watchlist.name}</h3>
          {watchlist.description && (
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              {watchlist.description}
            </p>
          )}
          <div className='mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
            <HeroIcon className='h-4 w-4' iconName='FilmIcon' />
            <span>{watchlist.totalItems} items</span>
            {watchlist.isPublic && (
              <>
                <span>•</span>
                <HeroIcon className='h-4 w-4' iconName='GlobeAltIcon' />
                <span>Public</span>
              </>
            )}
          </div>
        </div>

        <div className='space-y-4'>
          <div className='flex justify-center gap-4'>
            <FacebookShareButton url={shareUrl} quote={title}>
              <FacebookIcon size={44} round />
            </FacebookShareButton>

            <TwitterShareButton url={shareUrl} title={title}>
              <TwitterIcon size={44} round />
            </TwitterShareButton>

            <WhatsappShareButton url={shareUrl} title={title}>
              <WhatsappIcon size={44} round />
            </WhatsappShareButton>

            <TelegramShareButton url={shareUrl} title={title}>
              <TelegramIcon size={44} round />
            </TelegramShareButton>

            <LinkedinShareButton
              url={shareUrl}
              title={title}
              summary={description}
            >
              <LinkedinIcon size={44} round />
            </LinkedinShareButton>
          </div>

          <div className='relative'>
            <input
              type='text'
              value={shareUrl}
              readOnly
              className='w-full rounded-lg border bg-gray-50 px-4 py-2 pr-20 text-sm dark:border-gray-700 dark:bg-gray-800'
            />
            <button
              onClick={() => void handleCopy()}
              className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600'
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
