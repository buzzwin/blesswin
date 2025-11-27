import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { impactMomentsCollection, usersCollection } from '@lib/firebase/collections';
import { ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { ImpactMomentCard } from '@components/impact/impact-moment-card';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import type { ImpactMomentWithUser } from '@lib/types/impact-moment';
import type { ReactElement, ReactNode } from 'react';

export default function ChainViewPage(): JSX.Element {
  const router = useRouter();
  const { id } = router.query;
  const [originalMoment, setOriginalMoment] = useState<ImpactMomentWithUser | null>(null);
  const [joinedMoments, setJoinedMoments] = useState<ImpactMomentWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchChain = async (): Promise<void> => {
      try {
        setLoading(true);

        // Fetch original moment
        const originalDoc = await getDoc(doc(impactMomentsCollection, id));
        
        if (!originalDoc.exists()) {
          toast.error('Impact moment not found');
          void router.push('/home');
          return;
        }

        const originalData = { id: originalDoc.id, ...originalDoc.data() };
        
        // Update joinedByUsers count if not present
        if (!originalData.joinedByUsers) {
          const joinedSnapshot = await getDocs(
            query(
              impactMomentsCollection,
              where('joinedFromMomentId', '==', id)
            )
          );
          originalData.joinedByUsers = joinedSnapshot.docs.map(d => d.data().createdBy);
        }

        const originalUserDoc = await getDoc(doc(usersCollection, originalData.createdBy));
        const originalUserData = originalUserDoc.exists() ? originalUserDoc.data() : null;

        setOriginalMoment({
          ...originalData,
          user: originalUserData
            ? {
                id: originalUserData.id,
                name: originalUserData.name,
                username: originalUserData.username,
                photoURL: originalUserData.photoURL,
                verified: originalUserData.verified ?? false
              }
            : {
                id: originalData.createdBy,
                name: 'Unknown User',
                username: 'unknown',
                photoURL: '',
                verified: false
              }
        } as ImpactMomentWithUser);

        // Fetch all joined moments
        const joinedQuery = query(
          impactMomentsCollection,
          where('joinedFromMomentId', '==', id),
          orderBy('createdAt', 'asc')
        );

        const joinedSnapshot = await getDocs(joinedQuery);
        const joinedWithUsers = await Promise.all(
          joinedSnapshot.docs.map(async (joinedDoc) => {
            const joinedData = { id: joinedDoc.id, ...joinedDoc.data() };
            const joinedUserDoc = await getDoc(doc(usersCollection, joinedData.createdBy));
            const joinedUserData = joinedUserDoc.exists() ? joinedUserDoc.data() : null;

            return {
              ...joinedData,
              user: joinedUserData
                ? {
                    id: joinedUserData.id,
                    name: joinedUserData.name,
                    username: joinedUserData.username,
                    photoURL: joinedUserData.photoURL,
                    verified: joinedUserData.verified ?? false
                  }
                : {
                    id: joinedData.createdBy,
                    name: 'Unknown User',
                    username: 'unknown',
                    photoURL: '',
                    verified: false
                  }
            } as ImpactMomentWithUser;
          })
        );

        setJoinedMoments(joinedWithUsers);
      } catch (error) {
        console.error('Error fetching chain:', error);
        toast.error('Failed to load chain');
      } finally {
        setLoading(false);
      }
    };

    void fetchChain();
  }, [id, router]);

  if (loading) {
    return (
      <MainContainer>
        <MainHeader title='Action Chain' useMobileSidebar />
        <Loading className='mt-5' />
      </MainContainer>
    );
  }

  if (!originalMoment) {
    return (
      <MainContainer>
        <MainHeader title='Action Chain' useMobileSidebar />
        <div className='p-4 text-center text-gray-500 dark:text-gray-400'>
          Impact moment not found
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <SEO 
        title={`Action Chain - ${originalMoment.user.name}'s Impact / Buzzwin`}
        description={`See how ${originalMoment.user.name}'s positive action inspired others to join`}
      />
      <MainHeader title='Action Chain' useMobileSidebar />
      
      {/* Back Button */}
      <div className='border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
        <Link href={`/impact/${id}`}>
          <a className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
            <ArrowLeft className='h-4 w-4' />
            Back to Moment
          </a>
        </Link>
      </div>

      {/* Chain Header */}
      <div className='border-b border-gray-200 px-4 py-4 dark:border-gray-700'>
        <div className='text-center'>
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
            Action Chain
          </h2>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {joinedMoments.length === 0 
              ? 'No one has joined this action yet. Be the first!'
              : `${joinedMoments.length} ${joinedMoments.length === 1 ? 'person has' : 'people have'} joined this action`
            }
          </p>
        </div>
      </div>

      {/* Original Moment */}
      <div className='border-b-2 border-purple-300 px-4 py-4 dark:border-purple-700'>
        <div className='mb-2 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400'>
          Original Action
        </div>
        <ImpactMomentCard moment={originalMoment} />
      </div>

      {/* Joined Moments */}
      {joinedMoments.length > 0 && (
        <div className='px-4 py-4'>
          <div className='mb-4 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400'>
            Joined Actions ({joinedMoments.length})
          </div>
          <div className='space-y-4'>
            {joinedMoments.map((joinedMoment, index) => (
              <div key={joinedMoment.id} className='relative'>
                {/* Connector Line */}
                {index > 0 && (
                  <div className='absolute -top-4 left-6 h-4 w-0.5 bg-purple-200 dark:bg-purple-800' />
                )}
                <ImpactMomentCard moment={joinedMoment} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {joinedMoments.length === 0 && (
        <div className='px-4 py-12 text-center'>
          <div className='mb-4 text-6xl'>🌱</div>
          <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
            Start the Chain
          </h3>
          <p className='mb-6 text-sm text-gray-600 dark:text-gray-400'>
            Be the first to join this action and create a ripple of positive impact!
          </p>
          <Link href={`/impact/${id}`}>
            <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700'>
              Join This Action
              <ArrowLeft className='h-4 w-4 rotate-180' />
            </a>
          </Link>
        </div>
      )}
    </MainContainer>
  );
}

ChainViewPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>{page}</MainLayout>
  </ProtectedLayout>
);

