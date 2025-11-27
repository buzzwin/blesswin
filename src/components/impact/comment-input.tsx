import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { impactMomentCommentsCollection } from '@lib/firebase/collections';
import { UserAvatar } from '@components/user/user-avatar';
import { Loader2 } from 'lucide-react';
import type { Comment } from '@lib/types/comment';

interface CommentInputProps {
  momentId: string;
  onSuccess?: () => void;
  placeholder?: string;
}

export function CommentInput({ 
  momentId, 
  onSuccess,
  placeholder = 'Write a comment...'
}: CommentInputProps): JSX.Element {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputLimit = 500;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = async (): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!text.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (text.length > inputLimit) {
      toast.error(`Comment must be ${inputLimit} characters or less`);
      return;
    }

    setLoading(true);

    try {
      // Create comment data - serverTimestamp() will be handled by Firestore
      const commentData = {
        text: text.trim(),
        momentId,
        createdBy: user.id,
        createdAt: serverTimestamp()
      };

      await addDoc(impactMomentCommentsCollection(momentId), commentData as any);

      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      toast.success('Comment posted! 💬');
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to post comment';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const isValid = text.trim().length > 0 && text.length <= inputLimit;

  return (
    <div className='flex gap-3 border-b border-gray-200 p-4 dark:border-gray-700'>
      <UserAvatar
        src={user?.photoURL ?? ''}
        alt={user?.name ?? 'User'}
        username={user?.username ?? 'user'}
      />
      <div className='flex-1'>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3',
            'text-gray-900 placeholder-gray-500',
            'dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400',
            'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
            'transition-colors'
          )}
          rows={1}
          maxLength={inputLimit}
          disabled={loading}
        />
        <div className='mt-2 flex items-center justify-between'>
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            {text.length} / {inputLimit}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={cn(
              'rounded-full bg-purple-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-purple-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {loading ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Posting...
              </span>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

