import { useState } from 'react';
import { Modal } from '@components/modal/modal';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Button } from '@components/ui/button-shadcn';
import { toast } from 'react-hot-toast';
import { Mail, Share2, Copy, Check, Phone } from 'lucide-react';
import { SimpleSocialShare } from '@components/share/simple-social-share';
import type { RitualDefinition } from '@lib/types/ritual';
import { useAuth } from '@lib/context/auth-context';

interface RitualShareModalProps {
  open: boolean;
  closeModal: () => void;
  ritual: RitualDefinition;
}

export function RitualShareModal({
  open,
  closeModal,
  ritual
}: RitualShareModalProps): JSX.Element {
  const { user } = useAuth();
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [message, setMessage] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [copied, setCopied] = useState(false);

  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzwin.com';
  const ritualUrl = `${siteURL}/rituals`;
  const shareText = `Check out this daily ritual: ${ritual.title} - ${ritual.description}`;
  const shareTitle = `Daily Ritual: ${ritual.title}`;

  const handleEmailShare = async (): Promise<void> => {
    if (!friendEmail) {
      toast.error('Please enter your friend\'s email address.');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/rituals/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          ritualId: ritual.id,
          ritualTitle: ritual.title,
          ritualDescription: ritual.description,
          ritualTags: ritual.tags,
          ritualEffortLevel: ritual.effortLevel,
          friendEmail,
          friendName,
          message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send ritual');
      }

      toast.success('Ritual shared via email! ✨');
      closeModal();
      setFriendEmail('');
      setFriendName('');
      setMessage('');
    } catch (error) {
      console.error('Error sharing ritual:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to share ritual');
    } finally {
      setSending(false);
    }
  };

  const handleSMSShare = async (): Promise<void> => {
    if (!friendPhone) {
      toast.error('Please enter your friend\'s phone number.');
      return;
    }

    // Format phone number (remove non-digits, ensure it starts with + for international)
    const cleanPhone = friendPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('1') && cleanPhone.length === 11 
      ? `+${cleanPhone}` 
      : cleanPhone.startsWith('+')
      ? cleanPhone
      : `+1${cleanPhone}`;

    // Validate phone number length
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    const userName = user?.name || user?.username || 'a friend';
    const smsText = smsMessage || `Hi${friendName ? ` ${friendName}` : ''}! ${userName} thought you'd love this daily ritual: ${ritual.title} - ${ritual.description}\n\n${ritualUrl}`;
    
    // Use native SMS link for mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Native SMS link - opens device's SMS app
      const smsLink = `sms:${formattedPhone}?body=${encodeURIComponent(smsText)}`;
      window.location.href = smsLink;
      toast.success('Opening SMS app... 📱');
      setTimeout(() => {
        closeModal();
        setFriendPhone('');
        setSmsMessage('');
      }, 500);
    } else {
      // For desktop, use API to send SMS via Twilio or other service
      setSendingSMS(true);
      try {
        const response = await fetch('/api/rituals/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user?.id,
            ritualId: ritual.id,
            ritualTitle: ritual.title,
            ritualDescription: ritual.description,
            ritualTags: ritual.tags,
            ritualEffortLevel: ritual.effortLevel,
            friendPhone: formattedPhone,
            friendName,
            message: smsMessage,
            shareMethod: 'sms'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send SMS');
        }

        toast.success('Ritual shared via SMS! 📱');
        closeModal();
        setFriendPhone('');
        setSmsMessage('');
      } catch (error) {
        console.error('Error sharing ritual via SMS:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to share ritual via SMS');
      } finally {
        setSendingSMS(false);
      }
    }
  };

  const handleCopyLink = async (): Promise<void> => {
    try {
      const fullText = `${shareText}\n\n${ritualUrl}`;
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
            <div className='rounded-full bg-purple-100 p-2 dark:bg-purple-900/30'>
              <Share2 className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Share Ritual
            </h2>
          </div>
        </div>

        {/* Ritual Preview */}
        <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
          <div className='mb-2 flex items-center gap-2'>
            <span className='text-2xl'>{ritual.icon || '🌱'}</span>
            <h3 className='font-semibold text-purple-900 dark:text-purple-100'>
              {ritual.title}
            </h3>
          </div>
          <p className='text-sm text-purple-800 dark:text-purple-200'>
            {ritual.description}
          </p>
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
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Friend&apos;s Email <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
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
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Friend&apos;s Name <span className='text-gray-400 text-xs'>(Optional)</span>
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
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Personal Message <span className='text-gray-400 text-xs'>(Optional)</span>
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi${friendName ? ` ${friendName}` : ''}! I thought you'd love this daily ritual...`}
              rows={3}
            />
          </div>

          <Button
            onClick={handleEmailShare}
            disabled={sending || !friendEmail}
            className='w-full rounded-full bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>

        {/* SMS Share Section */}
        <div className='space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            <Phone className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Share via SMS
            </h3>
          </div>

          {/* Friend Phone */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Friend&apos;s Phone Number <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Phone className='h-5 w-5 text-gray-400' />
              </div>
              <Input
                type='tel'
                value={friendPhone}
                onChange={(e) => setFriendPhone(e.target.value)}
                placeholder='+1234567890 or (123) 456-7890'
                required
                className='pl-10'
              />
            </div>
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              On mobile devices, this will open your SMS app
            </p>
          </div>

          {/* Friend Name for SMS */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Friend&apos;s Name <span className='text-gray-400 text-xs'>(Optional)</span>
            </label>
            <Input
              type='text'
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder='John Doe'
            />
          </div>

          {/* SMS Message */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Personal Message <span className='text-gray-400 text-xs'>(Optional)</span>
            </label>
            <Textarea
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              placeholder={`Hi${friendName ? ` ${friendName}` : ''}! Check out this daily ritual...`}
              rows={3}
              maxLength={160}
            />
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              {smsMessage.length}/160 characters (message will include ritual details and link)
            </p>
          </div>

          <Button
            onClick={handleSMSShare}
            disabled={sendingSMS || !friendPhone}
            className='w-full rounded-full bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {sendingSMS ? 'Sending...' : 'Send SMS'}
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
            description={ritual.description}
            url={ritualUrl}
            hashtags={['DailyRituals', 'Wellness', 'Buzzwin']}
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

