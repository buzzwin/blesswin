import { useState } from 'react';
import { Modal } from '@components/modal/modal';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Button } from '@components/ui/button-shadcn';
import { toast } from 'react-hot-toast';
import { Mail, Share2, Copy, Check, Sparkles } from 'lucide-react';
import { SimpleSocialShare } from '@components/share/simple-social-share';
import type { ImpactMomentWithUser } from '@lib/types/impact-moment';
import { useAuth } from '@lib/context/auth-context';

interface ActionShareModalProps {
  open: boolean;
  closeModal: () => void;
  moment: ImpactMomentWithUser;
}

export function ActionShareModal({
  open,
  closeModal,
  moment
}: ActionShareModalProps): JSX.Element {
  const { user } = useAuth();
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzwin.com';
  const rippleUrl = `${siteURL}/impact/${moment.id}/ripple`;
  const publicUrl = `${siteURL}/public/moment/${moment.id}`;

  const joinCount = moment.joinedByUsers?.length || 0;
  const shareText = `${moment.text.substring(0, 150)}${
    moment.text.length > 150 ? '...' : ''
  }`;
  const shareTitle = `Join This Action: ${moment.user.name}'s Impact Moment`;
  const shareDescription = `${shareText}${
    joinCount > 0
      ? `\n\n${joinCount} ${joinCount === 1 ? 'ripple' : 'ripples'}`
      : ''
  }\n\nJoin the ripple of positive impact 🌱`;

  const handleEmailShare = async (): Promise<void> => {
    if (!friendEmail) {
      toast.error("Please enter your friend's email address.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/impact-moments/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          momentId: moment.id,
          momentText: moment.text,
          momentTags: moment.tags,
          momentEffortLevel: moment.effortLevel,
          creatorName: moment.user.name,
          creatorUsername: moment.user.username,
          joinCount,
          friendEmail,
          friendName,
          message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to share action');
      }

      toast.success('Action shared via email! ✨');
      closeModal();
      setFriendEmail('');
      setFriendName('');
      setMessage('');
    } catch (error) {
      console.error('Error sharing action:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to share action'
      );
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = async (): Promise<void> => {
    try {
      const fullText = `${shareDescription}\n\n${rippleUrl}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Modal
      modalClassName='max-w-md bg-white dark:bg-gray-900 w-full p-6 rounded-2xl max-h-[90vh] overflow-y-auto'
      open={open}
      closeModal={closeModal}
    >
      <div className='space-y-6'>
        <div className='flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='rounded-full bg-green-100 p-2 dark:bg-green-900/30'>
              <Sparkles className='h-5 w-5 text-green-600 dark:text-green-400' />
            </div>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                🌱 Share Your Action
              </h2>
              <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                Share this action with others to inspire them to join!
              </p>
            </div>
          </div>
        </div>

        {/* Action Preview */}
        <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
          <div className='mb-2 flex items-center gap-2'>
            <span className='text-lg'>🌱</span>
            <h3 className='font-semibold text-green-900 dark:text-green-100'>
              {moment.user.name}'s Action
            </h3>
          </div>
          <p className='line-clamp-3 text-sm text-green-800 dark:text-green-200'>
            {moment.text}
          </p>
          {joinCount > 0 && (
            <div className='mt-2 text-xs font-medium text-green-700 dark:text-green-300'>
              {joinCount} {joinCount === 1 ? 'ripple' : 'ripples'}
            </div>
          )}
        </div>

        {/* Email Share Section */}
        <div className='space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            <Mail className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Share via Email
            </h3>
          </div>

          {/* Friend Email */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Friend&apos;s Email <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <Input
                type='email'
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder='friend@example.com'
                required
                className='pl-10'
              />
            </div>
          </div>

          {/* Friend Name */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Friend&apos;s Name{' '}
              <span className='text-xs text-gray-400'>(Optional)</span>
            </label>
            <Input
              type='text'
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder='John Doe'
            />
          </div>

          {/* Personal Message */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Personal Message{' '}
              <span className='text-xs text-gray-400'>(Optional)</span>
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi${
                friendName ? ` ${friendName}` : ''
              }! I thought you'd love to join this action...`}
              rows={3}
            />
          </div>

          <Button
            onClick={handleEmailShare}
            disabled={sending || !friendEmail}
            className='w-full rounded-full bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>

        {/* Social Share Section */}
        <div className='space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            <Share2 className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Share on Social Media
            </h3>
          </div>

          <SimpleSocialShare
            title={shareTitle}
            description={shareDescription}
            url={rippleUrl}
            hashtags={['PositiveImpact', 'JoinTheRipple', 'Buzzwin', 'DoGood']}
            variant='compact'
            showTitle={false}
          />

          <Button
            onClick={handleCopyLink}
            variant='outline'
            className='w-full rounded-full border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
          >
            {copied ? (
              <>
                <Check className='mr-2 h-4 w-4 text-green-600' />
                Copied!
              </>
            ) : (
              <>
                <Copy className='mr-2 h-4 w-4' />
                Copy Link
              </>
            )}
          </Button>
        </div>

        <div className='flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700'>
          <Button
            onClick={closeModal}
            className='flex-1 rounded-full border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
