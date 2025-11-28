import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { impactMomentsCollection, usersCollection, impactMomentCommentsCollection } from '@lib/firebase/collections';
import { useAuth } from '@lib/context/auth-context';
import { PublicLayout } from '@components/layout/pub_layout';
import { MainHeader } from '@components/home/main-header';
import { ImpactMomentCard } from '@components/impact/impact-moment-card';
import { CommentCard } from '@components/impact/comment-card';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { siteURL } from '@lib/env';
import type { ImpactMomentWithUser } from '@lib/types/impact-moment';
import type { CommentWithUser } from '@lib/types/comment';

export default function PublicImpactMomentPage(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const [moment, setMoment] = useState<ImpactMomentWithUser | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchMoment = async (): Promise<void> => {
      try {
        const momentDoc = await getDoc(doc(impactMomentsCollection, id));
        
        if (!momentDoc.exists()) {
          toast.error('Impact moment not found');
          void router.push('/');
          return;
        }

        const momentData = { id: momentDoc.id, ...momentDoc.data() };
        
        // Fetch user data
        const userDoc = await getDoc(doc(usersCollection, momentData.createdBy));
        const userData = userDoc.exists() ? userDoc.data() : null;

        setMoment({
          ...momentData,
          user: userData
            ? {
                id: userData.id,
                name: userData.name,
                username: userData.username,
                photoURL: userData.photoURL,
                verified: userData.verified ?? false
              }
            : {
                id: momentData.createdBy,
                name: 'Unknown User',
                username: 'unknown',
                photoURL: '',
                verified: false
              }
        } as ImpactMomentWithUser);
      } catch (error) {
        console.error('Error fetching impact moment:', error);
        toast.error('Failed to load impact moment');
      } finally {
        setLoading(false);
      }
    };

    void fetchMoment();
  }, [id, router]);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    // Set up real-time listener for comments
    const commentsQuery = query(
      impactMomentCommentsCollection(id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        void (async () => {
          try {
            const commentsWithUsers = await Promise.all(
              snapshot.docs.map(async (commentDoc) => {
                const commentData = { id: commentDoc.id, ...commentDoc.data() };
                
                // Fetch user data
                const userDoc = await getDoc(doc(usersCollection, commentData.createdBy));
                const userData = userDoc.exists() ? userDoc.data() : null;

                return {
                  ...commentData,
                  user: userData
                    ? {
                        id: userData.id,
                        name: userData.name,
                        username: userData.username,
                        photoURL: userData.photoURL,
                        verified: userData.verified ?? false
                      }
                    : {
                        id: commentData.createdBy,
                        name: 'Unknown User',
                        username: 'unknown',
                        photoURL: '',
                        verified: false
                      }
                } as CommentWithUser;
              })
            );

            setComments(commentsWithUsers);
          } catch (error) {
            console.error('Error fetching comments:', error);
          } finally {
            setCommentsLoading(false);
          }
        })();
      },
      (error) => {
        console.error('Error listening to comments:', error);
        setCommentsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout
        title='Impact Moment - Buzzwin'
        description='View this positive impact moment on Buzzwin'
        ogUrl={`${siteURL || 'https://buzzwin.com'}/public/moment/${id}`}
      >
        <MainHeader title='Impact Moment' />
        <div className='mx-auto max-w-2xl px-4 py-8'>
          <Loading className='mt-5' />
        </div>
      </PublicLayout>
    );
  }

  if (!moment) {
    return (
      <PublicLayout
        title='Impact Moment Not Found - Buzzwin'
        description='The impact moment you are looking for could not be found'
      >
        <MainHeader title='Impact Moment' />
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

  const publicUrl = `${siteURL || 'https://buzzwin.com'}/public/moment/${moment.id}`;

  return (
    <>
      <SEO 
        title={`Impact Moment by ${moment.user.name} - Buzzwin`}
        description={moment.text.substring(0, 160)}
        image={moment.user.photoURL || undefined}
      />
      <PublicLayout
        title={`Impact Moment by ${moment.user.name} - Buzzwin`}
        description={moment.text.substring(0, 160)}
        ogImage={moment.user.photoURL || undefined}
        ogUrl={publicUrl}
      >
        <MainHeader title='Impact Moment' />
        
        <div className='mx-auto max-w-2xl px-4 py-8'>
          {/* Back Button */}
          <div className='mb-4'>
            <Link href='/'>
              <a className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
                <ArrowLeft className='h-4 w-4' />
                Back to Home
              </a>
            </Link>
          </div>

          {/* Impact Moment */}
          <div className='mb-6'>
            <ImpactMomentCard 
              moment={moment}
              onRipple={() => {
                // Redirect to login if user tries to interact and is not authenticated
                if (!user) {
                  void router.push(`/login?redirect=/public/moment/${moment.id}`);
                }
              }}
            />
          </div>

          {/* Sign In CTA */}
          <div className='mb-6 rounded-lg border border-purple-200 bg-purple-50 p-6 text-center dark:border-purple-800 dark:bg-purple-900/20'>
            <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
              Join the Community
            </h3>
            <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
              Sign in to comment, react, and share your own impact moments!
            </p>
            <Link href='/login'>
              <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-purple-700'>
                <LogIn className='h-5 w-5' />
                Sign In to Join
              </a>
            </Link>
          </div>

          {/* Comments List */}
          <div>
            <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              Comments
            </h3>
            {commentsLoading ? (
              <Loading className='mt-5' />
            ) : comments.length === 0 ? (
              <div className='rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800'>
                <p className='text-gray-500 dark:text-gray-400'>
                  No comments yet. Sign in to be the first to comment!
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {comments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    momentId={id as string}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </PublicLayout>
    </>
  );
}

