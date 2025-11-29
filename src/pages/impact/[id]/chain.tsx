import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { impactMomentsCollection, usersCollection } from '@lib/firebase/collections';
import { PublicLayout } from '@components/layout/pub_layout';
import { MainHeader } from '@components/home/main-header';
import { ImpactMomentCard } from '@components/impact/impact-moment-card';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { siteURL } from '@lib/env';
import type { ImpactMomentWithUser } from '@lib/types/impact-moment';

export default function ChainViewPage(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
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
        // Try with orderBy first, fallback to without if index doesn't exist
        let joinedSnapshot;
        try {
          const joinedQuery = query(
            impactMomentsCollection,
            where('joinedFromMomentId', '==', id),
            orderBy('createdAt', 'asc')
          );
          joinedSnapshot = await getDocs(joinedQuery);
        } catch (error) {
          // If orderBy fails (likely missing index), try without ordering
          console.warn('OrderBy query failed, fetching without order:', error);
          const joinedQuery = query(
            impactMomentsCollection,
            where('joinedFromMomentId', '==', id)
          );
          joinedSnapshot = await getDocs(joinedQuery);
          // Sort manually by createdAt
          joinedSnapshot.docs.sort((a, b) => {
            const aCreatedAt = a.data().createdAt;
            const bCreatedAt = b.data().createdAt;
            const aTime = aCreatedAt instanceof Date 
              ? aCreatedAt.getTime() 
              : (aCreatedAt?.toMillis?.() || 0);
            const bTime = bCreatedAt instanceof Date 
              ? bCreatedAt.getTime() 
              : (bCreatedAt?.toMillis?.() || 0);
            return aTime - bTime;
          });
        }
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
      <PublicLayout
        title='Action Chain - Buzzwin'
        description='See how positive actions inspire others to join'
      >
        <MainHeader title='Action Chain' />
        <div className='mx-auto max-w-2xl px-4 py-8'>
          <Loading className='mt-5' />
        </div>
      </PublicLayout>
    );
  }

  if (!originalMoment) {
    return (
      <PublicLayout
        title='Action Chain Not Found - Buzzwin'
        description='The action chain you are looking for could not be found'
      >
        <MainHeader title='Action Chain' />
        <div className='mx-auto max-w-2xl px-4 py-8'>
          <div className='rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800'>
            <p className='mb-4 text-gray-600 dark:text-gray-400'>
              Impact moment not found
            </p>
            <Link href='/'>
              <a className='inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400'>
                <ArrowLeft className='h-4 w-4' />
                Back to Home
              </a>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const publicUrl = `${siteURL || 'https://buzzwin.com'}/impact/${id}/chain`;

  return (
    <>
      <SEO 
        title={`Action Chain - ${originalMoment.user.name}'s Impact / Buzzwin`}
        description={`See how ${originalMoment.user.name}'s positive action inspired ${joinedMoments.length} ${joinedMoments.length === 1 ? 'person' : 'people'} to join`}
        image={originalMoment.user.photoURL || undefined}
      />
      <PublicLayout
        title={`Action Chain - ${originalMoment.user.name}'s Impact / Buzzwin`}
        description={`See how ${originalMoment.user.name}'s positive action inspired others to join`}
        ogImage={originalMoment.user.photoURL || undefined}
        ogUrl={publicUrl}
      >
        <MainHeader title='Action Chain' />
        
        <div className='mx-auto max-w-2xl px-4 py-8'>
          {/* Back Button */}
          <div className='mb-4'>
            <Link href={`/impact/${id}`}>
              <a className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
                <ArrowLeft className='h-4 w-4' />
                Back to Moment
              </a>
            </Link>
          </div>

          {/* Chain Header */}
          <div className='mb-6 rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800'>
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

          {/* Original Moment */}
          <div className='mb-6 rounded-lg border-2 border-purple-300 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20'>
            <div className='mb-3 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400'>
              Original Action
            </div>
            <ImpactMomentCard 
              moment={originalMoment}
              onRipple={() => {
                if (!user) {
                  void router.push(`/login?redirect=/impact/${id}/chain`);
                }
              }}
            />
          </div>

          {/* Joined Moments */}
          {joinedMoments.length > 0 && (
            <div className='mb-6'>
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
                    <ImpactMomentCard 
                      moment={joinedMoment}
                      onRipple={() => {
                        if (!user) {
                          void router.push(`/login?redirect=/impact/${id}/chain`);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {joinedMoments.length === 0 && (
            <div className='mb-6 rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-4 text-6xl'>🌱</div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                Start the Chain
              </h3>
              <p className='mb-6 text-sm text-gray-600 dark:text-gray-400'>
                Be the first to join this action and create a ripple of positive impact!
              </p>
              {user ? (
                <Link href={`/impact/${id}`}>
                  <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700'>
                    Join This Action
                    <ArrowLeft className='h-4 w-4 rotate-180' />
                  </a>
                </Link>
              ) : (
                <Link href={`/login?redirect=/impact/${id}`}>
                  <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700'>
                    <LogIn className='h-5 w-5' />
                    Sign In to Join
                  </a>
                </Link>
              )}
            </div>
          )}

          {/* Sign In CTA (if not authenticated) */}
          {!user && (
            <div className='rounded-lg border border-purple-200 bg-purple-50 p-6 text-center dark:border-purple-800 dark:bg-purple-900/20'>
              <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                Join the Community
              </h3>
              <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
                Sign in to join actions, comment, and share your own impact moments!
              </p>
              <Link href={`/login?redirect=/impact/${id}/chain`}>
                <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-purple-700'>
                  <LogIn className='h-5 w-5' />
                  Sign In to Join
                </a>
              </Link>
            </div>
          )}
        </div>
      </PublicLayout>
    </>
  );
}

