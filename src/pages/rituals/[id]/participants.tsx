import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  doc,
  getDoc,
  collection
} from 'firebase/firestore';
import {
  usersCollection,
  ritualsCollection
} from '@lib/firebase/collections';
import { ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { Loading } from '@components/ui/loading';
import { ArrowLeft, Users, Share2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { siteURL } from '@lib/env';
import { SimpleSocialShare } from '@components/share/simple-social-share';
import { SEO } from '@components/common/seo';
import type { RitualDefinition } from '@lib/types/ritual';
import { db } from '@lib/firebase/app';

export default function RitualParticipantsPage(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const [ritual, setRitual] = useState<RitualDefinition | null>(null);
  const [joinedUsers, setJoinedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchRitualParticipants = async (): Promise<void> => {
      try {
        setLoading(true);

        // Try to find ritual in global/personalized collection first
        const ritualDoc = await getDoc(doc(ritualsCollection, id));
        let ritualData: RitualDefinition | null = null;

        if (ritualDoc.exists()) {
          ritualData = { id: ritualDoc.id, ...ritualDoc.data() } as RitualDefinition;
        } else {
          // Try to find in user's custom_rituals
          if (user?.id) {
            const customRitualsCollection = collection(db, 'users', user.id, 'custom_rituals');
            const customRitualDoc = await getDoc(doc(customRitualsCollection, id));
            if (customRitualDoc.exists()) {
              ritualData = { id: customRitualDoc.id, ...customRitualDoc.data() } as RitualDefinition;
            }
          }
        }

        if (!ritualData) {
          toast.error('Ritual not found');
          router.push('/rituals');
          return;
        }

        setRitual(ritualData);

        // Fetch user data for joined users
        const joinedUserIds = ritualData.joinedByUsers || [];
        const joinedUsersData: any[] = [];
        
        for (const userId of joinedUserIds) {
          const userDoc = await getDoc(doc(usersCollection, userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            joinedUsersData.push({
              id: userData.id,
              name: userData.name,
              username: userData.username,
              photoURL: userData.photoURL,
              verified: userData.verified ?? false
            });
          }
        }

        setJoinedUsers(joinedUsersData);
      } catch (error) {
        console.error('Error fetching ritual participants:', error);
        toast.error('Failed to load ritual participants');
      } finally {
        setLoading(false);
      }
    };

    void fetchRitualParticipants();
  }, [id, user?.id, router]);

  if (loading) {
    return (
      <ProtectedLayout>
        <MainLayout>
          <MainContainer>
            <MainHeader title='Ritual Participants' />
            <Loading className='mt-5' />
          </MainContainer>
        </MainLayout>
      </ProtectedLayout>
    );
  }

  if (!ritual) {
    return (
      <ProtectedLayout>
        <MainLayout>
          <MainContainer>
            <SEO
              title='Ritual Not Found - Buzzwin'
              description='The ritual you are looking for could not be found'
            />
            <MainHeader title='Ritual Participants' />
            <div className='mt-5 text-center'>
              <p className='text-gray-600 dark:text-gray-400'>Ritual not found</p>
              <Link href='/rituals'>
                <a className='mt-4 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400'>
                  <ArrowLeft className='h-4 w-4' />
                  Back to Rituals
                </a>
              </Link>
            </div>
          </MainContainer>
        </MainLayout>
      </ProtectedLayout>
    );
  }

  const ritualTitle = ritual.title || 'Ritual';
  const joinedCount = joinedUsers.length;
  const publicUrl = `${siteURL || 'https://buzzwin.com'}/rituals/${id}/participants`;

  return (
    <>
      <SEO
        title={`Ritual Participants - ${ritualTitle} / Buzzwin`}
        description={`See who has joined "${ritualTitle}" - ${joinedCount} ${joinedCount === 1 ? 'person has' : 'people have'} joined this ritual`}
      />
      <ProtectedLayout>
        <MainLayout>
          <MainContainer>
            <MainHeader title='Ritual Participants' />

            {/* Ritual Header */}
            <div className='mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-4 flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-3'>
                    <span className='text-3xl'>{ritual.icon || '🌱'}</span>
                    <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {ritualTitle}
                    </h1>
                  </div>
                  <p className='text-gray-600 dark:text-gray-400'>
                    {ritual.description}
                  </p>
                </div>
                <Link href='/rituals'>
                  <a className='flex items-center gap-2 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'>
                    <ArrowLeft className='h-5 w-5' />
                  </a>
                </Link>
              </div>

              {/* Joined Count */}
              <div className='flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700'>
                <div className='flex items-center gap-2'>
                  <Users className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                  <span className='text-lg font-semibold text-gray-900 dark:text-white'>
                    {joinedCount} {joinedCount === 1 ? 'person has' : 'people have'} joined
                  </span>
                </div>
                <SimpleSocialShare
                  url={publicUrl}
                  title={`Check out this ritual: ${ritualTitle}`}
                  description={`${joinedCount} ${joinedCount === 1 ? 'person has' : 'people have'} joined this ritual!`}
                />
              </div>
            </div>

            {/* Joined Users Section */}
            {joinedUsers.length > 0 ? (
              <div>
                <h2 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
                  People who joined this ritual ({joinedUsers.length})
                </h2>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
                  {joinedUsers.map((joinedUser) => (
                    <Link key={joinedUser.id} href={`/user/${joinedUser.username}`}>
                      <a className='flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'>
                        <img
                          src={joinedUser.photoURL || '/default-avatar.png'}
                          alt={joinedUser.name}
                          className='h-12 w-12 rounded-full'
                        />
                        <span className='text-sm font-medium text-gray-900 dark:text-white'>
                          {joinedUser.name}
                        </span>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          @{joinedUser.username}
                        </span>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800'>
                <Users className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                <p className='text-gray-600 dark:text-gray-400'>
                  No one has joined this ritual yet.
                </p>
                <p className='mt-2 text-sm text-gray-500 dark:text-gray-500'>
                  Be the first to join and start doing this regularly!
                </p>
              </div>
            )}
          </MainContainer>
        </MainLayout>
      </ProtectedLayout>
    </>
  );
}

