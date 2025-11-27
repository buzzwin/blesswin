import Link from 'next/link';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { formatDate } from '@lib/date';
import { useAuth } from '@lib/context/auth-context';
import { doc, deleteDoc } from 'firebase/firestore';
import { impactMomentCommentsCollection } from '@lib/firebase/collections';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import type { CommentWithUser } from '@lib/types/comment';
import type { Timestamp } from 'firebase/firestore';

interface CommentCardProps {
  comment: CommentWithUser;
  momentId: string;
  onDelete?: () => void;
}

export function CommentCard({ comment, momentId, onDelete }: CommentCardProps): JSX.Element {
  const { user } = useAuth();

  const handleDelete = async (): Promise<void> => {
    if (!comment.id) return;

    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteDoc(doc(impactMomentCommentsCollection(momentId), comment.id));
      toast.success('Comment deleted');
      onDelete?.();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const canDelete = user?.id === comment.createdBy;

  return (
    <div className='flex gap-3 border-b border-gray-200 p-4 dark:border-gray-700'>
      <Link href={`/user/${comment.user.username}`}>
        <a>
          <UserAvatar
            src={comment.user.photoURL}
            alt={comment.user.name}
            username={comment.user.username}
          />
        </a>
      </Link>
      <div className='flex-1 min-w-0'>
        <div className='mb-1 flex items-center gap-2'>
          <Link href={`/user/${comment.user.username}`}>
            <a className='hover:underline'>
              <UserName
                name={comment.user.name}
                username={comment.user.username}
                verified={comment.user.verified ?? false}
                className='font-semibold'
              />
            </a>
          </Link>
          <UserUsername username={comment.user.username} />
          {comment.createdAt && (
            <>
              <span className='text-gray-500 dark:text-gray-400'>·</span>
              <time className='text-sm text-gray-500 dark:text-gray-400'>
                {comment.createdAt instanceof Date 
                  ? formatDate(comment.createdAt as unknown as Timestamp, 'tweet')
                  : formatDate(comment.createdAt, 'tweet')}
              </time>
            </>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className='ml-auto text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              title='Delete comment'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          )}
        </div>
        <p className='whitespace-pre-wrap break-words text-gray-900 dark:text-white'>
          {comment.text}
        </p>
      </div>
    </div>
  );
}

