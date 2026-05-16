import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
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
import { hideBuzzSignature } from '@lib/firebase/utils/buzz';
import type { Signature } from '@lib/types/buzz';
import type { ReactElement, ReactNode } from 'react';

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂', anniversary: '💍', graduation: '🎓', trip: '✈️',
  movie: '🎬', series: '📺', gamenight: '🎮', bookclub: '📚',
  diwali: '🪔', christmas: '🎄', eid: '🌙', custom: '✨'
};

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
      {/* Type badge */}
      <span className='shrink-0 rounded-lg bg-[rgba(201,169,110,0.1)] px-2 py-1 text-xs font-medium text-[#8a6520] dark:bg-[#1c1510] dark:text-[#9E8B76]'>
        {sig.type === 'photo' ? '📷' : '💬'}
      </span>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold text-[#1a1108] dark:text-[#F5EFE6]'>
          {sig.authorName}
        </p>
        {sig.type === 'text' && sig.text && (
          <p className='mt-0.5 truncate text-sm text-[#6b5744] dark:text-[#9E8B76]'>
            {sig.text}
          </p>
        )}
        {sig.type === 'photo' && sig.mediaURL && (
          <img
            src={sig.mediaURL}
            alt={`${sig.authorName}'s photo`}
            className='mt-2 h-20 w-20 rounded-lg object-cover'
          />
        )}
      </div>

      {/* Hide / show toggle */}
      <button
        onClick={toggleHide}
        className='shrink-0 rounded-lg p-1.5 text-[#9E8B76] transition hover:bg-[rgba(201,169,110,0.08)] hover:text-[#C9A96E] dark:hover:bg-[rgba(201,169,110,0.06)] dark:hover:text-[#C9A96E]'
        title={sig.isHidden ? 'Show page' : 'Hide page'}
      >
        <HeroIcon
          iconName={sig.isHidden ? 'EyeIcon' : 'EyeSlashIcon'}
          className='h-4 w-4'
        />
      </button>
    </div>
  );
}

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
    if (buzz.createdBy !== user.id) {
      void router.replace('/buzzes');
    }
  }, [buzz, buzzLoading, user]);

  const shareUrl =
    typeof window !== 'undefined' && buzz
      ? `${window.location.origin}/b/${buzz.shareToken}`
      : '';

  const isPastReveal = buzz ? Date.now() >= buzz.revealAt.toMillis() : false;

  const revealDate = buzz?.revealAt.toDate().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

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
        <div className='mx-auto max-w-lg space-y-5 px-4 py-4'>
          {/* Buzz header */}
          <div className='rounded-2xl border border-[#e8d8c4] bg-[#faf8f4] p-5 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <div className='flex items-start gap-3'>
              <span className='text-3xl'>
                {OCCASION_EMOJI[buzz.occasion] ?? '✨'}
              </span>
              <div className='flex-1'>
                <h1 className='font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
                  {buzz.title}
                </h1>
                <p className='mt-0.5 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
                  Reveals {revealDate} · {buzz.totalSignatures}{' '}
                  {buzz.totalSignatures === 1 ? 'page' : 'pages'} added
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  buzz.status === 'revealed'
                    ? 'bg-[rgba(201,169,110,0.1)] text-[#8a6520] dark:bg-[rgba(201,169,110,0.08)] dark:text-[#C9A96E]'
                    : isPastReveal
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-[rgba(201,169,110,0.1)] text-[#7a5510] dark:bg-[rgba(201,169,110,0.08)]/30 dark:text-[#9E8B76]'
                )}
              >
                {buzz.status === 'revealed'
                  ? 'Revealed'
                  : isPastReveal
                  ? 'Ready'
                  : 'Collecting'}
              </span>
            </div>
          </div>

          {/* Share */}
          <div className='rounded-2xl border border-[#e8d8c4] bg-[#faf8f4] p-5 dark:border-[#2a1d10] dark:bg-[#1c1510]'>
            <p className='mb-3 text-sm font-semibold text-[#1a1108] dark:text-[#C4B5A0]'>
              Share signing link
            </p>
            <div className='flex overflow-hidden rounded-xl border border-gray-200 dark:border-[#2a1d10]'>
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
              title={`Add your page to ${buzz.recipientName}'s Buzzbook! 📖\n`}
              className='mt-3 w-full'
            >
              <span className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-semibold text-white hover:bg-[#1ebe5d] transition'>
                <WhatsappIcon size={18} round />
                Share on WhatsApp
              </span>
            </WhatsappShareButton>
          </div>

          {/* Open Buzzbook button (once revealed or past reveal) */}
          {(isPastReveal || buzz.status === 'revealed') && (
            <Link href={`/buzzes/${buzz.id}/reveal`}>
              <a>
                <Button className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#C97D60] py-3 font-semibold text-white hover:bg-[#C97D60]'>
                  <span>📖</span>
                  Open the Buzzbook
                </Button>
              </a>
            </Link>
          )}

          {/* Signatures */}
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
