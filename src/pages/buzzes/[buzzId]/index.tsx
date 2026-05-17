import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, Timestamp, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { WhatsappShareButton, WhatsappIcon } from 'next-share';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { useDocument } from '@lib/hooks/useDocument';
import { useSignatures } from '@lib/hooks/useSignatures';
import { buzzesCollection, usersCollection } from '@lib/firebase/collections';
import { hideBuzzSignature, updateBuzz, deleteBuzz } from '@lib/firebase/utils/buzz';
import { InviteSection } from '@components/buzz/invite-section';
import type { Signature } from '@lib/types/buzz';
import type { User } from '@lib/types/user';
import type { ReactElement, ReactNode } from 'react';

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂', anniversary: '💍', graduation: '🎓', trip: '✈️',
  movie: '🎬', series: '📺', gamenight: '🎮', bookclub: '📚',
  diwali: '🪔', christmas: '🎄', eid: '🌙', custom: '✨'
};

const GROUP_OCCASIONS = new Set(['trip', 'movie', 'series', 'gamenight', 'bookclub']);

function ContributorRow({ sig, buzzId }: { sig: Signature; buzzId: string }): JSX.Element {
  async function toggleHide(): Promise<void> {
    try {
      await hideBuzzSignature(buzzId, sig.id, !sig.isHidden);
      toast.success(sig.isHidden ? 'Page shown' : 'Page hidden');
    } catch {
      toast.error('Could not update — try again');
    }
  }

  const initials = sig.authorName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3.5 transition',
        sig.isHidden
          ? 'border-[#C4D6E8] bg-[#f5f1ea] opacity-50 dark:border-[#1E3251] dark:bg-[#122033]'
          : 'border-[#C4D6E8] bg-[#F0F5FA] dark:border-[#1E3251] dark:bg-[#122033]'
      )}
    >
      {/* Avatar */}
      {sig.authorPhotoURL ? (
        <img
          src={sig.authorPhotoURL}
          alt={sig.authorName}
          className='h-9 w-9 shrink-0 rounded-full object-cover'
        />
      ) : (
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(91,184,212,0.15)] text-xs font-bold text-[#1E4A7A] dark:bg-[rgba(91,184,212,0.1)] dark:text-[#5BB8D4]'>
          {initials}
        </div>
      )}

      {/* Name + preview */}
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold text-[#0D1B2A] dark:text-[#E8F0F8]'>{sig.authorName}</p>
        {sig.type === 'text' && sig.text ? (
          <p className='mt-0.5 truncate text-xs text-[#3D5A78] dark:text-[#7A8FA3]'>{sig.text}</p>
        ) : sig.type === 'photo' ? (
          <p className='mt-0.5 text-xs text-[#7A8FA3]'>📷 Photo</p>
        ) : null}
      </div>

      {/* Type badge */}
      <span className='shrink-0 rounded-full border border-[rgba(91,184,212,0.2)] bg-[rgba(91,184,212,0.08)] px-2 py-0.5 text-xs font-medium text-[#1E4A7A] dark:bg-[rgba(91,184,212,0.06)] dark:text-[#5BB8D4]'>
        {sig.type === 'photo' ? '📷' : '💬'}
      </span>

      {/* Show/hide toggle */}
      <button
        onClick={() => void toggleHide()}
        className='shrink-0 rounded-lg p-1.5 text-[#7A8FA3] transition hover:bg-[rgba(91,184,212,0.08)] hover:text-[#5BB8D4] dark:hover:bg-[rgba(91,184,212,0.06)]'
        title={sig.isHidden ? 'Show in Buzzbook' : 'Hide from Buzzbook'}
      >
        <HeroIcon iconName={sig.isHidden ? 'EyeIcon' : 'EyeSlashIcon'} className='h-4 w-4' />
      </button>
    </div>
  );
}

function InvitedRow({ email, shareUrl }: { email: string; shareUrl: string }): JSX.Element {
  function copyLink(): void {
    void navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  }

  return (
    <div className='flex items-center gap-3 rounded-xl border border-dashed border-[#C4D6E8] bg-[#F0F5FA] p-3.5 dark:border-[#1E3251] dark:bg-[#122033]'>
      {/* Email avatar placeholder */}
      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(43,94,167,0.08)] text-sm dark:bg-[rgba(43,94,167,0.06)]'>
        ✉️
      </div>

      <p className='min-w-0 flex-1 truncate text-sm text-[#3D5A78] dark:text-[#7A8FA3]'>{email}</p>

      <span className='shrink-0 rounded-full bg-[rgba(43,94,167,0.1)] px-2.5 py-0.5 text-xs font-medium text-[#9a4422] dark:bg-[rgba(43,94,167,0.08)] dark:text-[#D4845A]'>
        Invited
      </span>

      <button
        onClick={copyLink}
        className='shrink-0 rounded-lg p-1.5 text-[#7A8FA3] transition hover:bg-[rgba(91,184,212,0.08)] hover:text-[#5BB8D4] dark:hover:bg-[rgba(91,184,212,0.06)]'
        title='Copy invite link'
      >
        <HeroIcon iconName='LinkIcon' className='h-4 w-4' />
      </button>
    </div>
  );
}

function InvitedUserRow({ user, shareUrl }: { user: User; shareUrl: string }): JSX.Element {
  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className='flex items-center gap-3 rounded-xl border border-dashed border-[#C4D6E8] bg-[#F0F5FA] p-3.5 dark:border-[#1E3251] dark:bg-[#122033]'>
      {user.photoURL ? (
        <img src={user.photoURL} alt={user.name} className='h-9 w-9 shrink-0 rounded-full object-cover' />
      ) : (
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(91,184,212,0.15)] text-xs font-bold text-[#1E4A7A]'>
          {initials}
        </div>
      )}
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold text-[#0D1B2A] dark:text-[#E8F0F8]'>{user.name}</p>
        <p className='text-xs text-[#7A8FA3]'>@{user.username}</p>
      </div>
      <span className='shrink-0 rounded-full bg-[rgba(43,94,167,0.1)] px-2.5 py-0.5 text-xs font-medium text-[#9a4422] dark:bg-[rgba(43,94,167,0.08)] dark:text-[#D4845A]'>
        Invited
      </span>
      <button
        onClick={() => { void navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); }}
        className='shrink-0 rounded-lg p-1.5 text-[#7A8FA3] transition hover:bg-[rgba(91,184,212,0.08)] hover:text-[#5BB8D4] dark:hover:bg-[rgba(91,184,212,0.06)]'
        title='Copy invite link'
      >
        <HeroIcon iconName='LinkIcon' className='h-4 w-4' />
      </button>
    </div>
  );
}

const inputCls = [
  'w-full rounded-xl border px-4 py-3 text-sm outline-none transition',
  'border-[#C4D6E8] bg-[#F0F5FA] text-[#0D1B2A] placeholder:text-[#7A8FA3]',
  'dark:border-[#1E3251] dark:bg-[#122033] dark:text-white dark:placeholder:text-[#3D5A78]',
  'focus:border-[#5BB8D4] focus:ring-2 focus:ring-[rgba(91,184,212,0.2)]'
].join(' ');

export default function BuzzManagement(): JSX.Element {
  const router = useRouter();
  const { buzzId } = router.query;
  const { user } = useAuth();

  const buzzRef = doc(buzzesCollection, typeof buzzId === 'string' ? buzzId : '__none__');
  const { data: buzz, loading: buzzLoading } = useDocument(buzzRef, {
    allowNull: true,
    disabled: typeof buzzId !== 'string'
  });
  const { signatures, loading: sigsLoading } = useSignatures(
    typeof buzzId === 'string' ? buzzId : null
  );

  // Redirect if not the creator
  useEffect(() => {
    if (buzzLoading || !buzz || !user) return;
    if (buzz.createdBy !== user.id) void router.replace('/buzzes');
  }, [buzz, buzzLoading, user]);

  // ── Invited user profiles ────────────────────────────────────────────────────
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
  useEffect(() => {
    const ids = buzz?.invitedUserIds ?? [];
    if (ids.length === 0) { setInvitedUsers([]); return; }
    void Promise.all(ids.map((id) => getDoc(doc(usersCollection, id))))
      .then((docs) => setInvitedUsers(docs.filter((d) => d.exists()).map((d) => d.data() as User)));
  }, [buzz?.invitedUserIds?.join(',')]);

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editRecipient, setEditRecipient] = useState('');
  const [editRevealAt, setEditRevealAt] = useState('');
  const [saving, setSaving] = useState(false);

  // Populate fields when the edit panel opens
  useEffect(() => {
    if (editOpen && buzz) {
      setEditTitle(buzz.title);
      setEditRecipient(buzz.recipientName);
      // format Timestamp as YYYY-MM-DD for the date input
      const d = buzz.revealAt.toDate();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setEditRevealAt(`${yyyy}-${mm}-${dd}`);
    }
  }, [editOpen]);

  async function handleSave(): Promise<void> {
    if (!buzz) return;
    const trimTitle = editTitle.trim();
    const trimRecipient = editRecipient.trim();
    if (!trimTitle || !trimRecipient || !editRevealAt) {
      toast.error('Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      await updateBuzz(buzz.id, {
        title: trimTitle,
        recipientName: trimRecipient,
        revealAt: Timestamp.fromDate(new Date(editRevealAt))
      });
      toast.success('Buzz updated!');
      setEditOpen(false);
    } catch {
      toast.error('Could not save — try again');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    if (!buzz) return;
    if (!window.confirm('Delete this Buzz? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteBuzz(buzz.id);
      toast.success('Buzz deleted');
      void router.replace('/buzzes');
    } catch {
      toast.error('Could not delete — try again');
      setDeleting(false);
    }
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const shareUrl =
    typeof window !== 'undefined' && buzz
      ? `${window.location.origin}/b/${buzz.shareToken}`
      : '';

  const isPastReveal = buzz ? Date.now() >= buzz.revealAt.toMillis() : false;
  const revealDate = buzz?.revealAt.toDate().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const isGroup = buzz ? GROUP_OCCASIONS.has(buzz.occasion) : false;

  function copyLink(): void {
    void navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  }

  const loading = buzzLoading || sigsLoading;

  return (
    <section>
      <SEO title={buzz ? `${buzz.title} — Manage` : 'Manage Buzz / Buzzwin'} />
      <MainHeader useActionButton iconName='ArrowLeftIcon' action={() => void router.push('/buzzes')} />

      {loading && (
        <div className='flex justify-center py-20 text-[#7A8FA3]'>
          <HeroIcon iconName='ArrowPathIcon' className='h-6 w-6 animate-spin' />
        </div>
      )}

      {!loading && buzz && (
        <div className='mx-auto max-w-lg space-y-5 py-4'>

          {/* ── Buzz header card ── */}
          <div className='rounded-2xl border border-[#C4D6E8] bg-[#F0F5FA] p-5 dark:border-[#1E3251] dark:bg-[#122033]'>
            <div className='flex items-start gap-3'>
              <span className='text-3xl'>{OCCASION_EMOJI[buzz.occasion] ?? '✨'}</span>
              <div className='flex-1 min-w-0'>
                <h1 className='font-bold text-[#0D1B2A] dark:text-[#E8F0F8]'>{buzz.title}</h1>
                <p className='mt-0.5 text-sm text-[#3D5A78] dark:text-[#7A8FA3]'>
                  {isGroup ? 'Opens' : 'Reveals'} {revealDate} · {buzz.totalSignatures}{' '}
                  {buzz.totalSignatures === 1 ? 'page' : 'pages'} added
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  buzz.status === 'revealed'
                    ? 'bg-[rgba(61,191,165,0.15)] text-[#2B7A5C] dark:bg-[rgba(61,191,165,0.12)] dark:text-[#3DBFA5]'
                    : isPastReveal
                    ? 'bg-[rgba(91,184,212,0.15)] text-[#1E4A7A] dark:bg-[rgba(91,184,212,0.12)] dark:text-[#5BB8D4]'
                    : 'bg-[rgba(43,94,167,0.12)] text-[#9a4422] dark:bg-[rgba(43,94,167,0.1)] dark:text-[#D4845A]'
                )}
              >
                {buzz.status === 'revealed' ? 'Revealed' : isPastReveal ? 'Ready to open' : 'Collecting'}
              </span>
            </div>

            {/* Actions row */}
            {buzz.status !== 'revealed' && (
              <div className='mt-4 flex items-center gap-2 border-t border-[#C4D6E8] pt-4 dark:border-[#1E3251]'>
                {/* Add my page */}
                <Link href={shareUrl || '#'}>
                  <a className='flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[rgba(91,184,212,0.35)] bg-[rgba(91,184,212,0.07)] px-3 py-2 text-sm font-semibold text-[#1E4A7A] transition hover:border-[#5BB8D4] hover:bg-[rgba(91,184,212,0.12)] dark:border-[rgba(91,184,212,0.25)] dark:bg-[rgba(91,184,212,0.06)] dark:text-[#5BB8D4]'>
                    <HeroIcon iconName='PencilIcon' className='h-4 w-4' />
                    Add my page
                  </a>
                </Link>
                <button
                  onClick={() => setEditOpen((o) => !o)}
                  className='flex items-center gap-1.5 rounded-xl border border-[#C4D6E8] px-3 py-2 text-sm font-medium text-[#3D5A78] transition hover:border-[#5BB8D4] hover:text-[#5BB8D4] dark:border-[#1E3251] dark:text-[#7A8FA3] dark:hover:border-[rgba(91,184,212,0.4)] dark:hover:text-[#5BB8D4]'
                >
                  <HeroIcon iconName='PencilSquareIcon' className='h-4 w-4' />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className='flex items-center gap-1.5 rounded-xl border border-[#C4D6E8] px-3 py-2 text-sm font-medium text-[#7A8FA3] transition hover:border-red-300 hover:text-red-500 disabled:opacity-40 dark:border-[#1E3251] dark:text-[#3D5A78] dark:hover:border-red-800 dark:hover:text-red-400'
                >
                  <HeroIcon iconName='TrashIcon' className='h-4 w-4' />
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          {/* ── Inline edit panel ── */}
          {editOpen && buzz.status !== 'revealed' && (
            <div className='rounded-2xl border border-[#5BB8D4]/30 bg-[rgba(91,184,212,0.04)] p-5 dark:border-[rgba(91,184,212,0.2)] dark:bg-[rgba(91,184,212,0.03)]'>
              <h2 className='mb-4 font-display text-base font-bold text-[#0D1B2A] dark:text-[#E8F0F8]'>
                Edit Buzz
              </h2>
              <div className='space-y-3'>
                <div>
                  <label className='mb-1 block text-xs font-medium text-[#3D5A78] dark:text-[#7A8FA3]'>
                    Title
                  </label>
                  <input
                    className={inputCls}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={80}
                    placeholder='Buzz title'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-xs font-medium text-[#3D5A78] dark:text-[#7A8FA3]'>
                    {isGroup ? 'Group name' : 'Recipient name'}
                  </label>
                  <input
                    className={inputCls}
                    value={editRecipient}
                    onChange={(e) => setEditRecipient(e.target.value)}
                    maxLength={60}
                    placeholder={isGroup ? 'Group name' : 'Who is this for?'}
                  />
                </div>
                <div>
                  <label className='mb-1 block text-xs font-medium text-[#3D5A78] dark:text-[#7A8FA3]'>
                    {isGroup ? 'Open date' : 'Reveal date'}
                  </label>
                  <input
                    type='date'
                    className={inputCls}
                    value={editRevealAt}
                    onChange={(e) => setEditRevealAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              </div>
              <div className='mt-4 flex gap-2'>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className='flex-1 rounded-xl bg-[#C97D60] py-2.5 text-sm font-semibold text-white transition hover:bg-[#B56540] disabled:opacity-40'
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  onClick={() => setEditOpen(false)}
                  className='rounded-xl border border-[#C4D6E8] px-4 py-2.5 text-sm font-medium text-[#3D5A78] transition hover:bg-[rgba(91,184,212,0.06)] dark:border-[#1E3251] dark:text-[#7A8FA3]'
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Share ── */}
          <div className='rounded-2xl border border-[#C4D6E8] bg-[#F0F5FA] p-5 dark:border-[#1E3251] dark:bg-[#122033]'>
            <p className='mb-3 text-sm font-semibold text-[#0D1B2A] dark:text-[#A8C8E0]'>
              Share signing link
            </p>
            <div className='flex overflow-hidden rounded-xl border border-[#C4D6E8] dark:border-[#1E3251]'>
              <span className='flex-1 truncate bg-[#F0F5FA] px-3 py-2.5 text-sm text-[#3D5A78] dark:bg-[#122033] dark:text-[#7A8FA3]'>
                {shareUrl}
              </span>
              <button
                onClick={copyLink}
                className='flex shrink-0 items-center gap-1.5 border-l border-[#C4D6E8] bg-[#F0F5FA] px-3 py-2.5 text-sm font-medium text-[#5BB8D4] hover:bg-[rgba(91,184,212,0.06)] dark:border-[#1E3251] dark:bg-[#122033] dark:hover:bg-[rgba(91,184,212,0.06)]'
              >
                <HeroIcon iconName='ClipboardDocumentIcon' className='h-4 w-4' />
                Copy
              </button>
            </div>
            <div className='mt-2 flex gap-2'>
              <button
                onClick={copyLink}
                className='flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#C4D6E8] py-2.5 text-sm font-medium text-[#3D5A78] transition hover:border-[#5BB8D4] hover:text-[#5BB8D4] dark:border-[#1E3251] dark:text-[#7A8FA3]'
              >
                <HeroIcon iconName='LinkIcon' className='h-4 w-4' />
                Copy link
              </button>
              <WhatsappShareButton
                url={shareUrl}
                title={`Add your page to ${isGroup ? '' : `${buzz.recipientName}'s `}Buzzbook! 📖\n`}
                className='flex-1'
              >
                <span className='flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#25D366]/30 py-2.5 text-sm font-medium text-[#1a9e4e] transition hover:bg-[#25D366]/5 dark:border-[#25D366]/20 dark:text-[#25D366]'>
                  <WhatsappIcon size={16} round />
                  WhatsApp
                </span>
              </WhatsappShareButton>
            </div>
          </div>

          {/* ── Invite ── */}
          {buzz.status !== 'revealed' && user?.id && (
            <InviteSection buzzId={buzz.id} senderUserId={user.id} />
          )}

          {/* ── Open Buzzbook (once revealed / past reveal) ── */}
          {(isPastReveal || buzz.status === 'revealed') && (
            <Link href={`/buzzes/${buzz.id}/reveal`}>
              <a className='bw-string-lights btn-festive w-full py-4 text-base'>
                ✨ Open the Buzzbook
              </a>
            </Link>
          )}

          {/* ── People ── */}
          <div className='space-y-3'>
            {/* Section header */}
            <div className='flex items-center gap-2'>
              <p className='text-sm font-semibold text-[#0D1B2A] dark:text-[#A8C8E0]'>People</p>
              {(signatures?.length ?? 0) > 0 && (
                <span className='rounded-full bg-[rgba(61,191,165,0.15)] px-2 py-0.5 text-xs font-medium text-[#2B7A5C] dark:bg-[rgba(61,191,165,0.12)] dark:text-[#3DBFA5]'>
                  {signatures?.length ?? 0} added
                </span>
              )}
              {((buzz.invitedEmails?.length ?? 0) + invitedUsers.length) > 0 && (
                <span className='rounded-full bg-[rgba(43,94,167,0.1)] px-2 py-0.5 text-xs font-medium text-[#9a4422] dark:bg-[rgba(43,94,167,0.08)] dark:text-[#D4845A]'>
                  {(buzz.invitedEmails?.length ?? 0) + invitedUsers.length} invited
                </span>
              )}
            </div>

            {/* Contributors */}
            {signatures && signatures.length > 0 && (
              <div className='space-y-2'>
                {signatures.map((sig) => (
                  <ContributorRow key={sig.id} sig={sig} buzzId={buzz.id} />
                ))}
              </div>
            )}

            {/* Invited platform users */}
            {invitedUsers.length > 0 && (
              <div className='space-y-2'>
                {invitedUsers.map((u) => (
                  <InvitedUserRow key={u.id} user={u} shareUrl={shareUrl} />
                ))}
              </div>
            )}

            {/* Invited by email (pending) */}
            {buzz.invitedEmails && buzz.invitedEmails.length > 0 && (
              <div className='space-y-2'>
                {buzz.invitedEmails.map((email) => (
                  <InvitedRow key={email} email={email} shareUrl={shareUrl} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {(!signatures || signatures.length === 0) && invitedUsers.length === 0 && (!buzz.invitedEmails || buzz.invitedEmails.length === 0) && (
              <div className='rounded-2xl border border-dashed border-[#C4D6E8] py-10 text-center text-sm text-[#7A8FA3] dark:border-[#1E3251]'>
                No pages yet — share the link or invite people above.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

BuzzManagement.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <HomeLayout>{page}</HomeLayout>
  </ProtectedLayout>
);
