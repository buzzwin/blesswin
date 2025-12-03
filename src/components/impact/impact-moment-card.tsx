import { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import {
  impactMomentsCollection,
  usersCollection
} from '@lib/firebase/collections';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { formatDate } from '@lib/date';
import {
  impactTagLabels,
  impactTagColors,
  effortLevelLabels,
  effortLevelIcons,
  rippleTypeLabels,
  rippleTypeIcons,
  type ImpactMomentWithUser,
  type RippleType
} from '@lib/types/impact-moment';
import {
  MessageCircle,
  Share2,
  Sparkles,
  ArrowRight,
  Edit2,
  Trash2
} from 'lucide-react';
import { cn } from '@lib/utils';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { EditMomentModal } from './edit-moment-modal';
import { ActionShareModal } from './action-share-modal';
import type { Timestamp } from 'firebase/firestore';

interface ImpactMomentCardProps {
  moment: ImpactMomentWithUser;
  onRipple?: (momentId: string, rippleType: RippleType) => void;
}

export function ImpactMomentCard({
  moment,
  onRipple
}: ImpactMomentCardProps): JSX.Element {
  const { user } = useAuth();
  const [rippleMenuOpen, setRippleMenuOpen] = useState(false);
  const [originalMoment, setOriginalMoment] =
    useState<ImpactMomentWithUser | null>(null);
  const [loadingOriginal, setLoadingOriginal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwner = user?.id === moment.createdBy;

  // Fetch original moment if this is a joined moment
  useEffect(() => {
    if (moment.joinedFromMomentId && !originalMoment) {
      setLoadingOriginal(true);
      const fetchOriginal = async (): Promise<void> => {
        try {
          const originalDoc = await getDoc(
            doc(impactMomentsCollection, moment.joinedFromMomentId)
          );
          if (originalDoc.exists()) {
            const originalData = { id: originalDoc.id, ...originalDoc.data() };
            const userDoc = await getDoc(
              doc(usersCollection, originalData.createdBy)
            );
            const userData = userDoc.exists() ? userDoc.data() : null;

            setOriginalMoment({
              ...originalData,
              user: userData
                ? {
                    id: userData.id,
                    name: userData.name,
                    username: userData.username,
                    photoURL: userData.photoURL,
                    verified: userData.verified ?? false
                  }
                : {
                    id: originalData.createdBy,
                    name: 'Unknown User',
                    username: 'unknown',
                    photoURL: '',
                    verified: false
                  }
            } as ImpactMomentWithUser);
          }
        } catch (error) {
          console.error('Error fetching original moment:', error);
        } finally {
          setLoadingOriginal(false);
        }
      };
      void fetchOriginal();
    }
  }, [moment.joinedFromMomentId, originalMoment]);

  // Calculate reaction count (excludes joined_you)
  const reactionCount =
    moment.ripples.inspired.length +
    moment.ripples.grateful.length +
    moment.ripples.sent_love.length;

  // Ripple count refers to joined users (chain participation)
  const rippleCount = moment.joinedByUsers?.length || 0;

  const handleRipple = (rippleType: RippleType): void => {
    setRippleMenuOpen(false);
    onRipple?.(moment.id ?? '', rippleType);
  };

  return (
    <article className='border-b border-gray-200 py-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50'>
      <div className='flex gap-3'>
        {/* User Avatar */}
        <Link href={`/user/${moment.user.username}`}>
          <a>
            <UserAvatar
              src={moment.user.photoURL}
              alt={moment.user.name}
              username={moment.user.username}
            />
          </a>
        </Link>

        {/* Content */}
        <div className='min-w-0 flex-1'>
          {/* Ritual Badge */}
          {moment.fromDailyRitual && (
            <div className='mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-900/20'>
              <span className='text-lg'>🌱</span>
              <span className='text-sm font-medium text-green-700 dark:text-green-300'>
                From today's ritual
                {moment.ritualTitle ? `: ${moment.ritualTitle}` : ''}
              </span>
            </div>
          )}

          {/* Joined Badge */}
          {moment.joinedFromMomentId && (
            <div className='mb-3 flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 dark:border-purple-800 dark:bg-purple-900/20'>
              <span className='text-lg'>🌱</span>
              <span className='text-sm font-medium text-purple-700 dark:text-purple-300'>
                Joined{' '}
                {loadingOriginal
                  ? '...'
                  : originalMoment
                  ? `@${originalMoment.user.username}`
                  : 'this action'}
              </span>
              {originalMoment && (
                <Link href={`/impact/${moment.joinedFromMomentId}`}>
                  <a className='ml-auto flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200'>
                    View original
                    <ArrowRight className='h-3 w-3' />
                  </a>
                </Link>
              )}
            </div>
          )}

          {/* Header */}
          <div className='mb-2 flex items-center gap-2'>
            <Link href={`/user/${moment.user.username}`}>
              <a className='hover:underline'>
                <UserName
                  name={moment.user.name}
                  username={moment.user.username}
                  verified={moment.user.verified ?? false}
                  className='font-semibold'
                />
              </a>
            </Link>
            <UserUsername username={moment.user.username} />
            {moment.createdAt && (
              <>
                <span className='text-gray-500 dark:text-gray-400'>·</span>
                <time className='text-sm text-gray-500 dark:text-gray-400'>
                  {moment.createdAt instanceof Date
                    ? formatDate(
                        moment.createdAt as unknown as Timestamp,
                        'tweet'
                      )
                    : formatDate(moment.createdAt, 'tweet')}
                </time>
              </>
            )}
          </div>

          {/* Impact Moment Text */}
          <p className='mb-3 whitespace-pre-wrap break-words text-gray-900 dark:text-white'>
            {moment.text}
          </p>

          {/* Tags */}
          <div className='mb-3 flex flex-wrap gap-2'>
            {moment.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium',
                  impactTagColors[tag]
                )}
              >
                {impactTagLabels[tag]}
              </span>
            ))}
          </div>

          {/* Effort Level */}
          <div className='mb-3 flex items-center gap-2'>
            <span className='text-lg'>
              {effortLevelIcons[moment.effortLevel]}
            </span>
            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              {effortLevelLabels[moment.effortLevel]} Effort
            </span>
          </div>

          {/* Reaction and Ripple Count Display (for original moments) */}
          {!moment.joinedFromMomentId &&
            (reactionCount > 0 || rippleCount > 0) && (
              <div className='mb-3 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400'>
                {reactionCount > 0 && (
                  <span>
                    {reactionCount}{' '}
                    {reactionCount === 1 ? 'reaction' : 'reactions'}
                  </span>
                )}
                {reactionCount > 0 && rippleCount > 0 && <span>•</span>}
                {rippleCount > 0 && (
                  <Link href={`/impact/${moment.id}/ripple`}>
                    <a className='inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'>
                      <span>
                        {rippleCount} {rippleCount === 1 ? 'ripple' : 'ripples'}
                      </span>
                      <ArrowRight className='h-3 w-3' />
                    </a>
                  </Link>
                )}
              </div>
            )}

          {/* View Ripple Button (for original moments with no reactions/ripples yet) */}
          {!moment.joinedFromMomentId &&
            reactionCount === 0 &&
            rippleCount === 0 && (
              <div className='mb-3'>
                <Link href={`/impact/${moment.id}/ripple`}>
                  <a className='inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30'>
                    <span>🌱</span>
                    <span>View ripple</span>
                    <ArrowRight className='h-4 w-4' />
                  </a>
                </Link>
              </div>
            )}

          {/* Mood Check-in */}
          {moment.moodCheckIn && (
            <div className='mb-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20'>
              <div className='mb-2 text-xs font-medium text-purple-700 dark:text-purple-300'>
                Mood Check-in
              </div>
              <div className='flex items-center gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Before:
                  </span>
                  <span className='font-semibold text-gray-900 dark:text-white'>
                    {moment.moodCheckIn.before}/5
                  </span>
                </div>
                <span className='text-gray-400'>→</span>
                <div className='flex items-center gap-2'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    After:
                  </span>
                  <span className='font-semibold text-green-600 dark:text-green-400'>
                    {moment.moodCheckIn.after}/5
                  </span>
                </div>
                {moment.moodCheckIn.after > moment.moodCheckIn.before && (
                  <span className='ml-auto text-xs text-green-600 dark:text-green-400'>
                    +{moment.moodCheckIn.after - moment.moodCheckIn.before}{' '}
                    improvement
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Images */}
          {moment.images && moment.images.length > 0 && (
            <div className='mb-3 grid grid-cols-2 gap-2 overflow-hidden rounded-lg'>
              {moment.images.slice(0, 4).map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Impact moment image ${index + 1}`}
                  className='h-48 w-full object-cover'
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className='relative flex items-center gap-6 pt-2'>
            {/* React Button (Reactions) */}
            <div className='relative'>
              <button
                onClick={() => setRippleMenuOpen(!rippleMenuOpen)}
                className='group flex items-center gap-2 rounded-full p-2 text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-400'
              >
                <Sparkles className='h-5 w-5' />
                <span className='text-sm font-medium'>
                  {reactionCount > 0 ? reactionCount : 'React'}
                </span>
              </button>

              {/* Reactions Menu */}
              {rippleMenuOpen && (
                <div className='absolute left-0 top-full z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
                  <div className='border-b border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400'>
                    Reactions
                  </div>
                  <div className='p-2'>
                    {(
                      ['inspired', 'grateful', 'sent_love'] as RippleType[]
                    ).map((rippleType) => (
                      <button
                        key={rippleType}
                        onClick={() => {
                          setRippleMenuOpen(false);
                          if (moment.id) {
                            void onRipple?.(moment.id, rippleType);
                          }
                        }}
                        className='flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
                      >
                        <span className='text-lg'>
                          {rippleTypeIcons[rippleType]}
                        </span>
                        <span className='font-medium'>
                          {rippleTypeLabels[rippleType]}
                        </span>
                        {moment.ripples[rippleType].length > 0 && (
                          <span className='ml-auto text-xs text-gray-500'>
                            {moment.ripples[rippleType].length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Join This Action Button (for non-creators and non-joined moments) */}
            {moment.createdBy !== user?.id && !moment.joinedFromMomentId && (
              <Link href={`/impact/${moment.id}/join`}>
                <a className='group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30'>
                  <span>🌱</span>
                  <span>Join This Action</span>
                </a>
              </Link>
            )}

            {/* Comment Button */}
            <Link href={`/impact/${moment.id}`}>
              <a className='group flex items-center gap-2 rounded-full p-2 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'>
                <MessageCircle className='h-5 w-5' />
                <span className='text-sm font-medium'>Comment</span>
              </a>
            </Link>

            {/* Share Button */}
            <button
              onClick={() => setShareModalOpen(true)}
              className='group flex items-center gap-2 rounded-full p-2 text-gray-600 transition-colors hover:bg-green-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/30 dark:hover:text-green-400'
            >
              <Share2 className='h-5 w-5' />
              <span className='text-sm font-medium'>Share</span>
            </button>

            {/* Edit & Delete Buttons (Owner Only) */}
            {isOwner && (
              <>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className='group flex items-center gap-2 rounded-full p-2 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'
                >
                  <Edit2 className='h-5 w-5' />
                  <span className='text-sm font-medium'>Edit</span>
                </button>
                <button
                  onClick={async () => {
                    if (
                      !window.confirm(
                        'Are you sure you want to delete this impact moment? This action cannot be undone.'
                      )
                    ) {
                      return;
                    }

                    if (!user?.id || !moment.id) {
                      toast.error('Unable to delete moment');
                      return;
                    }

                    setDeleting(true);
                    try {
                      const response = await fetch(
                        `/api/impact-moments/${moment.id}`,
                        {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: user.id })
                        }
                      );

                      const data = await response.json();

                      if (response.ok) {
                        toast.success('Impact moment deleted successfully');
                        // Reload the page to refresh the feed
                        if (typeof window !== 'undefined') {
                          window.location.reload();
                        }
                      } else {
                        throw new Error(
                          data.error || 'Failed to delete impact moment'
                        );
                      }
                    } catch (error) {
                      console.error('Error deleting impact moment:', error);
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : 'Failed to delete impact moment'
                      );
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  disabled={deleting}
                  className='group flex items-center gap-2 rounded-full p-2 text-gray-600 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                >
                  <Trash2 className='h-5 w-5' />
                  <span className='text-sm font-medium'>
                    {deleting ? 'Deleting...' : 'Delete'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditMomentModal
        moment={moment}
        open={editModalOpen}
        closeModal={() => setEditModalOpen(false)}
        onSuccess={() => {
          // Reload the page to refresh the feed
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
      />

      {/* Share Modal */}
      <ActionShareModal
        moment={moment}
        open={shareModalOpen}
        closeModal={() => setShareModalOpen(false)}
      />
    </article>
  );
}
