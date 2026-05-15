import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { WhatsappShareButton, WhatsappIcon } from 'next-share';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { createBuzz, sendBuzzTweet, setBuzzFeedTweetId, awardBuzzKarma } from '@lib/firebase/utils/buzz';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import type { BuzzOccasion, BuzzBoardMode } from '@lib/types/buzz';
import { Timestamp } from 'firebase/firestore';

type Step = 'occasion' | 'recipient' | 'reveal' | 'done';

type OccasionOption = {
  value: BuzzOccasion;
  label: string;
  emoji: string;
  defaultTitle: (name: string) => string;
};

const OCCASIONS: OccasionOption[] = [
  { value: 'birthday',    label: 'Birthday',    emoji: '🎂', defaultTitle: (n) => `Happy Birthday ${n}!` },
  { value: 'diwali',      label: 'Diwali',      emoji: '🪔', defaultTitle: (n) => `Happy Diwali ${n}!` },
  { value: 'christmas',   label: 'Christmas',   emoji: '🎄', defaultTitle: (n) => `Merry Christmas ${n}!` },
  { value: 'eid',         label: 'Eid',         emoji: '🌙', defaultTitle: (n) => `Eid Mubarak ${n}!` },
  { value: 'anniversary', label: 'Anniversary', emoji: '💍', defaultTitle: (n) => `Happy Anniversary ${n}!` },
  { value: 'custom',      label: 'Custom',      emoji: '✨', defaultTitle: (n) => `A Buzz for ${n}` }
];

function minRevealDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

function formatRevealDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const STEP_LABELS: Record<Step, string> = {
  occasion: 'Occasion',
  recipient: 'Who',
  reveal: 'When',
  done: 'Done'
};

const STEP_ORDER: Step[] = ['occasion', 'recipient', 'reveal', 'done'];

type FormState = {
  occasion: BuzzOccasion | null;
  customOccasion: string;
  boardMode: BuzzBoardMode;
  recipientName: string;
  title: string;
  revealAt: string;
};

const INITIAL: FormState = {
  occasion: null,
  customOccasion: '',
  boardMode: 'personal',
  recipientName: '',
  title: '',
  revealAt: ''
};

export function CreateBuzzForm(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('occasion');
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const occasionObj = OCCASIONS.find((o) => o.value === form.occasion);
  const stepIndex = STEP_ORDER.indexOf(step);

  function pickOccasion(occ: BuzzOccasion): void {
    const obj = OCCASIONS.find((o) => o.value === occ) ?? OCCASIONS[0];
    setForm((f) => ({
      ...f,
      occasion: occ,
      title: obj.defaultTitle(f.recipientName || 'You')
    }));
    setStep('recipient');
  }

  function handleRecipientChange(name: string): void {
    const obj = OCCASIONS.find((o) => o.value === form.occasion);
    setForm((f) => ({
      ...f,
      recipientName: name,
      title: obj ? obj.defaultTitle(name || 'You') : f.title
    }));
  }

  function canProceedToReveal(): boolean {
    return form.recipientName.trim().length > 0 && form.title.trim().length > 0;
  }

  async function handleSubmit(): Promise<void> {
    if (!user || !form.occasion || !form.revealAt) return;

    setLoading(true);
    try {
      const revealTimestamp = Timestamp.fromDate(new Date(form.revealAt));

      const { buzzId, shareToken } = await createBuzz({
        title: form.title,
        occasion: form.occasion,
        customOccasion: form.occasion === 'custom' ? form.customOccasion : null,
        boardMode: form.boardMode,
        recipientName: form.recipientName,
        recipientUserId: null,
        revealAt: revealTimestamp,
        coverImageURL: null,
        createdBy: user.id
      });

      // Buzz created — show done state immediately
      const url = `${window.location.origin}/b/${shareToken}`;
      setShareUrl(url);
      setStep('done');
      toast.success('Buzz created!');

      // Secondary ops: fire-and-forget (failures don't block the user)
      const tweetUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        photoURL: user.photoURL,
        verified: user.verified
      };

      sendBuzzTweet(
        { id: buzzId, shareToken, occasion: form.occasion, recipientName: form.recipientName, title: form.title },
        tweetUser
      )
        .then((tweetId) => setBuzzFeedTweetId(buzzId, tweetId))
        .catch(() => undefined);

      awardBuzzKarma(user.id, 10).catch(() => undefined);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('createBuzz failed:', err);
      toast.error('Could not create Buzz — try again');
    } finally {
      setLoading(false);
    }
  }

  function copyLink(): void {
    void navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  }

  const inputCls = cn(
    'w-full rounded-xl border px-4 py-3 text-sm outline-none transition',
    'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400',
    'dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500',
    'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
  );

  const primaryBtn = cn(
    'flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition',
    'bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40'
  );

  const ghostBtn = cn(
    'flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition',
    'border border-gray-200 text-gray-600 hover:bg-gray-50',
    'dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
  );

  return (
    <div className='mx-auto w-full max-w-lg px-4 pb-12 pt-2'>
      {/* Progress bar */}
      {step !== 'done' && (
        <div className='mb-8'>
          <div className='mb-2 flex justify-between text-xs text-gray-400'>
            {STEP_ORDER.filter((s) => s !== 'done').map((s, i) => (
              <span
                key={s}
                className={cn(
                  'font-medium',
                  i <= stepIndex ? 'text-emerald-500' : ''
                )}
              >
                {STEP_LABELS[s]}
              </span>
            ))}
          </div>
          <div className='h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800'>
            <div
              className='h-full rounded-full bg-emerald-500 transition-all duration-300'
              style={{ width: `${((stepIndex) / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Step 0: Occasion ── */}
      {step === 'occasion' && (
        <div>
          <h2 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
            What&apos;s the occasion?
          </h2>
          <p className='mb-6 text-sm text-gray-500'>
            Pick an occasion and we&apos;ll start a Buzz for it.
          </p>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {OCCASIONS.map((occ) => (
              <button
                key={occ.value}
                onClick={() => pickOccasion(occ.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition',
                  'border-gray-100 bg-white hover:border-emerald-400 hover:bg-emerald-50',
                  'dark:border-gray-700 dark:bg-gray-800 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20',
                  form.occasion === occ.value &&
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                )}
              >
                <span className='text-3xl'>{occ.emoji}</span>
                <span className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
                  {occ.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 1: Recipient ── */}
      {step === 'recipient' && (
        <div className='space-y-5'>
          <div>
            <h2 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
              {occasionObj?.emoji} Who&apos;s it for?
            </h2>
            <p className='text-sm text-gray-500'>
              {form.boardMode === 'personal'
                ? 'Enter the recipient\'s name. They\'ll see it on the Buzzbook.'
                : 'Give your group Buzz a name.'}
            </p>
          </div>

          {/* Personal / Group toggle */}
          <div className='flex overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700'>
            {(['personal', 'group'] as BuzzBoardMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setForm((f) => ({ ...f, boardMode: mode }))}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium capitalize transition',
                  form.boardMode === mode
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                {mode === 'personal' ? '👤 Personal' : '👥 Group'}
              </button>
            ))}
          </div>

          {/* Name input */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              {form.boardMode === 'personal' ? 'Recipient name' : 'Group name'}
            </label>
            <input
              type='text'
              className={inputCls}
              placeholder={form.boardMode === 'personal' ? 'e.g. Jane' : 'e.g. The Squad'}
              value={form.recipientName}
              onChange={(e) => handleRecipientChange(e.target.value)}
              maxLength={60}
              autoFocus
            />
          </div>

          {/* Custom occasion label */}
          {form.occasion === 'custom' && (
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                What&apos;s the occasion?
              </label>
              <input
                type='text'
                className={inputCls}
                placeholder='e.g. Farewell, Graduation, Just because'
                value={form.customOccasion}
                onChange={(e) => setForm((f) => ({ ...f, customOccasion: e.target.value }))}
                maxLength={60}
              />
            </div>
          )}

          {/* Title (editable) */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Buzzbook title
            </label>
            <input
              type='text'
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={80}
            />
          </div>

          <div className='flex gap-3 pt-1'>
            <button onClick={() => setStep('occasion')} className={ghostBtn}>
              Back
            </button>
            <button
              onClick={() => setStep('reveal')}
              disabled={!canProceedToReveal()}
              className={primaryBtn}
            >
              Next
              <HeroIcon iconName='ArrowRightIcon' className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Reveal date ── */}
      {step === 'reveal' && (
        <div className='space-y-5'>
          <div>
            <h2 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
              When to reveal?
            </h2>
            <p className='text-sm text-gray-500'>
              The Buzzbook stays hidden until this moment. Pick a date and time.
            </p>
          </div>

          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Reveal date &amp; time
            </label>
            <input
              type='datetime-local'
              className={inputCls}
              min={minRevealDate()}
              value={form.revealAt}
              onChange={(e) => setForm((f) => ({ ...f, revealAt: e.target.value }))}
            />
          </div>

          {form.revealAt && (
            <div className='rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400'>
              📖 The Buzzbook for <strong>{form.recipientName}</strong> will be
              revealed on <strong>{formatRevealDate(form.revealAt)}</strong>.
            </div>
          )}

          <div className='flex gap-3 pt-1'>
            <button onClick={() => setStep('recipient')} className={ghostBtn}>
              Back
            </button>
            <Button
              onClick={handleSubmit}
              disabled={!form.revealAt || loading}
              loading={loading}
              className={primaryBtn}
            >
              {!loading && <HeroIcon iconName='SparklesIcon' className='h-4 w-4' />}
              {loading ? 'Creating…' : 'Start the Buzz'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Done ── */}
      {step === 'done' && (
        <div className='space-y-6 text-center'>
          <div>
            <span className='text-5xl'>🎉</span>
            <h2 className='mt-3 text-2xl font-bold text-gray-900 dark:text-white'>
              Your Buzz is live!
            </h2>
            <p className='mt-1 text-sm text-gray-500'>
              Share the link so friends can add their page before the Buzzbook is revealed.
            </p>
          </div>

          {/* Share URL */}
          <div className='flex overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700'>
            <span className='flex-1 truncate bg-gray-50 px-4 py-3 text-left text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
              {shareUrl}
            </span>
            <button
              onClick={copyLink}
              className='flex shrink-0 items-center gap-1.5 border-l border-gray-200 bg-white px-4 py-3 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-emerald-900/20'
            >
              <HeroIcon iconName='ClipboardDocumentIcon' className='h-4 w-4' />
              Copy
            </button>
          </div>

          {/* WhatsApp */}
          <WhatsappShareButton
            url={shareUrl}
            title={`Add your page to ${form.recipientName}'s Buzz! 📖\n`}
            className='w-full'
          >
            <span className={cn(primaryBtn, 'bg-[#25D366] hover:bg-[#1ebe5d]')}>
              <WhatsappIcon size={20} round />
              Share on WhatsApp
            </span>
          </WhatsappShareButton>

          <button
            onClick={() => void router.push('/buzzes')}
            className={ghostBtn}
          >
            See all my Buzzes
          </button>
        </div>
      )}
    </div>
  );
}
