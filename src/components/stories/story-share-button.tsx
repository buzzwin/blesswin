import { useState } from 'react';
import { Share2, Copy, Check, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Modal } from '@components/modal/modal';
import { useModal } from '@lib/hooks/useModal';
import { siteURL } from '@lib/env';
import type { RealStory } from '@lib/types/real-story';

interface StoryShareButtonProps {
  story: RealStory;
  className?: string;
}

export function StoryShareButton({ story, className = '' }: StoryShareButtonProps): JSX.Element {
  const { open: shareModalOpen, openModal: openShareModal, closeModal: closeShareModal } = useModal();
  const [copied, setCopied] = useState(false);

  const storyUrl = story.url || `${siteURL || 'https://buzzwin.com'}/real-stories`;
  const shareTitle = `${story.title} | Buzzwin`;
  const shareText = `${story.title}\n\n${story.description}\n\nRead more inspiring stories at buzzwin.com`;
  const shareUrl = `${siteURL || 'https://buzzwin.com'}/story/${encodeURIComponent(story.title)}`;

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleWebShare = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        closeShareModal();
      } catch (error) {
        // User cancelled or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback to copy link
      void handleCopyLink();
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'linkedin'): void => {
    const encodedTitle = encodeURIComponent(story.title);
    const encodedText = encodeURIComponent(`${story.title} - ${story.description}`);
    const encodedUrl = encodeURIComponent(shareUrl);

    let shareLink = '';

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=RealStories,GoodNews,PositiveImpact`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
      closeShareModal();
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          openShareModal();
        }}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 ${className}`}
      >
        <Share2 className='h-4 w-4' />
        <span>Share</span>
      </button>

      <Modal open={shareModalOpen} closeModal={closeShareModal} modalClassName='max-w-md'>
        <div className='p-6'>
          <h2 className='mb-4 text-xl font-bold text-gray-900 dark:text-white'>
            Share This Story
          </h2>

          {/* Story Preview */}
          <div className='mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
            <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
              {story.title}
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
              {story.description}
            </p>
          </div>

          {/* Share Options */}
          <div className='space-y-3'>
            {/* Web Share API (Mobile) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && typeof navigator.share === 'function' && (
              <button
                onClick={handleWebShare}
                className='flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
              >
                <Share2 className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                <span className='font-medium text-gray-900 dark:text-white'>Share via...</span>
              </button>
            )}

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className='flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
            >
              {copied ? (
                <>
                  <Check className='h-5 w-5 text-green-600 dark:text-green-400' />
                  <span className='font-medium text-green-600 dark:text-green-400'>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                  <span className='font-medium text-gray-900 dark:text-white'>Copy Link</span>
                </>
              )}
            </button>

            {/* Social Media Buttons */}
            <div className='grid grid-cols-3 gap-2'>
              <button
                onClick={() => handleSocialShare('twitter')}
                className='flex flex-col items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
              >
                <Twitter className='h-5 w-5 text-blue-400' />
                <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>Twitter</span>
              </button>

              <button
                onClick={() => handleSocialShare('facebook')}
                className='flex flex-col items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
              >
                <Facebook className='h-5 w-5 text-blue-600' />
                <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>Facebook</span>
              </button>

              <button
                onClick={() => handleSocialShare('linkedin')}
                className='flex flex-col items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
              >
                <Linkedin className='h-5 w-5 text-blue-700' />
                <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>LinkedIn</span>
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={closeShareModal}
            className='mt-6 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}

