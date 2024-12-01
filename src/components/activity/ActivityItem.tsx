import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import { UserTooltip } from '@components/user/user-tooltip';
import { UserUsername } from '@components/user/user-username';
import Image from 'next/image';
import { User } from '@lib/types/user';
import { ViewingActivity } from './types';

export const ActivityItem: React.FC<{
  activity: ViewingActivity;
  user: User;
  modal?: boolean;
}> = ({ activity, user }) => {
  const { status, title, poster_path, review } = activity;
  const { name, username, verified, photoURL } = user;
  const { modal } = { modal: false };

  // Calculate time difference only if time exists
  const diffDays = activity.time
    ? Math.floor(
        (new Date().getTime() - new Date(activity.time).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const randomNumber = Math.floor(Math.random() * 16);
  const imgUrl = `https://xsgames.co/randomusers/avatar.php?g=pixel&i=${randomNumber}`;
  //const { open, openModal, closeModal } = useModal();
  //const { user } = useAuth();

  return (
    <>
      <div className='flex items-center justify-between'>
        {useAuth().user ? (
          <div className='flex-0 flex w-full'>
            <div className='mb-2'>
              <UserTooltip avatar modal={modal} {...user}>
                <UserAvatar src={photoURL} alt={name} username={username} />
              </UserTooltip>
            </div>
            <div className='mb-2'>
              <UserTooltip modal={modal} {...user}>
                <UserUsername username={username} />
              </UserTooltip>
              <UserTooltip modal={modal} {...user}>
                <UserName
                  name={name}
                  username={username}
                  verified={verified}
                  className='text-light-primary dark:text-dark-primary'
                />
              </UserTooltip>
            </div>
          </div>
        ) : (
          <UserAvatar src={imgUrl} alt={name} username={username} />
        )}
        {useAuth().user && (
          <div className='h-full w-full'>
            <Image
              className='h-24 rounded-r-xl'
              src={
                poster_path
                  ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                  : '/movie.png'
              }
              alt={title || 'No Image'}
              width={125}
              height={187}
            />
          </div>
        )}
      </div>
      <div className='pt-4'>
        <div className='w-full'>
          <p className='dark:text-white-300 light:text-gray-900 text-md font-medium'>
            <span className='nowrap'>
              <span className='text-rose-900 dark:text-green-200'>
                {username}
              </span>{' '}
              {status} {title}
            </span>
          </p>
          <div className='ml-3'>
            {/* <p className='text-sm text-gray-500'>
          Released on {releaseDate} | {diffDays} days ago
        </p> */}
            <p className='text-sm text-gray-500'>{review}</p>
            {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
          </div>
        </div>
      </div>
    </>
  );
};
