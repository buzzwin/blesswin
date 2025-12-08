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
  Trash2,
  Calendar,
  TrendingUp
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
          {/* Ritual Badge - Enhanced with join encouragement (compact mobile-friendly) */}
          {moment.fromDailyRitual && (
            <div className='mb-3 overflow-hidden rounded-lg border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-sm transition-shadow hover:shadow-md dark:border-emerald-700/50 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30'>
              <div className='p-2.5 md:p-3'>
                <div className='flex items-start gap-2 md:gap-2.5'>
                  {/* Icon */}
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm md:h-9 md:w-9'>
                    <Calendar className='h-4 w-4 text-white md:h-4.5 md:w-4.5' />
                  </div>
                  
                  {/* Content */}
                  <div className='min-w-0 flex-1'>
                    {/* Header with badge */}
                    <div className='mb-1 flex flex-wrap items-center gap-1.5 md:gap-2'>
                      <span className='text-xs font-bold text-emerald-800 dark:text-emerald-200 md:text-sm'>
                        Today's Ritual
                      </span>
                      <span className='flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200 md:px-2 md:text-xs'>
                        <TrendingUp className='h-2.5 w-2.5 md:h-3 md:w-3' />
                        Active
                      </span>
                    </div>
                    
                    {/* Ritual Title */}
                    <h4 className='mb-1.5 text-sm font-bold text-gray-900 dark:text-white md:text-base'>
                      {moment.ritualTitle || 'Daily Ritual'}
                    </h4>
                    
                    {/* Compact description */}
                    <p className='mb-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300 md:text-sm'>
                      Join this ritual to create your own moments and earn karma!
                    </p>
                    
                    {/* Join Button - Compact */}
                    {moment.ritualId ? (
                      <Link href={`/rituals/${moment.ritualId}`}>
                        <a className='inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-md md:px-3.5 md:py-2 md:text-sm'>
                          <span className='text-sm md:text-base'>🌱</span>
                          <span>Join Ritual</span>
                          <ArrowRight className='h-3 w-3 md:h-3.5 md:w-3.5' />
                        </a>
                      </Link>
                    ) : (
                      <Link href='/rituals'>
                        <a className='inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-md md:px-3.5 md:py-2 md:text-sm'>
                          <span className='text-sm md:text-base'>🌱</span>
                          <span>View Rituals</span>
                          <ArrowRight className='h-3 w-3 md:h-3.5 md:w-3.5' />
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              {/* Decorative bottom border - thinner */}
              <div className='h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 md:h-1'></div>
            </div>
          )}

          {/* Shared Ritual Participation Badge */}
          {moment.joinedFromMomentId && (
            <div className='mb-3 flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 dark:border-purple-800 dark:bg-purple-900/20'>
              <span className='text-lg'>🌱</span>
              <span className='text-sm font-medium text-purple-700 dark:text-purple-300'>
                Shared ritual participation from{' '}
                {loadingOriginal
                  ? '...'
                  : originalMoment
                  ? `@${originalMoment.user.username}`
                  : 'another user'}
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

          {/* Ritual Participation Text */}
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
                  <Link href={moment.ritualId ? `/rituals/${moment.ritualId}` : `/impact/${moment.id}/ripple`}>
                    <a className='inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'>
                      <span>
                        {moment.ritualId ? (
                          <>View ritual</>
                        ) : (
                          <>
                            {rippleCount} {rippleCount === 1 ? 'ripple' : 'ripples'}
                          </>
                        )}
                      </span>
                      <ArrowRight className='h-3 w-3' />
                    </a>
                  </Link>
                )}
              </div>
            )}

          {/* View Ripple/Ritual Button (for original moments with no reactions/ripples yet) */}
          {!moment.joinedFromMomentId &&
            reactionCount === 0 &&
            rippleCount === 0 && (
              <div className='mb-3'>
                {moment.ritualId ? (
                  <Link href={`/rituals/${moment.ritualId}`}>
                    <a className='inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30'>
                      <span>🌱</span>
                      <span>View ritual</span>
                      <ArrowRight className='h-4 w-4' />
                    </a>
                  </Link>
                ) : (
                  <Link href={`/impact/${moment.id}/ripple`}>
                    <a className='inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30'>
                      <span>🌱</span>
                      <span>View ripple</span>
                      <ArrowRight className='h-4 w-4' />
                    </a>
                  </Link>
                )}
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
                  alt={`Ritual share image ${index + 1}`}
                  className='h-48 w-full object-cover'
                />
              ))}
            </div>
          )}

          {/* Actions - Compact */}
          <div className='relative flex flex-col gap-1.5 pt-2'>
            {/* Primary Actions: Reactions, Comment, Share, Edit, Delete */}
            <div className='flex flex-wrap items-center gap-1.5 md:gap-2'>
              {/* React Button (Reactions) */}
              <div className='relative'>
                <button
                  onClick={() => setRippleMenuOpen(!rippleMenuOpen)}
                  className='group flex items-center gap-1 rounded-full p-1.5 text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 md:gap-1.5 md:p-2'
                  title='React'
                >
                  <Sparkles className='h-4 w-4 md:h-4.5 md:w-4.5' />
                  <span className='text-xs font-medium md:text-sm'>
                    {reactionCount > 0 ? reactionCount : <span className='hidden sm:inline'>React</span>}
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

              {/* Comment Button */}
              <Link href={`/impact/${moment.id}`}>
                <a className='group flex items-center gap-1 rounded-full p-1.5 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 md:gap-1.5 md:p-2' title='Comment'>
                  <MessageCircle className='h-4 w-4 md:h-4.5 md:w-4.5' />
                  <span className='text-xs font-medium md:text-sm'><span className='hidden sm:inline'>Comment</span></span>
                </a>
              </Link>

              {/* Share Button */}
              <button
                onClick={() => setShareModalOpen(true)}
                className='group flex items-center gap-1 rounded-full p-1.5 text-gray-600 transition-colors hover:bg-green-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/30 dark:hover:text-green-400 md:gap-1.5 md:p-2'
                title='Share'
              >
                <Share2 className='h-4 w-4 md:h-4.5 md:w-4.5' />
                <span className='text-xs font-medium md:text-sm'><span className='hidden sm:inline'>Share</span></span>
              </button>

              {/* Edit & Delete Buttons (Owner Only) - Now inline */}
              {isOwner && (
                <>
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className='group flex items-center gap-1 rounded-full p-1.5 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 md:gap-1.5 md:p-2'
                    title='Edit'
                  >
                    <Edit2 className='h-4 w-4 md:h-4.5 md:w-4.5' />
                    <span className='text-xs font-medium md:text-sm'><span className='hidden sm:inline'>Edit</span></span>
                  </button>
                  <button
                    onClick={async () => {
                      if (
                        !window.confirm(
                          'Are you sure you want to delete this ritual share? This action cannot be undone.'
                        )
                      ) {
                        return;
                      }

                      if (!user?.id || !moment.id) {
                        toast.error('Unable to delete ritual share');
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
                          toast.success('Ritual share deleted successfully');
                          // Reload the page to refresh the feed
                          if (typeof window !== 'undefined') {
                            window.location.reload();
                          }
                        } else {
                          throw new Error(
                            data.error || 'Failed to delete ritual share'
                          );
                        }
                      } catch (error) {
                        console.error('Error deleting ritual share:', error);
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Failed to delete ritual share'
                        );
                      } finally {
                        setDeleting(false);
                      }
                    }}
                    disabled={deleting}
                    className='group flex items-center gap-1 rounded-full p-1.5 text-gray-600 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 md:gap-1.5 md:p-2'
                    title='Delete'
                  >
                    <Trash2 className='h-4 w-4 md:h-4.5 md:w-4.5' />
                    <span className='text-xs font-medium md:text-sm'>
                      {deleting ? <span className='hidden sm:inline'>Deleting...</span> : <span className='hidden sm:inline'>Delete</span>}
                    </span>
                  </button>
                </>
              )}
            </div>
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
