import { doc } from 'firebase/firestore';
import { useDocument } from '@lib/hooks/useDocument';
import { usersCollection } from '@lib/firebase/collections';
import { Loading } from '@components/ui/loading';
import { Error } from '@components/ui/error';
import { UserAvatar } from './user-avatar';
import { UserName } from './user-name';
import { UserUsername } from './user-username';
import { UserFollowButton } from './user-follow-button';
import type { User } from '@lib/types/user';

type UserCardProps = (
  | { userId: string; userData?: never }
  | { userId?: never; userData: User }
) & {
  modal?: boolean;
  follow?: boolean;
};

export function UserCard({
  userId,
  userData,
  modal,
  follow
}: UserCardProps): JSX.Element {
  const docRef = userId
    ? doc(usersCollection, userId)
    : doc(usersCollection, 'placeholder');

  const { data: fetchedUserData, loading } = useDocument(docRef, {
    allowNull: true,
    disabled: !userId
  });

  if (userData)
    return <UserCardContent user={userData} modal={modal} follow={follow} />;
  if (!userId) return <Error />;
  if (loading) return <Loading />;
  if (!fetchedUserData) return <Error />;

  return (
    <UserCardContent user={fetchedUserData} modal={modal} follow={follow} />
  );
}

type UserCardContentProps = {
  user: User;
  modal?: boolean;
  follow?: boolean;
};

function UserCardContent({
  user,
  modal,
  follow
}: UserCardContentProps): JSX.Element {
  return (
    <div className='flex items-center justify-between gap-3 p-4'>
      <div className='flex min-w-0 gap-3'>
        <UserAvatar
          src={user.photoURL}
          alt={user.name}
          username={user.username}
        />
        <div className='flex min-w-0 flex-col'>
          <UserName name={user.name} verified={user.verified} />
          <UserUsername username={user.username} disableLink={modal} />
        </div>
      </div>
      {follow && <UserFollowButton userTargetId={user.id} />}
    </div>
  );
}
