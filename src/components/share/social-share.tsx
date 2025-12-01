import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  RedditShareButton,
  RedditIcon,
  PinterestShareButton,
  PinterestIcon,
  TelegramShareButton,
  TelegramIcon,
  EmailShareButton,
  EmailIcon
} from 'next-share';
import { Share2, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button-shadcn';

interface SocialShareProps {
  title?: string;
  description?: string;
  url?: string;
  hashtags?: string[];
  className?: string;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'compact';
}

export function SocialShare({
  title = 'Check out Buzzwin - Wellness & Good Deeds',
  description = 'Join a community focused on wellness, positive actions, and inspiring others to do good!',
  url = typeof window !== 'undefined' ? window.location.href : '',
  hashtags = ['Buzzwin', 'Wellness', 'GoodDeeds', 'PositiveImpact'],
  className = '',
  showTitle = true,
  size = 'md',
  variant = 'default'
}: SocialShareProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const siteLink = 'https://buzzwin.com';
  const shareText = `${title} - ${description}\n\nVisit ${siteLink} to join the community 🌱`;
  const shareUrl = url;

  const handleCopyLink = async (): Promise<void> => {
    try {
      const fullText = `${shareText}\n${shareUrl}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // Don't render on server side to avoid SSR issues
  if (!isClient) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className='h-8 w-32 rounded bg-gray-200' />
      </div>
    );
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSize = sizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant='outline'
          size='sm'
          onClick={handleCopyLink}
          className='flex items-center gap-2'
        >
          {copied ? (
            <Check className='h-4 w-4 text-green-600' />
          ) : (
            <Copy className='h-4 w-4' />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <FacebookShareButton url={shareUrl} quote={shareText}>
          <FacebookIcon size={24} round />
        </FacebookShareButton>
        <TwitterShareButton
          url={shareUrl}
          title={shareText}
          hashtags={hashtags}
        >
          <TwitterIcon size={24} round />
        </TwitterShareButton>
        <WhatsappShareButton url={shareUrl} title={shareText}>
          <WhatsappIcon size={24} round />
        </WhatsappShareButton>
        <Button
          variant='outline'
          size='sm'
          onClick={handleCopyLink}
          className='h-6 w-6 p-0'
        >
          {copied ? (
            <Check className='h-3 w-3 text-green-600' />
          ) : (
            <Copy className='h-3 w-3' />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {showTitle && (
        <div className='text-center'>
          <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
            Share Buzzwin
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Help others discover wellness and positive actions
          </p>
        </div>
      )}

      <div className='flex flex-wrap justify-center gap-3'>
        <FacebookShareButton url={shareUrl} quote={shareText}>
          <div className='flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'>
            <FacebookIcon size={32} round />
            <span className='text-xs text-gray-600 dark:text-gray-400'>
              Facebook
            </span>
          </div>
        </FacebookShareButton>

        <TwitterShareButton
          url={shareUrl}
          title={shareText}
          hashtags={hashtags}
        >
          <div className='flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'>
            <TwitterIcon size={32} round />
            <span className='text-xs text-gray-600 dark:text-gray-400'>
              Twitter
            </span>
          </div>
        </TwitterShareButton>

        <WhatsappShareButton url={shareUrl} title={shareText}>
          <div className='flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'>
            <WhatsappIcon size={32} round />
            <span className='text-xs text-gray-600 dark:text-gray-400'>
              WhatsApp
            </span>
          </div>
        </WhatsappShareButton>

        <LinkedinShareButton url={shareUrl} title={shareText}>
          <div className='flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'>
            <LinkedinIcon size={32} round />
            <span className='text-xs text-gray-600 dark:text-gray-400'>
              LinkedIn
            </span>
          </div>
        </LinkedinShareButton>

        <RedditShareButton url={shareUrl} title={shareText}>
          <div className='flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'>
            <RedditIcon size={32} round />
            <span className='text-xs text-gray-600 dark:text-gray-400'>
              Reddit
            </span>
          </div>
        </RedditShareButton>

        <PinterestShareButton
          url={shareUrl}
          media={shareUrl}
          description={shareText}
        >
          <div className='flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'>
            <PinterestIcon size={32} round />
            <span className='text-xs text-gray-600 dark:text-gray-400'>
              Pinterest
            </span>
          </div>
        </PinterestShareButton>

        <TelegramShareButton url={shareUrl} title={shareText}>
          <div className='flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'>
            <TelegramIcon size={32} round />
            <span className='text-xs text-gray-600 dark:text-gray-400'>
              Telegram
            </span>
          </div>
        </TelegramShareButton>

        <EmailShareButton url={shareUrl} subject={title} body={shareText}>
          <div className='flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'>
            <EmailIcon size={32} round />
            <span className='text-xs text-gray-600 dark:text-gray-400'>
              Email
            </span>
          </div>
        </EmailShareButton>

        <Button
          variant='outline'
          onClick={handleCopyLink}
          className='flex h-auto flex-col items-center gap-1 p-2'
        >
          {copied ? (
            <Check className='h-8 w-8 text-green-600' />
          ) : (
            <Copy className='h-8 w-8' />
          )}
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            {copied ? 'Copied!' : 'Copy Link'}
          </span>
        </Button>
      </div>
    </div>
  );
}
