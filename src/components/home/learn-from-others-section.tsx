import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import { SectionShell } from '@components/layout/section-shell';
import { Loading } from '@components/ui/loading';
import { query, orderBy, getDocs, limit, getDoc, doc } from 'firebase/firestore';
import { impactMomentsCollection } from '@lib/firebase/collections';
import { usersCollection } from '@lib/firebase/collections';
import type { ImpactMomentWithUser } from '@lib/types/impact-moment';

export function LearnFromOthersSection(): JSX.Element {
  const router = useRouter();
  const [moments, setMoments] = useState<ImpactMomentWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentMoments = async (): Promise<void> => {
      try {
        setLoading(true);
        // Fetch the 6 most recent impact moments
        const snapshot = await getDocs(
          query(impactMomentsCollection, orderBy('createdAt', 'desc'), limit(6))
        );

        const momentsWithUsers = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const momentData = { id: docSnapshot.id, ...docSnapshot.data() };

            // Fetch user data
            const userDoc = await getDoc(
              doc(usersCollection, momentData.createdBy)
            );
            const userData = userDoc.exists() ? userDoc.data() : null;

            return {
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
            } as ImpactMomentWithUser;
          })
        );

        setMoments(momentsWithUsers);
      } catch (error) {
        console.error('Error fetching impact moments:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchRecentMoments();
  }, []);

  return (
    <SectionShell>
      <div className='mx-auto w-full max-w-6xl px-6'>
        <div className='mb-12 text-center'>
          <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'>
            <Users className='h-8 w-8 text-blue-600 dark:text-blue-400' />
          </div>
          <h2 className='mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl'>
            Learn from Others
          </h2>
          <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300'>
            Discover what others are doing to make their lives better. Get inspired by real actions and join the journey of self-improvement.
          </p>
        </div>

        {loading ? (
          <div className='flex justify-center py-12'>
            <Loading />
          </div>
        ) : moments.length === 0 ? (
          <div className='rounded-xl border-2 border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50'>
            <Sparkles className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
              Be the First to Share
            </h3>
            <p className='mb-6 text-gray-600 dark:text-gray-400'>
              Start your journey and inspire others with your actions.
            </p>
            <button
              onClick={() => void router.push('/login')}
              className='inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-action to-hope px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:scale-105'
            >
              Get Started
              <ArrowRight className='h-4 w-4' />
            </button>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {moments.map((moment) => (
                <div
                  key={moment.id}
                  className='group rounded-xl border-2 border-gray-200 bg-white p-6 transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'
                >
                  <div className='mb-4 flex items-center gap-3'>
                    {moment.user?.photoURL ? (
                      <img
                        src={moment.user.photoURL}
                        alt={moment.user.name || 'User'}
                        className='h-10 w-10 rounded-full'
                      />
                    ) : (
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white'>
                        {moment.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className='flex-1'>
                      <h4 className='font-semibold text-gray-900 dark:text-white'>
                        {moment.user?.name || 'Anonymous'}
                      </h4>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {moment.user?.username || 'user'}
                      </p>
                    </div>
                  </div>

                  <p className='mb-4 line-clamp-3 text-gray-700 dark:text-gray-300'>
                    {moment.text}
                  </p>

                  <div className='mb-4 flex flex-wrap gap-2'>
                    {moment.tags?.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className='rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400'>
                      <span>
                        {moment.ripples?.inspired?.length || 0} ✨
                      </span>
                      <span>
                        {moment.ripples?.grateful?.length || 0} 🙏
                      </span>
                      {moment.joinedByUsers && moment.joinedByUsers.length > 0 && (
                        <span>
                          {moment.joinedByUsers.length} joined
                        </span>
                      )}
                    </div>
                    <Link href={moment.id ? `/public/moment/${moment.id}` : '#'}>
                      <a className='text-sm font-medium text-blue-600 hover:underline dark:text-blue-400'>
                        View →
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-8 text-center'>
              <Link href='/home'>
                <a className='inline-flex items-center gap-2 rounded-full border-2 border-blue-600 px-6 py-3 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20'>
                  View All Community Actions
                  <ArrowRight className='h-4 w-4' />
                </a>
              </Link>
            </div>
          </>
        )}
      </div>
    </SectionShell>
  );
}

