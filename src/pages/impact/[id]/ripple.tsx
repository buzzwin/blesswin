import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  doc,
  getDoc,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import {
  impactMomentsCollection,
  usersCollection
} from '@lib/firebase/collections';
import { PublicLayout } from '@components/layout/pub_layout';
import { MainHeader } from '@components/home/main-header';
import { ImpactMomentCard } from '@components/impact/impact-moment-card';
import { Loading } from '@components/ui/loading';
import { Button } from '@components/ui/button';
import { ArrowLeft, LogIn, Mail, Share2, Send } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { siteURL } from '@lib/env';
import { SimpleSocialShare } from '@components/share/simple-social-share';
import type { ImpactMomentWithUser } from '@lib/types/impact-moment';

export default function RippleViewPage(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const [originalMoment, setOriginalMoment] =
    useState<ImpactMomentWithUser | null>(null);
  const [joinedMoments, setJoinedMoments] = useState<ImpactMomentWithUser[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [message, setMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchRipple = async (): Promise<void> => {
      try {
        setLoading(true);

        // Fetch original moment
        const originalDoc = await getDoc(doc(impactMomentsCollection, id));

        if (!originalDoc.exists()) {
          toast.error('Ritual share not found');
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
          originalData.joinedByUsers = joinedSnapshot.docs.map(
            (d) => d.data().createdBy
          );
        }

        const originalUserDoc = await getDoc(
          doc(usersCollection, originalData.createdBy)
        );
        const originalUserData = originalUserDoc.exists()
          ? originalUserDoc.data()
          : null;

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
            const aTime =
              aCreatedAt instanceof Date
                ? aCreatedAt.getTime()
                : aCreatedAt?.toMillis?.() || 0;
            const bTime =
              bCreatedAt instanceof Date
                ? bCreatedAt.getTime()
                : bCreatedAt?.toMillis?.() || 0;
            return aTime - bTime;
          });
        }
        const joinedWithUsers = await Promise.all(
          joinedSnapshot.docs.map(async (joinedDoc) => {
            const joinedData = { id: joinedDoc.id, ...joinedDoc.data() };
            const joinedUserDoc = await getDoc(
              doc(usersCollection, joinedData.createdBy)
            );
            const joinedUserData = joinedUserDoc.exists()
              ? joinedUserDoc.data()
              : null;

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
        console.error('Error fetching ripple:', error);
        toast.error('Failed to load ripple');
      } finally {
        setLoading(false);
      }
    };

    void fetchRipple();
  }, [id, router]);

  const handleEmailShare = async (e?: React.FormEvent): Promise<void> => {
    if (e) {
      e.preventDefault();
    }

    if (!friendEmail || !originalMoment || !user?.id) {
      toast.error("Please enter your friend's email address.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(friendEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch('/api/impact-moments/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          momentId: originalMoment.id,
          momentText: originalMoment.text,
          momentTags: originalMoment.tags,
          momentEffortLevel: originalMoment.effortLevel,
          creatorName: originalMoment.user.name,
          creatorUsername: originalMoment.user.username,
          joinCount: joinedMoments.length,
          friendEmail,
          friendName,
          message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to share action');
      }

      toast.success('Action shared via email! ✨');
      setFriendEmail('');
      setFriendName('');
      setMessage('');
    } catch (error) {
      console.error('Error sharing action:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to share action'
      );
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout
        title='Ripple - Buzzwin'
        description='See how positive actions inspire others to join'
      >
        <MainHeader title='Ripple' />
        <div className='mx-auto min-h-screen max-w-2xl bg-main-background px-4 py-8 dark:bg-dark-background'>
          <Loading className='mt-5' />
        </div>
      </PublicLayout>
    );
  }

  if (!originalMoment) {
    return (
      <PublicLayout
        title='Ripple Not Found - Buzzwin'
        description='The ripple you are looking for could not be found'
      >
        <MainHeader title='Ripple' />
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

  const publicUrl = `${siteURL || 'https://buzzwin.com'}/impact/${id}/ripple`;
  const userName = originalMoment.user.name;
  const userPhotoURL = originalMoment.user.photoURL;
  const seoTitle = `Ripple - ${userName}'s Impact / Buzzwin`;
  const seoDescription = `See how ${userName}'s positive action inspired ${
    joinedMoments.length
  } ${joinedMoments.length === 1 ? 'ripple' : 'ripples'}`;

  return (
    <PublicLayout
      title={seoTitle}
      description={seoDescription}
      ogImage={userPhotoURL || undefined}
      ogUrl={publicUrl}
    >
      <div className='mx-auto min-h-screen max-w-2xl bg-main-background px-4 py-8 dark:bg-dark-background'>
        {/* Back Button */}
        <div className='mb-4'>
          <Link href={`/impact/${id}`}>
            <a className='inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
              <ArrowLeft className='h-4 w-4' />
              Back to Moment
            </a>
          </Link>
        </div>

        {/* Ripple Header */}
        <div className='mb-6 rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800'>
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
            Ripple
          </h2>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {joinedMoments.length === 0
              ? originalMoment.createdBy === user?.id
                ? 'No ripples yet. Share it to inspire others!'
                : 'No ripples yet. Be the first!'
              : originalMoment.createdBy === user?.id
              ? `${joinedMoments.length} ${
                  joinedMoments.length === 1 ? 'ripple' : 'ripples'
                }`
              : `${joinedMoments.length} ${
                  joinedMoments.length === 1 ? 'ripple' : 'ripples'
                }`}
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
                void router.push(`/login?redirect=/impact/${id}/ripple`);
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
          <div className='mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='text-center'>
              <div className='mb-4 text-6xl'>🌱</div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                {originalMoment.createdBy === user?.id
                  ? 'Share Your Ritual Participation'
                  : 'View Ritual'}
              </h3>
              <p className='mb-6 text-sm text-gray-600 dark:text-gray-400'>
                {originalMoment.createdBy === user?.id
                  ? 'Share your ritual participation with others to inspire them!'
                  : 'This ritual participation is part of a ritual. Join the ritual to participate yourself!'}
              </p>
            </div>

            {/* Email Share Form (for creator only) */}
            {originalMoment.createdBy === user?.id && (
              <div
                className='mt-6 space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700'
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ position: 'relative', zIndex: 10 }}
              >
                <div className='flex items-center gap-2'>
                  <Mail className='h-5 w-5 text-green-600 dark:text-green-400' />
                  <h4 className='text-base font-semibold text-gray-900 dark:text-white'>
                    Share via Email
                  </h4>
                </div>

                <form
                  onSubmit={handleEmailShare}
                  className='space-y-4'
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Friend's Email <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='email'
                      value={friendEmail}
                      onChange={(e) => {
                        e.stopPropagation();
                        setFriendEmail(e.target.value);
                      }}
                      onFocus={(e) => {
                        e.stopPropagation();
                        e.currentTarget.focus();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.currentTarget.focus();
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder='friend@example.com'
                      required
                      autoComplete='email'
                      readOnly={false}
                      disabled={false}
                      tabIndex={0}
                      className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400'
                      style={{ pointerEvents: 'auto', zIndex: 20 }}
                    />
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Friend's Name{' '}
                      <span className='text-xs text-gray-400'>(Optional)</span>
                    </label>
                    <input
                      type='text'
                      value={friendName}
                      onChange={(e) => {
                        e.stopPropagation();
                        setFriendName(e.target.value);
                      }}
                      onFocus={(e) => {
                        e.stopPropagation();
                        e.currentTarget.focus();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.currentTarget.focus();
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder='John Doe'
                      autoComplete='name'
                      readOnly={false}
                      disabled={false}
                      tabIndex={0}
                      className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400'
                      style={{ pointerEvents: 'auto', zIndex: 20 }}
                    />
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Personal Message{' '}
                      <span className='text-xs text-gray-400'>(Optional)</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => {
                        e.stopPropagation();
                        setMessage(e.target.value);
                      }}
                      onFocus={(e) => {
                        e.stopPropagation();
                        e.currentTarget.focus();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.currentTarget.focus();
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder={`Hi${
                        friendName ? ` ${friendName}` : ''
                      }! I thought you'd love to see this ritual participation...`}
                      rows={4}
                      readOnly={false}
                      disabled={false}
                      tabIndex={0}
                      className='w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400'
                      style={{ pointerEvents: 'auto', zIndex: 20 }}
                    />
                  </div>

                  <button
                    type='submit'
                    disabled={sendingEmail || !friendEmail}
                    className='w-full rounded-full bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700'
                  >
                    {sendingEmail ? (
                      <>
                        <span className='mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className='mr-2 h-4 w-4' />
                        Send Email
                      </>
                    )}
                  </button>
                </form>

                {/* Social Share */}
                <div className='mt-6 space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700'>
                  <div className='flex items-center gap-2'>
                    <Share2 className='h-5 w-5 text-green-600 dark:text-green-400' />
                    <h4 className='text-base font-semibold text-gray-900 dark:text-white'>
                      Share on Social Media
                    </h4>
                  </div>
                  <SimpleSocialShare
                    title={`${originalMoment.user.name}'s Ritual Participation`}
                    description={`${originalMoment.text.substring(0, 150)}${
                      originalMoment.text.length > 150 ? '...' : ''
                    }\n\nShare your ritual participation 🌱`}
                    url={publicUrl}
                    hashtags={[
                      'PositiveImpact',
                      'JoinTheRipple',
                      'Buzzwin',
                      'DoGood'
                    ]}
                    variant='compact'
                    showTitle={false}
                  />
                </div>
              </div>
            )}

            {/* View Ritual Button (for non-creators) */}
            {originalMoment.createdBy !== user?.id && originalMoment.ritualId && (
              <>
                {user ? (
                  <Link href={`/rituals/${originalMoment.ritualId}`}>
                    <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700'>
                      Join This Ritual
                      <ArrowLeft className='h-4 w-4 rotate-180' />
                    </a>
                  </Link>
                ) : (
                  <Link
                    href={`/login?redirect=/rituals/${originalMoment.ritualId}`}
                  >
                    <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700'>
                      <LogIn className='h-5 w-5' />
                      Sign In to Join Ritual
                    </a>
                  </Link>
                )}
              </>
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
              Sign in to join rituals, comment, and share your own ritual
              participations!
            </p>
            <Link href={`/login?redirect=/impact/${id}/ripple`}>
              <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700'>
                <LogIn className='h-5 w-5' />
                Sign In to Join
              </a>
            </Link>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
