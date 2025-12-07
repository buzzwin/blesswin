import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, collection } from 'firebase/firestore';
import { ritualsCollection } from '@lib/firebase/collections';
import { ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { RitualCard } from '@components/rituals/ritual-card';
import { Loading } from '@components/ui/loading';
import { ArrowLeft, Users, Share2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { SEO } from '@components/common/seo';
import type { RitualDefinition } from '@lib/types/ritual';
import { db } from '@lib/firebase/app';

export default function RitualPage(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const [ritual, setRitual] = useState<RitualDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchRitual = async (): Promise<void> => {
      try {
        setLoading(true);

        // Try to find ritual in main rituals collection first
        const ritualDoc = await getDoc(doc(ritualsCollection, id));
        let ritualData: RitualDefinition | null = null;

        if (ritualDoc.exists()) {
          ritualData = { id: ritualDoc.id, ...ritualDoc.data() } as RitualDefinition;
        } else {
          // Try to find in user's custom_rituals (if user is logged in)
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
      } catch (error) {
        console.error('Error fetching ritual:', error);
        toast.error('Failed to load ritual');
        router.push('/rituals');
      } finally {
        setLoading(false);
      }
    };

    void fetchRitual();
  }, [id, user?.id, router]);

  if (loading) {
    return (
      <ProtectedLayout>
        <MainLayout>
          <MainContainer>
            <MainHeader title='Ritual' />
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
            <MainHeader title='Ritual' />
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
  const isGlobal = ritual.scope === 'global';
  const isJoined = ritual.joinedByUsers?.includes(user?.id || '') || false;
  const joinedCount = ritual.joinedByUsers?.length || 0;

  return (
    <>
      <SEO
        title={`${ritualTitle} - Ritual / Buzzwin`}
        description={ritual.description || `Join the ${ritualTitle} ritual and create positive impact`}
      />
      <ProtectedLayout>
        <MainLayout>
          <MainContainer>
            <MainHeader title='Ritual' />

            {/* Back Button */}
            <div className='mb-4'>
              <Link href='/rituals'>
                <a className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
                  <ArrowLeft className='h-4 w-4' />
                  Back to Rituals
                </a>
              </Link>
            </div>

            {/* Ritual Card */}
            <div className='mb-6'>
              <RitualCard
                ritual={ritual}
                isGlobal={isGlobal}
                completed={false}
                showJoinButton={!isJoined && ritual.scope !== 'personalized'}
                ritualScope={ritual.scope}
                onJoinSuccess={() => {
                  // Refresh ritual data
                  void router.replace(router.asPath);
                }}
                onLeaveSuccess={() => {
                  // Refresh ritual data
                  void router.replace(router.asPath);
                }}
              />
            </div>

            {/* Quick Links */}
            <div className='flex flex-wrap gap-3'>
              <Link href={`/rituals/${id}/ripples`}>
                <a className='inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'>
                  <Share2 className='h-4 w-4' />
                  View Ripples
                </a>
              </Link>
              {joinedCount > 0 && (
                <Link href={`/rituals/${id}/participants`}>
                  <a className='inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'>
                    <Users className='h-4 w-4' />
                    View Participants ({joinedCount})
                  </a>
                </Link>
              )}
            </div>
          </MainContainer>
        </MainLayout>
      </ProtectedLayout>
    </>
  );
}

