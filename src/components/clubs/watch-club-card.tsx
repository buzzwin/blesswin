import Link from 'next/link';
import { useAuth } from '@lib/context/auth-context';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import { HeroIcon } from '@components/ui/hero-icon';
import { cn } from '@lib/utils';
import type { WatchClubWithUser } from '@lib/types/watchclub';

type WatchClubCardProps = {
  club: WatchClubWithUser;
};

export function WatchClubCard({ club }: WatchClubCardProps): JSX.Element {
  const { user } = useAuth();
  const isOwner = user?.id === club.createdBy;
  const isMember = club.members.includes(user?.id || '');

  return (
    <Link href={`/clubs/${club.id}`}>
      <a
        className={cn(
          'group relative flex flex-col gap-4',
          'rounded-xl p-4',
          'bg-white dark:bg-gray-900',
          'border border-gray-100 dark:border-gray-800',
          'transition-all duration-200',
          'hover:shadow-lg dark:hover:shadow-gray-800/50'
        )}
      >
        {/* Club Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <UserAvatar
              src={club.user.photoURL}
              alt={club.user.name}
              username={club.user.username}
            />
            <div>
              <h3 className='font-bold text-gray-900 dark:text-white'>
                {club.name}
              </h3>
              <div className='flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400'>
                <span>by</span>
                <UserName
                  name={club.user.name}
                  verified={club.user.verified}
                  className='text-sm'
                />
              </div>
            </div>
          </div>

          {club.isPublic ? (
            <div className='flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'>
              <HeroIcon iconName='GlobeAltIcon' className='h-3 w-3' />
              <span>Public</span>
            </div>
          ) : (
            <div className='flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
              <HeroIcon iconName='LockClosedIcon' className='h-3 w-3' />
              <span>Private</span>
            </div>
          )}
        </div>

        {/* Club Description */}
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          {club.description}
        </p>

        {/* Club Stats */}
        <div className='mt-auto flex items-center justify-between text-sm'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1 text-gray-500 dark:text-gray-400'>
              <HeroIcon iconName='UserGroupIcon' className='h-4 w-4' />
              <span>{club.totalMembers} members</span>
            </div>
            {club.mediaType && (
              <div className='flex items-center gap-1 text-gray-500 dark:text-gray-400'>
                <HeroIcon
                  iconName={club.mediaType === 'movie' ? 'FilmIcon' : 'TvIcon'}
                  className='h-4 w-4'
                />
                <span>
                  {club.mediaType === 'movie' ? 'Movies' : 'TV Shows'}
                </span>
              </div>
            )}
          </div>

          {isMember && (
            <span className='rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'>
              Joined
            </span>
          )}
        </div>
      </a>
    </Link>
  );
}
