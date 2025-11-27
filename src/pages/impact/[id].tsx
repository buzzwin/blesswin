import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { impactMomentsCollection, usersCollection, impactMomentCommentsCollection } from '@lib/firebase/collections';
import { ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { ImpactMomentCard } from '@components/impact/impact-moment-card';
import { CommentInput } from '@components/impact/comment-input';
import { CommentCard } from '@components/impact/comment-card';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import type { ImpactMomentWithUser } from '@lib/types/impact-moment';
import type { CommentWithUser } from '@lib/types/comment';
import type { ReactElement, ReactNode } from 'react';

export default function ImpactMomentPage(): JSX.Element {
  const router = useRouter();
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
          void router.push('/home');
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

  const handleCommentSuccess = (): void => {
    // Comments will update automatically via the real-time listener
  };

  if (loading) {
    return (
      <MainContainer>
        <MainHeader title='Impact Moment' useMobileSidebar />
        <Loading className='mt-5' />
      </MainContainer>
    );
  }

  if (!moment) {
    return (
      <MainContainer>
        <MainHeader title='Impact Moment' useMobileSidebar />
        <div className='p-4 text-center text-gray-500 dark:text-gray-400'>
          Impact moment not found
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <SEO 
        title={`Impact Moment by ${moment.user.name} - Buzzwin`}
        description={moment.text.substring(0, 160)}
      />
      <MainHeader title='Impact Moment' useMobileSidebar />
      
      {/* Back Button */}
      <div className='border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
        <Link href='/home'>
          <a className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
            <ArrowLeft className='h-4 w-4' />
            Back to Feed
          </a>
        </Link>
      </div>

      {/* Impact Moment */}
      <ImpactMomentCard moment={moment} />

      {/* Comment Input */}
      <CommentInput momentId={id as string} onSuccess={handleCommentSuccess} />

      {/* Comments List */}
      <div>
        {commentsLoading ? (
          <Loading className='mt-5' />
        ) : comments.length === 0 ? (
          <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div>
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                momentId={id as string}
                onDelete={handleCommentSuccess}
              />
            ))}
          </div>
        )}
      </div>
    </MainContainer>
  );
}

ImpactMomentPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>{page}</MainLayout>
  </ProtectedLayout>
);

