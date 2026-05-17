import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, Timestamp } from 'firebase/firestore';
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
import { buzzesCollection } from '@lib/firebase/collections';
import { hideBuzzSignature, updateBuzz, deleteBuzz } from '@lib/firebase/utils/buzz';
import { InviteSection } from '@components/buzz/invite-section';
import type { Signature } from '@lib/types/buzz';
import type { ReactElement, ReactNode } from 'react';

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂', anniversary: '💍', graduation: '🎓', trip: '✈️',
  movie: '🎬', series: '📺', gamenight: '🎮', bookclub: '📚',
  diwali: '🪔', christmas: '🎄', eid: '🌙', custom: '✨'
};

const GROUP_OCCASIONS = new Set(['trip', 'movie', 'series', 'gamenight', 'bookclub']);

function SignatureRow({ sig, buzzId }: { sig: Signature; buzzId: string }): JSX.Element {
  async function toggleHide(): Promise<void> {
    try {
      await hideBuzzSignature(buzzId, sig.id, !sig.isHidden);
      toast.success(sig.isHidden ? 'Page shown' : 'Page hidden');
    } catch {
      toast.error('Could not update — try again');
    }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 transition',
        sig.isHidden
          ? 'border-[#e8d8c4] bg-[#f5f1ea] opacity-50 dark:border-[#2a1d10] dark:bg-[#1c1510]'
          : 'border-[#e8d8c4] bg-[#faf8f4] dark:border-[#2a1d10] dark:bg-[#1c1510]'
      )}
    >
      <span className='shrink-0 rounded-lg bg-[rgba(201,169,110,0.1)] px-2 py-1 text-xs font-medium text-[#8a6520] dark:bg-[#1c1510] dark:text-[#9E8B76]'>
        {sig.type === 'photo' ? '📷' : '💬'}
      </span>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold text-[#1a1108] dark:text-[#F5EFE6]'>{sig.authorName}</p>
        {sig.type === 'text' && sig.text && (
          <p className='mt-0.5 truncate text-sm text-[#6b5744] dark:text-[#9E8B76]'>{sig.text}</p>
        )}
        {sig.type === 'photo' && sig.mediaURL && (
          <img src={sig.mediaURL} alt={`${sig.authorName}'s photo`} className='mt-2 h-20 w-20 rounded-lg object-cover' />
        )}
      </div>
      <button
        onClick={toggleHide}
        className='shrink-0 rounded-lg p-1.5 text-[#9E8B76] transition hover:bg-[rgba(201,169,110,0.08)] hover:text-[#C9A96E] dark:hover:bg-[rgba(201,169,110,0.06)]'
        title={sig.isHidden ? 'Show page' : 'Hide page'}
      >
        <HeroIcon iconName={sig.isHidden ? 'EyeIcon' : 'EyeSlashIcon'} className='h-4 w-4' />
      </button>
    </div>
  );
}

const inputCls = [
  'w-full rounded-xl border px-4 py-3 text-sm outline-none transition',
  'border-[#e8d8c4] bg-[#faf8f4] text-[#1a1108] placeholder:text-[#9E8B76]',
  'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white dark:placeholder:text-[#6b5744]',
  'focus:border-[#C9A96E] focus:ring-2 focus:ring-[rgba(201,169,110,0.2)]'
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
        <div className='flex justify-center py-20 text-[#9E8B76]'>
          <HeroIcon iconName='ArrowPathIcon' className='h-6 w-6 animate-spin' />
        </div>
      )}

      {!loading && buzz && (
        <div className='mx-auto max-w-lg space-y-5 py-4'>

          {/* ── Buzz header card ── */}
          <div className='rounded-2xl border border-[#e8d8c4] bg-[#faf8f4] p-5 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <div className='flex items-start gap-3'>
              <span className='text-3xl'>{OCCASION_EMOJI[buzz.occasion] ?? '✨'}</span>
              <div className='flex-1 min-w-0'>
                <h1 className='font-bold text-[#1a1108] dark:text-[#F5EFE6]'>{buzz.title}</h1>
                <p className='mt-0.5 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                  {isGroup ? 'Opens' : 'Reveals'} {revealDate} · {buzz.totalSignatures}{' '}
                  {buzz.totalSignatures === 1 ? 'page' : 'pages'} added
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  buzz.status === 'revealed'
                    ? 'bg-[rgba(156,175,136,0.15)] text-[#5a7a48] dark:bg-[rgba(156,175,136,0.12)] dark:text-[#9CAF88]'
                    : isPastReveal
                    ? 'bg-[rgba(201,169,110,0.15)] text-[#8a6520] dark:bg-[rgba(201,169,110,0.12)] dark:text-[#C9A96E]'
                    : 'bg-[rgba(181,96,60,0.12)] text-[#9a4422] dark:bg-[rgba(181,96,60,0.1)] dark:text-[#D4845A]'
                )}
              >
                {buzz.status === 'revealed' ? 'Revealed' : isPastReveal ? 'Ready to open' : 'Collecting'}
              </span>
            </div>

            {/* Edit / Delete actions */}
            {buzz.status !== 'revealed' && (
              <div className='mt-4 flex items-center gap-2 border-t border-[#e8d8c4] pt-4 dark:border-[#2a1d10]'>
                <button
                  onClick={() => setEditOpen((o) => !o)}
                  className='flex items-center gap-1.5 rounded-xl border border-[#e8d8c4] px-3 py-2 text-sm font-medium text-[#6b5744] transition hover:border-[#C9A96E] hover:text-[#C9A96E] dark:border-[#2a1d10] dark:text-[#9E8B76] dark:hover:border-[rgba(201,169,110,0.4)] dark:hover:text-[#C9A96E]'
                >
                  <HeroIcon iconName='PencilSquareIcon' className='h-4 w-4' />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className='flex items-center gap-1.5 rounded-xl border border-[#e8d8c4] px-3 py-2 text-sm font-medium text-[#9E8B76] transition hover:border-red-300 hover:text-red-500 disabled:opacity-40 dark:border-[#2a1d10] dark:text-[#6b5744] dark:hover:border-red-800 dark:hover:text-red-400'
                >
                  <HeroIcon iconName='TrashIcon' className='h-4 w-4' />
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          {/* ── Inline edit panel ── */}
          {editOpen && buzz.status !== 'revealed' && (
            <div className='rounded-2xl border border-[#C9A96E]/30 bg-[rgba(201,169,110,0.04)] p-5 dark:border-[rgba(201,169,110,0.2)] dark:bg-[rgba(201,169,110,0.03)]'>
              <h2 className='mb-4 font-display text-base font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
                Edit Buzz
              </h2>
              <div className='space-y-3'>
                <div>
                  <label className='mb-1 block text-xs font-medium text-[#6b5744] dark:text-[#9E8B76]'>
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
                  <label className='mb-1 block text-xs font-medium text-[#6b5744] dark:text-[#9E8B76]'>
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
                  <label className='mb-1 block text-xs font-medium text-[#6b5744] dark:text-[#9E8B76]'>
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
                  className='rounded-xl border border-[#e8d8c4] px-4 py-2.5 text-sm font-medium text-[#6b5744] transition hover:bg-[rgba(201,169,110,0.06)] dark:border-[#2a1d10] dark:text-[#9E8B76]'
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Share ── */}
          <div className='rounded-2xl border border-[#e8d8c4] bg-[#faf8f4] p-5 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <p className='mb-3 text-sm font-semibold text-[#1a1108] dark:text-[#C4B5A0]'>
              Share signing link
            </p>
            <div className='flex overflow-hidden rounded-xl border border-[#e8d8c4] dark:border-[#2a1d10]'>
              <span className='flex-1 truncate bg-[#faf8f4] px-3 py-2.5 text-sm text-[#6b5744] dark:bg-[#1c1510] dark:text-[#9E8B76]'>
                {shareUrl}
              </span>
              <button
                onClick={copyLink}
                className='flex shrink-0 items-center gap-1.5 border-l border-[#e8d8c4] bg-[#faf8f4] px-3 py-2.5 text-sm font-medium text-[#C9A96E] hover:bg-[rgba(201,169,110,0.06)] dark:border-[#2a1d10] dark:bg-[#1c1510] dark:hover:bg-[rgba(201,169,110,0.06)]'
              >
                <HeroIcon iconName='ClipboardDocumentIcon' className='h-4 w-4' />
                Copy
              </button>
            </div>
            <WhatsappShareButton
              url={shareUrl}
              title={`Add your page to ${isGroup ? '' : `${buzz.recipientName}'s `}Buzzbook! 📖\n`}
              className='mt-3 w-full'
            >
              <span className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1ebe5d]'>
                <WhatsappIcon size={18} round />
                Share on WhatsApp
              </span>
            </WhatsappShareButton>
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

          {/* ── Signatures ── */}
          <div>
            <p className='mb-3 text-sm font-semibold text-[#1a1108] dark:text-[#C4B5A0]'>
              Pages ({signatures?.length ?? 0})
            </p>
            {!signatures || signatures.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-[#e8d8c4] py-10 text-center text-sm text-[#9E8B76] dark:border-[#2a1d10]'>
                No pages yet — share the link to get people signing.
              </div>
            ) : (
              <div className='space-y-2'>
                {signatures.map((sig) => (
                  <SignatureRow key={sig.id} sig={sig} buzzId={buzz.id} />
                ))}
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
