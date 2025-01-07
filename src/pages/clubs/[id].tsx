import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@lib/context/auth-context';
import { db } from '@lib/firebase/app';
import { joinWatchClub, leaveWatchClub } from '@lib/firebase/utils/watchclub';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { Loading } from '@components/ui/loading';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import type { ReactElement, ReactNode } from 'react';
import type { WatchClubWithUser } from '@lib/types/watchclub';
import { AddMediaModal } from '@components/clubs/add-media-modal';

export default function ClubDetail(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [club, setClub] = useState<WatchClubWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);

  useEffect(() => {
    const loadClub = async (): Promise<void> => {
      if (!id) return;

      try {
        const clubRef = doc(db, 'watchClubs', id as string);
        const clubSnap = await getDoc(clubRef);

        if (!clubSnap.exists()) {
          toast.error('Club not found');
          void router.push('/clubs');
          return;
        }

        const clubData = clubSnap.data();
        const userRef = doc(db, 'users', clubData.createdBy);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (!userData) {
          toast.error('Club owner not found');
          return;
        }

        setClub({
          ...clubData,
          id: clubSnap.id,
          user: {
            id: userData.id,
            name: userData.name,
            username: userData.username,
            photoURL: userData.photoURL,
            verified: userData.verified
          }
        } as WatchClubWithUser);
      } catch (error) {
        console.error('Error loading club:', error);
        toast.error('Failed to load club');
      } finally {
        setLoading(false);
      }
    };

    void loadClub();
  }, [id, router]);

  const handleJoinLeave = async (): Promise<void> => {
    if (!user?.id || !club) return;

    setJoining(true);
    try {
      const isMember = club.members.includes(user.id);
      if (isMember) {
        await leaveWatchClub(club.id, user.id);
        setClub((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            members: prev.members.filter((id) => id !== user.id),
            totalMembers: prev.totalMembers - 1
          };
        });
        toast.success('Left club successfully');
      } else {
        await joinWatchClub(club.id, user.id);
        setClub((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            members: [...prev.members, user.id],
            totalMembers: prev.totalMembers + 1
          };
        });
        toast.success('Joined club successfully');
      }
    } catch (error) {
      console.error('Error joining/leaving club:', error);
      toast.error('Failed to join/leave club');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className='flex h-[50vh] items-center justify-center'>
        <Loading />
      </div>
    );
  }

  if (!club) {
    return (
      <div className='flex h-[50vh] items-center justify-center'>
        <p className='text-gray-500'>Club not found</p>
      </div>
    );
  }

  const isMember = user?.id ? club.members.includes(user.id) : false;
  const isOwner = user?.id === club.createdBy;

  return (
    <section>
      <SEO title={`${club.name} - Watch Club | Buzzwin`} />

      <MainHeader>
        <div className='flex items-center justify-between px-4'>
          <h2 className='text-xl font-bold'>{club.name}</h2>
          {!isOwner && (
            <Button
              onClick={handleJoinLeave}
              disabled={joining}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 font-medium',
                'transition-colors duration-200',
                isMember
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              )}
            >
              {joining ? (
                <HeroIcon
                  iconName='ArrowPathIcon'
                  className='h-5 w-5 animate-spin'
                />
              ) : (
                <HeroIcon
                  iconName={
                    isMember ? 'ArrowLeftOnRectangleIcon' : 'UserPlusIcon'
                  }
                  className='h-5 w-5'
                />
              )}
              {joining
                ? 'Processing...'
                : isMember
                ? 'Leave Club'
                : 'Join Club'}
            </Button>
          )}
        </div>
      </MainHeader>

      <div className='p-4'>
        {/* Club Info */}
        <div className='rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900'>
          <div className='flex items-start gap-4'>
            <UserAvatar
              src={club.user.photoURL}
              alt={club.user.name}
              username={club.user.username}
              className='h-12 w-12'
            />
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <UserName
                  name={club.user.name}
                  verified={club.user.verified}
                  className='text-lg'
                />
                <span className='text-sm text-gray-500'>• Club Owner</span>
              </div>
              <p className='mt-2 text-gray-600 dark:text-gray-300'>
                {club.description}
              </p>
              <div className='mt-4 flex flex-wrap gap-4'>
                <div className='flex items-center gap-2 text-gray-500'>
                  <HeroIcon iconName='UserGroupIcon' className='h-5 w-5' />
                  <span>{club.totalMembers} members</span>
                </div>
                {club.mediaType && (
                  <div className='flex items-center gap-2 text-gray-500'>
                    <HeroIcon
                      iconName={
                        club.mediaType === 'movie' ? 'FilmIcon' : 'TvIcon'
                      }
                      className='h-5 w-5'
                    />
                    <span>
                      {club.mediaType === 'movie' ? 'Movies' : 'TV Shows'}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    'flex items-center gap-2',
                    'rounded-full px-3 py-1',
                    'text-sm',
                    club.isPublic
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                  )}
                >
                  <HeroIcon
                    iconName={club.isPublic ? 'GlobeAltIcon' : 'LockClosedIcon'}
                    className='h-4 w-4'
                  />
                  <span>{club.isPublic ? 'Public' : 'Private'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Club Media */}
        <div className='mt-4 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>
              {club.mediaType === 'movie' ? 'Movies' : 'TV Shows'}
            </h3>
            {(isOwner || isMember) && (
              <Button
                onClick={() => setIsAddMediaOpen(true)}
                className='flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600'
              >
                <HeroIcon iconName='PlusIcon' className='h-4 w-4' />
                Add {club.mediaType === 'movie' ? 'Movie' : 'Show'}
              </Button>
            )}
          </div>

          {club.media?.length ? (
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {club.media.map((media) => (
                <div
                  key={media.id}
                  className='flex items-start gap-3 rounded-lg border p-3 dark:border-gray-700'
                >
                  {media.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${media.posterPath}`}
                      alt={media.title}
                      className='h-24 w-16 rounded-md object-cover'
                    />
                  ) : (
                    <div className='flex h-24 w-16 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800'>
                      <HeroIcon
                        iconName={
                          club.mediaType === 'movie' ? 'FilmIcon' : 'TvIcon'
                        }
                        className='h-8 w-8 text-gray-400'
                      />
                    </div>
                  )}
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white'>
                      {media.title}
                    </h4>
                    <p className='mt-1 text-sm text-gray-500'>
                      {media.releaseDate?.split('-')[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-center text-gray-500'>
              No {club.mediaType === 'movie' ? 'movies' : 'TV shows'} added yet
            </p>
          )}
        </div>

        {/* Club Content - To be implemented */}
        <div className='mt-4 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900'>
          <h3 className='text-lg font-semibold'>Club Activity</h3>
          <p className='mt-2 text-gray-500'>
            Club activity feed coming soon...
          </p>
        </div>
      </div>

      {/* Add Media Modal */}
      <AddMediaModal
        isOpen={isAddMediaOpen}
        onClose={() => setIsAddMediaOpen(false)}
        club={club}
        onMediaAdded={() => {
          void loadClub();
        }}
      />
    </section>
  );
}

ClubDetail.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <HomeLayout>{page}</HomeLayout>
  </ProtectedLayout>
);
