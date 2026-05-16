import { useState } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Share2,
  Sparkles,
  Edit2,
  Trash2
} from 'lucide-react';
import { cn } from '@lib/utils';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import { UserUsername } from '@components/user/user-username';
import { formatDate } from '@lib/date';
import {
  impactTagLabels,
  rippleTypeLabels,
  rippleTypeIcons,
  type ImpactMomentWithUser,
  type RippleType
} from '@lib/types/impact-moment';
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwner = user?.id === moment.createdBy;

  const reactionCount =
    moment.ripples.inspired.length +
    moment.ripples.grateful.length +
    moment.ripples.sent_love.length;

  const joinerCount = moment.joinedByUsers?.length ?? 0;
  // Total people doing this = original poster + joiners
  const doingTogetherCount = joinerCount + 1;
  const isJoined = moment.joinedFromMomentId != null;

  const createdAt =
    moment.createdAt instanceof Date
      ? (moment.createdAt as unknown as Timestamp)
      : moment.createdAt;

  return (
    <article
      className='border-b border-[#e8d8c4] py-4 transition-colors hover:bg-[rgba(201,169,110,0.02)] dark:border-[#2a1d10] dark:hover:bg-[rgba(201,169,110,0.03)]'
      onClick={() => setRippleMenuOpen(false)}
    >
      <div className='flex gap-3'>
        {/* Avatar */}
        <Link href={`/user/${moment.user.username}`}>
          <a>
            <UserAvatar
              src={moment.user.photoURL}
              alt={moment.user.name}
              username={moment.user.username}
            />
          </a>
        </Link>

        <div className='min-w-0 flex-1'>
          {/* Header */}
          <div className='mb-2 flex flex-wrap items-center gap-1.5 text-sm'>
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
            {createdAt && (
              <>
                <span className='text-[#9E8B76]'>·</span>
                <time className='text-[#9E8B76]'>
                  {formatDate(createdAt, 'tweet')}
                </time>
              </>
            )}
            {isJoined && (
              <>
                <span className='text-[#9E8B76]'>·</span>
                <span className='rounded-full bg-[rgba(201,169,110,0.08)] px-2 py-0.5 text-xs font-medium text-[#8a6520] dark:bg-[rgba(201,169,110,0.06)] dark:text-[#C9A96E]'>
                  doing it together
                </span>
              </>
            )}
          </div>

          {/* Post text */}
          <p className='mb-3 whitespace-pre-wrap break-words text-light-primary dark:text-dark-primary'>
            {moment.text}
          </p>

          {/* Images */}
          {moment.images && moment.images.length > 0 && (
            <div className='mb-3 grid grid-cols-2 gap-2 overflow-hidden rounded-xl'>
              {moment.images.slice(0, 4).map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Photo ${index + 1}`}
                  className='h-48 w-full object-cover'
                />
              ))}
            </div>
          )}

          {/* Tags — warm, uniform style */}
          {moment.tags.length > 0 && (
            <div className='mb-3 flex flex-wrap gap-1.5'>
              {moment.tags.map((tag) => (
                <span
                  key={tag}
                  className='rounded-full bg-[rgba(201,169,110,0.08)] px-2.5 py-0.5 text-xs font-medium text-[#7a5520] dark:bg-[rgba(201,169,110,0.06)] dark:text-[#C9A96E]'
                >
                  {impactTagLabels[tag]}
                </span>
              ))}
            </div>
          )}

          {/* Togetherness count — only on originals with joiners */}
          {!isJoined && joinerCount > 0 && (
            <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(201,169,110,0.25)] bg-[rgba(201,169,110,0.06)] px-3 py-1.5 dark:border-[rgba(201,169,110,0.2)] dark:bg-[rgba(201,169,110,0.05)]'>
              <span className='text-base leading-none'>🤝</span>
              <span className='text-sm font-semibold text-[#7a5520] dark:text-[#C9A96E]'>
                {doingTogetherCount} people doing this together
              </span>
            </div>
          )}

          {/* Action bar */}
          <div className='relative flex items-center gap-0.5 pt-1'>
            {/* Reactions button */}
            <div className='relative'>
              <button
                onClick={(e) => { e.stopPropagation(); setRippleMenuOpen((o) => !o); }}
                className='flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[#6b5744] transition hover:bg-[rgba(201,169,110,0.08)] hover:text-[#C9A96E] dark:text-[#9E8B76] dark:hover:text-[#C9A96E]'
                title='React'
              >
                <Sparkles className='h-4 w-4' />
                {reactionCount > 0 && (
                  <span className='text-xs font-medium'>{reactionCount}</span>
                )}
              </button>

              {rippleMenuOpen && (
                <div
                  className='absolute left-0 top-full z-10 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-[#e8d8c4] bg-[#faf8f4] shadow-lg dark:border-[#2a1d10] dark:bg-[#1c1510]'
                  onClick={(e) => e.stopPropagation()}
                >
                  {(['inspired', 'grateful', 'sent_love'] as RippleType[]).map((rt) => (
                    <button
                      key={rt}
                      onClick={() => { setRippleMenuOpen(false); onRipple?.(moment.id ?? '', rt); }}
                      className='flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[rgba(201,169,110,0.06)] dark:hover:bg-[rgba(201,169,110,0.05)]'
                    >
                      <span className='text-base'>{rippleTypeIcons[rt]}</span>
                      <span className='font-medium text-[#1a1108] dark:text-[#F5EFE6]'>{rippleTypeLabels[rt]}</span>
                      {moment.ripples[rt].length > 0 && (
                        <span className='ml-auto text-xs text-[#9E8B76]'>{moment.ripples[rt].length}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Comment */}
            <Link href={`/impact/${moment.id}`}>
              <a className='flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[#6b5744] transition hover:bg-[rgba(201,169,110,0.08)] hover:text-[#C9A96E] dark:text-[#9E8B76] dark:hover:text-[#C9A96E]' title='Comment'>
                <MessageCircle className='h-4 w-4' />
              </a>
            </Link>

            {/* Share */}
            <button
              onClick={() => setShareModalOpen(true)}
              className='flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[#6b5744] transition hover:bg-[rgba(201,169,110,0.08)] hover:text-[#C9A96E] dark:text-[#9E8B76] dark:hover:text-[#C9A96E]'
              title='Share'
            >
              <Share2 className='h-4 w-4' />
            </button>

            {/* Owner: edit + delete */}
            {isOwner && (
              <>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className='flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[#6b5744] transition hover:bg-[rgba(201,169,110,0.08)] hover:text-[#C9A96E] dark:text-[#9E8B76] dark:hover:text-[#C9A96E]'
                  title='Edit'
                >
                  <Edit2 className='h-4 w-4' />
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm('Delete this post? This cannot be undone.')) return;
                    if (!user?.id || !moment.id) { toast.error('Unable to delete'); return; }
                    setDeleting(true);
                    try {
                      const res = await fetch(`/api/impact-moments/${moment.id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id })
                      });
                      if (res.ok) { toast.success('Deleted'); window.location.reload(); }
                      else { const d = await res.json(); throw new Error(d.error); }
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Failed to delete');
                    } finally { setDeleting(false); }
                  }}
                  disabled={deleting}
                  className='flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[#6b5744] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-[#9E8B76] dark:hover:bg-red-900/20 dark:hover:text-red-400'
                  title='Delete'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </>
            )}

            {/* Do this too — only on original moments, not on the viewer's own post */}
            {!isJoined && !isOwner && (
              <button
                onClick={() => onRipple?.(moment.id ?? '', 'joined_you')}
                className={cn(
                  'ml-auto flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                  joinerCount > 0
                    ? 'border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.08)] text-[#7a5520] hover:bg-[rgba(201,169,110,0.15)] dark:border-[rgba(201,169,110,0.25)] dark:bg-[rgba(201,169,110,0.06)] dark:text-[#C9A96E]'
                    : 'border-[#e8d8c4] bg-[#faf8f4] text-[#6b5744] hover:border-[rgba(201,169,110,0.3)] hover:bg-[rgba(201,169,110,0.06)] dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-[#9E8B76] dark:hover:border-[rgba(201,169,110,0.25)]'
                )}
              >
                <span>🤝</span>
                {joinerCount > 0 ? 'Join them' : 'Do this too'}
              </button>
            )}
          </div>
        </div>
      </div>

      <EditMomentModal
        moment={moment}
        open={editModalOpen}
        closeModal={() => setEditModalOpen(false)}
        onSuccess={() => { if (typeof window !== 'undefined') window.location.reload(); }}
      />
      <ActionShareModal
        moment={moment}
        open={shareModalOpen}
        closeModal={() => setShareModalOpen(false)}
      />
    </article>
  );
}
