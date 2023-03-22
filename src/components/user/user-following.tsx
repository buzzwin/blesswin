import { useAuth } from '@lib/context/auth-context';

type UserFollowingProps = {
  userTargetId: string;
};

export function UserFollowing({
  userTargetId
}: UserFollowingProps): JSX.Element | null {
  const { user } = useAuth();

  const isOwner =
    user?.id !== userTargetId && user?.followers.includes(userTargetId);

  if (!isOwner) return null;

  return (
    <div className='rounded bg-main-search-background text-xs'>Follows you</div>
  );
}
