import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { deleteReview } from '@lib/firebase/utils/review';
import { Modal } from '@components/modal/modal';
import { ActionModal } from '@components/modal/action-modal';
import { HeroIcon } from '@components/ui/hero-icon';
import { cn } from '@lib/utils';

type ReviewActionsProps = {
  reviewId: string;
  userId: string;
  onDelete?: () => void;
};

export function ReviewActions({
  reviewId,
  userId,
  onDelete
}: ReviewActionsProps): JSX.Element {
  const { user } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === userId;

  const handleDelete = async (): Promise<void> => {
    if (!user?.id) return;

    setIsDeleting(true);
    try {
      await deleteReview(reviewId, user.id);
      toast.success('Review deleted successfully');
      onDelete?.();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOwner) return <></>;

  return (
    <>
      <Modal
        modalClassName='max-w-xs bg-main-background w-full p-8 rounded-2xl'
        open={isDeleteModalOpen}
        closeModal={() => setIsDeleteModalOpen(false)}
      >
        <ActionModal
          title='Delete Review?'
          description="This can't be undone and the review will be removed from your profile and the timeline."
          mainBtnClassName='bg-accent-red hover:bg-accent-red/90 active:bg-accent-red/75 accent-tab focus-visible:bg-accent-red/90'
          mainBtnLabel={isDeleting ? 'Deleting...' : 'Delete'}
          focusOnMainBtn
          action={handleDelete}
          closeModal={() => setIsDeleteModalOpen(false)}
        />
      </Modal>

      <button
        onClick={() => setIsDeleteModalOpen(true)}
        className={cn(
          'absolute right-4 top-4',
          'rounded-full p-2',
          'text-gray-500 hover:text-red-600',
          'hover:bg-red-50 dark:hover:bg-red-500/10',
          'transition-colors duration-200'
        )}
      >
        <HeroIcon iconName='TrashIcon' className='h-5 w-5' />
      </button>
    </>
  );
}
