import { useState } from 'react';
import { X, Copy, Mail, Share2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import type { RitualDefinition } from '@lib/types/ritual';

interface InviteModalProps {
  ritual: RitualDefinition;
  open: boolean;
  onClose: () => void;
  inviteCount?: number;
}

export function InviteModal({
  ritual,
  open,
  onClose,
  inviteCount = 0
}: InviteModalProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  
  const inviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/rituals/${ritual.id}`
    : '';

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join me in: ${ritual.title}`,
          text: ritual.description,
          url: inviteUrl
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to copy
      await handleCopyLink();
    }
  };

  const handleEmailShare = (): void => {
    const subject = encodeURIComponent(`Join me in: ${ritual.title}`);
    const body = encodeURIComponent(
      `Hi!\n\nI'd love for you to join me in this ritual:\n\n${ritual.title}\n${ritual.description}\n\nJoin here: ${inviteUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (!open) return <></>;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='relative w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-[#1c1510]'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 p-4 dark:border-[#2a1d10]'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Invite Friends
          </h2>
          <button
            onClick={onClose}
            className='rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#231a10] dark:hover:text-gray-300'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Ritual Info */}
          <div className='mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <div className='mb-2 flex items-center gap-2'>
              <span className='text-2xl'>{ritual.icon || '🌱'}</span>
              <h3 className='font-semibold text-gray-900 dark:text-white'>
                {ritual.title}
              </h3>
            </div>
            <p className='text-sm text-gray-600 dark:text-[#9E8B76]'>
              {ritual.description}
            </p>
          </div>

          {/* Invite Count */}
          {inviteCount > 0 && (
            <div className='mb-6 rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20'>
              <p className='text-sm font-medium text-green-700 dark:text-green-300'>
                🎉 {inviteCount} {inviteCount === 1 ? 'person has' : 'people have'} joined from your invite!
              </p>
            </div>
          )}

          {/* Share Options */}
          <div className='space-y-3'>
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className='flex w-full items-center justify-between rounded-lg border-2 border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.06)] px-4 py-3 transition-colors hover:bg-[rgba(201,169,110,0.1)] dark:border-[rgba(201,169,110,0.3)] dark:bg-[rgba(201,169,110,0.08)] dark:hover:bg-[rgba(201,169,110,0.09)]'
            >
              <div className='flex items-center gap-3'>
                {copied ? (
                  <Check className='h-5 w-5 text-green-600 dark:text-green-400' />
                ) : (
                  <Copy className='h-5 w-5 text-[#C9A96E] dark:text-[#C9A96E]' />
                )}
                <span className='font-medium text-[#8a6520] dark:text-[#C9A96E]'>
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </div>
            </button>

            {/* Share (Web Share API) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleShare}
                className='flex w-full items-center gap-3 rounded-lg border-2 border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.06)] px-4 py-3 transition-colors hover:bg-[rgba(201,169,110,0.1)] dark:border-[rgba(201,169,110,0.3)] dark:bg-[rgba(201,169,110,0.08)]/20 dark:hover:bg-[rgba(201,169,110,0.1)]'
              >
                <Share2 className='h-5 w-5 text-[#8a6520] dark:text-[#9E8B76]' />
                <span className='font-medium text-[#7a5510] dark:text-[#C4B5A0]'>
                  Share via...
                </span>
              </button>
            )}

            {/* Email */}
            <button
              onClick={handleEmailShare}
              className='flex w-full items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100 dark:border-[#2a1d10] dark:bg-[#1c1510] dark:hover:bg-[#231a10]'
            >
              <Mail className='h-5 w-5 text-gray-600 dark:text-[#9E8B76]' />
              <span className='font-medium text-gray-700 dark:text-[#C4B5A0]'>
                Share via Email
              </span>
            </button>
          </div>

          {/* Link Preview */}
          <div className='mt-6 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <p className='mb-1 text-xs font-medium text-gray-600 dark:text-[#9E8B76]'>
              Share this link:
            </p>
            <p className='break-all text-xs text-gray-900 dark:text-white'>
              {inviteUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

