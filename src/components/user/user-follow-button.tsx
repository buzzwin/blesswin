import { useAuth } from '@lib/context/auth-context';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { useFollowUser } from '@lib/hooks/useFollowUser';
import { cn } from '@lib/utils';

type UserFollowButtonProps = {
  userTargetId: string;
};

export function UserFollowButton({
  userTargetId
}: UserFollowButtonProps): JSX.Element | null {
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollowUser(userTargetId);

  if (!user || user.id === userTargetId) return null;

  return (
    <Button
      onClick={toggleFollow}
      className={cn(
        'min-w-[100px] self-start rounded-full border px-4 py-1.5',
        'transition-colors duration-200',
        isFollowing
          ? 'border-gray-300 hover:border-red-400 hover:bg-red-500/10 hover:text-red-600 dark:border-gray-700 dark:hover:border-red-400'
          : 'border-transparent bg-white font-bold text-black hover:bg-white/90 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800'
      )}
    >
      <span className={cn(isFollowing && 'group-hover:hidden')}>
        {isFollowing ? 'Following' : 'Follow'}
      </span>
      {isFollowing && (
        <span className='hidden text-red-600 group-hover:inline'>Unfollow</span>
      )}
    </Button>
  );
}
