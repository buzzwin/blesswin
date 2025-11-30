import { useState } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { Modal } from '@components/modal/modal';
import { toast } from 'react-hot-toast';
import { Mail, Send, X } from 'lucide-react';

interface InviteFriendModalProps {
  open: boolean;
  closeModal: () => void;
}

export function InviteFriendModal({
  open,
  closeModal
}: InviteFriendModalProps): JSX.Element {
  const { user } = useAuth();
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Please sign in to invite friends');
      return;
    }

    if (!friendEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(friendEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/invite-friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          friendEmail: friendEmail.trim(),
          friendName: friendName.trim() || undefined,
          message: message.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      toast.success('Invitation sent! ✨');
      setFriendEmail('');
      setFriendName('');
      setMessage('');
      closeModal();
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      modalClassName='max-w-lg bg-white dark:bg-gray-900 w-full p-6 rounded-2xl'
      open={open}
      closeModal={closeModal}
    >
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='rounded-full bg-purple-100 p-2 dark:bg-purple-900/30'>
              <Mail className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Invite a Friend
            </h2>
          </div>
          <button
            onClick={closeModal}
            className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
          >
            <X className='h-5 w-5 text-gray-600 dark:text-gray-400' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Friend's Email */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Friend's Email Address <span className='text-red-500'>*</span>
            </label>
            <input
              type='email'
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder='friend@example.com'
              required
              className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400'
            />
          </div>

          {/* Friend's Name (Optional) */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Friend's Name <span className='text-gray-400 text-xs'>(Optional)</span>
            </label>
            <input
              type='text'
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder='John'
              className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400'
            />
          </div>

          {/* Personal Message (Optional) */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Personal Message <span className='text-gray-400 text-xs'>(Optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Add a personal note...'
              rows={4}
              maxLength={500}
              className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 resize-none'
            />
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              {message.length}/500 characters
            </p>
          </div>

          {/* Info Box */}
          <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
            <p className='text-sm text-purple-900 dark:text-purple-100'>
              <strong>What happens next?</strong> Your friend will receive an email invitation with a link to join Buzzwin. They'll be able to create an account and start sharing their impact moments!
            </p>
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <button
              type='button'
              onClick={closeModal}
              className='flex-1 rounded-full border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={sending || !friendEmail.trim()}
              className='flex-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 font-semibold text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'
            >
              {sending ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Sending...
                </>
              ) : (
                <>
                  <Send className='h-4 w-4' />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

