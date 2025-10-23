import { Copy, Check, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button-shadcn';

interface SimpleSocialShareProps {
  title?: string;
  description?: string;
  url?: string;
  hashtags?: string[];
  className?: string;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'compact';
}

export function SimpleSocialShare({
  title = 'Check out Buzzwin - Rate Shows & Movies',
  description = 'Discover and rate your favorite shows and movies with AI-powered recommendations!',
  url = typeof window !== 'undefined' ? window.location.href : '',
  hashtags = ['Buzzwin', 'Movies', 'TVShows', 'Recommendations'],
  className = '',
  showTitle = true,
  size = 'md',
  variant = 'default'
}: SimpleSocialShareProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: string): void => {
    const shareText = `${title} - ${description}`;
    const hashtagString = hashtags.map((tag) => `#${tag}`).join(' ');
    const fullText = `${shareText} ${hashtagString} ${url}`;

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          fullText
        )}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(
          url
        )}&title=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(
          title
        )}&body=${encodeURIComponent(fullText)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
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
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleShare('twitter')}
          className='h-6 w-6 p-0'
        >
          <span className='text-xs'>𝕏</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleShare('facebook')}
          className='h-6 w-6 p-0'
        >
          <span className='text-xs'>f</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleShare('whatsapp')}
          className='h-6 w-6 p-0'
        >
          <span className='text-xs'>W</span>
        </Button>
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
            Help others discover great shows and movies
          </p>
        </div>
      )}

      <div className='grid grid-cols-4 gap-3 sm:flex sm:flex-wrap sm:justify-center'>
        <Button
          variant='outline'
          onClick={() => handleShare('twitter')}
          className='flex h-16 flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <span className='text-2xl'>𝕏</span>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            Twitter
          </span>
        </Button>

        <Button
          variant='outline'
          onClick={() => handleShare('facebook')}
          className='flex h-16 flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <span className='text-2xl'>f</span>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            Facebook
          </span>
        </Button>

        <Button
          variant='outline'
          onClick={() => handleShare('whatsapp')}
          className='flex h-16 flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <span className='text-2xl'>W</span>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            WhatsApp
          </span>
        </Button>

        <Button
          variant='outline'
          onClick={() => handleShare('linkedin')}
          className='flex h-16 flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <span className='text-2xl'>in</span>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            LinkedIn
          </span>
        </Button>

        <Button
          variant='outline'
          onClick={() => handleShare('reddit')}
          className='flex h-16 flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <span className='text-2xl'>r</span>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            Reddit
          </span>
        </Button>

        <Button
          variant='outline'
          onClick={() => handleShare('telegram')}
          className='flex h-16 flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <span className='text-2xl'>T</span>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            Telegram
          </span>
        </Button>

        <Button
          variant='outline'
          onClick={() => handleShare('email')}
          className='flex h-16 flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <span className='text-2xl'>@</span>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            Email
          </span>
        </Button>

        <Button
          variant='outline'
          onClick={handleCopyLink}
          className='flex h-16 flex-col items-center justify-center gap-1 p-2'
        >
          {copied ? (
            <Check className='h-6 w-6 text-green-600' />
          ) : (
            <Copy className='h-6 w-6' />
          )}
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            {copied ? 'Copied!' : 'Copy Link'}
          </span>
        </Button>
      </div>
    </div>
  );
}
