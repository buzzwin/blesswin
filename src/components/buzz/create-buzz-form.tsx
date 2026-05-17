import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { WhatsappShareButton, WhatsappIcon } from 'next-share';
import { cn } from '@lib/utils';
import { useAuth } from '@lib/context/auth-context';
import { createBuzz, signBuzz, uploadBuzzMedia, sendBuzzTweet, setBuzzFeedTweetId, awardBuzzKarma } from '@lib/firebase/utils/buzz';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { InviteSection } from '@components/buzz/invite-section';
import type { BuzzOccasion, BuzzBoardMode } from '@lib/types/buzz';
import { Timestamp } from 'firebase/firestore';

type Step = 'occasion' | 'recipient' | 'reveal' | 'titlepage' | 'done';
type TitleType = 'text' | 'photo';

type OccasionOption = {
  value: BuzzOccasion;
  label: string;
  emoji: string;
  defaultTitle: (name: string) => string;
};

// Occasions where recipientName is an experience/place name, not a person
const GROUP_OCCASIONS = new Set<BuzzOccasion>(['trip', 'movie', 'series', 'gamenight', 'bookclub']);

const OCCASIONS: OccasionOption[] = [
  { value: 'birthday',   label: 'Birthday',    emoji: '🎂', defaultTitle: (n) => `Happy Birthday ${n}!` },
  { value: 'trip',       label: 'Group Trip',  emoji: '✈️', defaultTitle: (n) => `${n} Buzzbook` },
  { value: 'movie',      label: 'Movie Night', emoji: '🎬', defaultTitle: (n) => `${n} Movie Night` },
  { value: 'series',     label: 'TV Series',   emoji: '📺', defaultTitle: (n) => `Watching ${n} Together` },
  { value: 'gamenight',  label: 'Game Night',  emoji: '🎮', defaultTitle: (n) => `${n} Game Night` },
  { value: 'bookclub',   label: 'Book Club',   emoji: '📚', defaultTitle: (n) => `${n} — Book Club` },
  { value: 'anniversary', label: 'Anniversary', emoji: '💍', defaultTitle: (n) => `Happy Anniversary ${n}!` },
  { value: 'graduation',  label: 'Graduation',  emoji: '🎓', defaultTitle: (n) => `Congratulations ${n}!` },
  { value: 'custom',      label: 'Custom',      emoji: '✨', defaultTitle: (n) => `A Buzz for ${n}` }
];

const OCCASION_COLOR: Partial<Record<BuzzOccasion, string>> = {
  birthday: '#FFB300', trip: '#FF8A3D', movie: '#9B6FD9',
  series: '#6C7CFF', gamenight: '#2FB888', bookclub: '#C9A96E',
  anniversary: '#E5407A', graduation: '#34D399', custom: '#FFB300'
};

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

const OCCASION_STEP2_LABEL: Partial<Record<BuzzOccasion, string>> = {
  trip: 'Where', movie: 'What', series: 'What', gamenight: 'What', bookclub: 'What'
};

const STEP2_HEADING: Partial<Record<BuzzOccasion, string>> = {
  trip:      "What's the trip?",
  movie:     'What are you watching?',
  series:    'What series?',
  gamenight: 'What are you playing?',
  bookclub:  'What are you reading?'
};

const STEP2_DESCRIPTION: Partial<Record<BuzzOccasion, string>> = {
  trip:      'Give the trip a name. Share the link and everyone adds their photos.',
  movie:     'Share the link before movie night — everyone adds their reactions.',
  series:    'Share the link and each person adds their thoughts as you watch.',
  gamenight: 'Name your game night and share the link with the crew.',
  bookclub:  'Share the link and everyone adds their notes and highlights.'
};

const NAME_LABEL: Partial<Record<BuzzOccasion, string>> = {
  trip: 'Trip name', movie: 'Movie name', series: 'Series name',
  gamenight: 'Game night name', bookclub: 'Book name'
};

const NAME_PLACEHOLDER: Partial<Record<BuzzOccasion, string>> = {
  trip:      'e.g. Goa 2025, Thailand Trip, Alps Hike',
  movie:     'e.g. Inception, Interstellar, Avengers',
  series:    'e.g. Breaking Bad, The Bear, Severance',
  gamenight: 'e.g. Friday Night Catan, Poker Night',
  bookclub:  'e.g. Atomic Habits, Dune'
};

const DONE_EMOJI: Partial<Record<BuzzOccasion, string>> = {
  trip: '✈️', movie: '🎬', series: '📺', gamenight: '🎮', bookclub: '📚'
};

const DONE_HEADING: Partial<Record<BuzzOccasion, string>> = {
  trip:      'Your Trip Buzzbook is live!',
  movie:     'Your Movie Night Buzzbook is live!',
  series:    'Your Series Buzzbook is live!',
  gamenight: 'Your Game Night Buzzbook is live!',
  bookclub:  'Your Book Club Buzzbook is live!'
};

const DONE_DESC: Partial<Record<BuzzOccasion, string>> = {
  trip:      'Share the link with everyone going on the trip. They add their photos, you all see them together when it opens.',
  movie:     'Share the link before the movie — everyone adds their reactions after.',
  series:    'Share the link with your watch crew — everyone adds their thoughts.',
  gamenight: 'Share the link with your crew — everyone adds their page.',
  bookclub:  'Share the link with your readers — everyone adds their notes and highlights.'
};

function stepLabels(occasion: BuzzOccasion | null): Partial<Record<Step, string>> {
  return {
    occasion: 'Occasion',
    recipient: (occasion && OCCASION_STEP2_LABEL[occasion]) ?? 'Who',
    reveal: 'When'
  };
}

const STEP_ORDER: Step[] = ['occasion', 'recipient', 'reveal', 'titlepage', 'done'];
const PROGRESS_STEPS: Step[] = ['occasion', 'recipient', 'reveal'];

type FormState = {
  occasion: BuzzOccasion | null;
  customOccasion: string;
  boardMode: BuzzBoardMode;
  recipientName: string;
  title: string;
  titleCustomized: boolean;
  revealAt: string;
  isPublic: boolean;
};

const INITIAL: FormState = {
  occasion: null,
  customOccasion: '',
  boardMode: 'personal',
  recipientName: '',
  title: '',
  titleCustomized: false,
  revealAt: '',
  isPublic: true
};

export function CreateBuzzForm(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('occasion');
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [createdBuzzId, setCreatedBuzzId] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Title page step
  const [titleType, setTitleType] = useState<TitleType>('text');
  const [titleText, setTitleText] = useState('');
  const [titlePhoto, setTitlePhoto] = useState<File | null>(null);
  const [titlePhotoPreview, setTitlePhotoPreview] = useState<string | null>(null);
  const [titlePageLoading, setTitlePageLoading] = useState(false);
  const [aiMsgLoading, setAiMsgLoading] = useState(false);
  const titleFileRef = useRef<HTMLInputElement>(null);

  const occasionObj = OCCASIONS.find((o) => o.value === form.occasion);
  const stepIndex = STEP_ORDER.indexOf(step);

  const isGroupOccasion = (occ: BuzzOccasion | null): boolean =>
    occ !== null && GROUP_OCCASIONS.has(occ);

  function pickOccasion(occ: BuzzOccasion): void {
    const obj = OCCASIONS.find((o) => o.value === occ) ?? OCCASIONS[0];
    const fallback = GROUP_OCCASIONS.has(occ) ? '' : 'You';
    setForm((f) => ({
      ...f,
      occasion: occ,
      boardMode: GROUP_OCCASIONS.has(occ) ? 'group' : f.boardMode,
      title: obj.defaultTitle(f.recipientName || fallback),
      titleCustomized: false
    }));
    setStep('recipient');
  }

  function handleRecipientChange(name: string): void {
    const obj = OCCASIONS.find((o) => o.value === form.occasion);
    setForm((f) => ({
      ...f,
      recipientName: name,
      // Only recompute title if the user hasn't customized it (AI or manual edit)
      title: !f.titleCustomized && obj ? obj.defaultTitle(name || 'You') : f.title
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
        createdBy: user.id,
        isPublic: form.isPublic
      });

      // Buzz created — show done state immediately
      const url = `${window.location.origin}/b/${shareToken}`;
      setShareUrl(url);
      setCreatedBuzzId(buzzId);
      setStep('titlepage');
      toast.success('Buzz created!');

      // Secondary ops: fire-and-forget (failures don't block the user)
      if (form.isPublic) {
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
      }

      awardBuzzKarma(user.id, 10).catch(() => undefined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('createBuzz failed:', err);
      toast.error(`Could not create Buzz — ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  function copyLink(): void {
    void navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  }

  async function handleAiParse(): Promise<void> {
    const trimmed = aiInput.trim();
    if (!trimmed || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/buzz-ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: trimmed })
      });
      if (!res.ok) throw new Error('AI parse failed');
      const data = (await res.json()) as { occasion: BuzzOccasion; recipientName: string; title: string };
      const obj = OCCASIONS.find((o) => o.value === data.occasion) ?? OCCASIONS[0];
      setForm((f) => ({
        ...f,
        occasion: data.occasion,
        boardMode: GROUP_OCCASIONS.has(data.occasion) ? 'group' : f.boardMode,
        recipientName: data.recipientName || f.recipientName,
        title: data.title || obj.defaultTitle(data.recipientName || 'You'),
        titleCustomized: !!data.title
      }));
      setStep('recipient');
    } catch {
      toast.error('Couldn\'t parse that — pick an occasion below');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleGenerateMessage(): Promise<void> {
    if (aiMsgLoading || !form.occasion) return;
    setAiMsgLoading(true);
    try {
      const res = await fetch('/api/buzz-title-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: form.occasion,
          recipientName: form.recipientName,
          title: form.title,
          creatorName: user?.name
        })
      });
      if (!res.ok) throw new Error('generation failed');
      const { message } = (await res.json()) as { message: string };
      setTitleText(message);
      setTitleType('text');
    } catch {
      toast.error('Couldn\'t generate a message — try writing your own!');
    } finally {
      setAiMsgLoading(false);
    }
  }

  async function handleAddTitlePage(skip: boolean): Promise<void> {
    if (!skip && !user) return;
    setTitlePageLoading(true);
    try {
      if (!skip && user && createdBuzzId) {
        const canSubmitText = titleType === 'text' && titleText.trim().length > 0;
        const canSubmitPhoto = titleType === 'photo' && titlePhoto !== null;
        if (canSubmitText || canSubmitPhoto) {
          let mediaURL: string | null = null;
          if (titleType === 'photo' && titlePhoto) {
            mediaURL = await uploadBuzzMedia(createdBuzzId, user.id, titlePhoto);
          }
          await signBuzz({
            buzzId: createdBuzzId,
            authorId: user.id,
            authorName: user.name,
            authorPhotoURL: user.photoURL ?? null,
            type: titleType,
            text: titleType === 'text' ? titleText.trim() : null,
            mediaURL,
            mediaThumbnailURL: null
          });
          toast.success('Title page added! 🎉');
        }
      }
      setStep('done');
    } catch {
      toast.error('Couldn\'t add your page — try again');
    } finally {
      setTitlePageLoading(false);
    }
  }

  function handleTitlePhotoChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Photo must be under 10 MB'); return; }
    setTitlePhoto(file);
    setTitlePhotoPreview(URL.createObjectURL(file));
  }

  const inputCls = cn(
    'w-full rounded-xl border px-4 py-3 text-sm outline-none transition',
    'border-[#e8d8c4] bg-[#faf8f4] text-[#1a1108] placeholder:text-[#9E8B76]',
    'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white dark:placeholder:text-[#6b5744]',
    'focus:border-[#C9A96E] focus:ring-2 focus:ring-[rgba(201,169,110,0.2)]'
  );

  const primaryBtn = 'btn-festive w-full justify-center py-3 disabled:opacity-40';

  const ghostBtn = cn(
    'flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition',
    'border border-[#e8d8c4] text-[#6b5744] hover:bg-[rgba(201,169,110,0.06)]',
    'dark:border-[#2a1d10] dark:text-[#C4B5A0] dark:hover:bg-[#231a10]'
  );

  return (
    <div className='mx-auto w-full max-w-lg px-4 pb-12 pt-2'>
      {/* Progress bar — shown for the first 3 steps + titlepage */}
      {step !== 'done' && (
        <div className='mb-8'>
          {step !== 'titlepage' && (
            <div className='mb-2 flex justify-between text-xs text-[#9E8B76]'>
              {PROGRESS_STEPS.map((s, i) => (
                <span
                  key={s}
                  className={cn('font-medium', i <= stepIndex ? 'text-[#C9A96E]' : '')}
                >
                  {stepLabels(form.occasion)[s]}
                </span>
              ))}
            </div>
          )}
          <div className='h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-[#1c1510]'>
            <div
              className='h-full rounded-full transition-all duration-300'
              style={{
                width: `${(Math.min(stepIndex, PROGRESS_STEPS.length) / PROGRESS_STEPS.length) * 100}%`,
                background: 'var(--bw-grad-festival-cta)'
              }}
            />
          </div>
        </div>
      )}

      {/* ── Step 0: Occasion ── */}
      {step === 'occasion' && (
        <div>
          <h2 className='mb-1 text-2xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
            What are you doing together?
          </h2>
          <p className='mb-4 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
            Pick the vibe and we&apos;ll set up a Buzzbook for it.
          </p>

          {/* AI description input */}
          <div className='mb-6'>
            <div className='flex gap-2'>
              <input
                type='text'
                className={cn(
                  'flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition',
                  'border-[#e8d8c4] bg-[#faf8f4] text-[#1a1108] placeholder:text-[#9E8B76]',
                  'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white dark:placeholder:text-[#6b5744]',
                  'focus:border-[#C9A96E] focus:ring-2 focus:ring-[rgba(201,169,110,0.2)]'
                )}
                placeholder='e.g. birthday party for my mum who turns 60…'
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleAiParse(); }}
                disabled={aiLoading}
              />
              <button
                onClick={() => void handleAiParse()}
                disabled={aiLoading || !aiInput.trim()}
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition',
                  'border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.08)] text-[#C9A96E]',
                  'hover:border-[rgba(201,169,110,0.5)] hover:bg-[rgba(201,169,110,0.15)]',
                  'dark:border-[rgba(201,169,110,0.2)] dark:bg-[rgba(201,169,110,0.06)]',
                  'disabled:cursor-not-allowed disabled:opacity-40'
                )}
                aria-label='Auto-fill with AI'
              >
                {aiLoading
                  ? <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24' fill='none'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z'/></svg>
                  : <span className='text-lg'>✨</span>
                }
              </button>
            </div>
            <p className='mt-1.5 text-xs text-[#9E8B76]'>
              Describe it and AI will fill in the details — or just pick below
            </p>
          </div>

          <div className='grid grid-cols-3 gap-2.5'>
            {OCCASIONS.map((occ) => {
              const sel = form.occasion === occ.value;
              const color = OCCASION_COLOR[occ.value] ?? '#C9A96E';
              return (
                <button
                  key={occ.value}
                  onClick={() => pickOccasion(occ.value)}
                  className='flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all active:scale-95'
                  style={{
                    borderColor: sel ? color : 'rgba(201,169,110,0.2)',
                    background: sel
                      ? `${color}22`
                      : 'rgba(201,169,110,0.04)',
                    boxShadow: sel ? `0 0 20px ${color}44` : 'none',
                    transform: sel ? 'translateY(-1px)' : 'none'
                  }}
                >
                  <span className='text-3xl'>{occ.emoji}</span>
                  <span className='text-xs font-bold text-[#1a1108] dark:text-[#C4B5A0]'>
                    {occ.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 1: Recipient / Trip ── */}
      {step === 'recipient' && (
        <div className='space-y-5'>
          <div>
            <h2 className='mb-1 text-2xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
              {isGroupOccasion(form.occasion)
                ? `${occasionObj?.emoji} ${STEP2_HEADING[form.occasion!] ?? 'What\'s it called?'}`
                : `${occasionObj?.emoji} Who's it for?`}
            </h2>
            <p className='text-sm text-[#6b5744] dark:text-[#9E8B76]'>
              {isGroupOccasion(form.occasion)
                ? STEP2_DESCRIPTION[form.occasion!] ?? 'Give it a name and share the link with your group.'
                : form.boardMode === 'personal'
                  ? 'Enter the recipient\'s name. They\'ll see it on the Buzzbook.'
                  : 'Give your group Buzz a name.'}
            </p>
          </div>

          {/* Personal / Group toggle — hidden for group occasions (always group) */}
          {!isGroupOccasion(form.occasion) && (
            <div className='flex overflow-hidden rounded-xl border border-[#e8d8c4] dark:border-[#2a1d10]'>
              {(['personal', 'group'] as BuzzBoardMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setForm((f) => ({ ...f, boardMode: mode }))}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-medium capitalize transition',
                    form.boardMode === mode
                      ? 'bg-[#C97D60] text-white'
                      : 'bg-[#faf8f4] text-[#6b5744] hover:bg-[rgba(201,169,110,0.06)] dark:bg-[#1c1510] dark:text-[#C4B5A0] dark:hover:bg-[#231a10]'
                  )}
                >
                  {mode === 'personal' ? '👤 Personal' : '👥 Group'}
                </button>
              ))}
            </div>
          )}

          {/* Name input */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-[#3d2c1a] dark:text-[#C4B5A0]'>
              {(form.occasion && NAME_LABEL[form.occasion])
                ?? (form.boardMode === 'personal' ? 'Recipient name' : 'Group name')}
            </label>
            <input
              type='text'
              className={inputCls}
              placeholder={
                (form.occasion && NAME_PLACEHOLDER[form.occasion])
                  ?? (form.boardMode === 'personal' ? 'e.g. Jane' : 'e.g. The Squad')
              }
              value={form.recipientName}
              onChange={(e) => handleRecipientChange(e.target.value)}
              maxLength={60}
              autoFocus
            />
          </div>

          {/* Custom occasion label */}
          {form.occasion === 'custom' && (
            <div>
              <label className='mb-1.5 block text-sm font-medium text-[#3d2c1a] dark:text-[#C4B5A0]'>
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
            <label className='mb-1.5 block text-sm font-medium text-[#3d2c1a] dark:text-[#C4B5A0]'>
              Buzzbook title
            </label>
            <input
              type='text'
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, titleCustomized: true }))}
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
            <h2 className='mb-1 text-2xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
              {isGroupOccasion(form.occasion) ? 'When should it open?' : 'When to reveal?'}
            </h2>
            <p className='text-sm text-[#6b5744] dark:text-[#9E8B76]'>
              {form.occasion === 'trip'
                ? "Pick the date you want the Buzzbook to open — usually the last day of the trip or after you're back."
                : isGroupOccasion(form.occasion)
                ? 'Pick when the group sees the Buzzbook. Share the link so everyone adds their page before then.'
                : 'The Buzzbook stays hidden until this moment. Pick a date and time.'}
            </p>
          </div>

          <div>
            <label className='mb-1.5 block text-sm font-medium text-[#3d2c1a] dark:text-[#C4B5A0]'>
              {isGroupOccasion(form.occasion) ? 'Open on' : 'Reveal date & time'}
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
            <div className='rounded-xl border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.06)] p-4 text-sm text-[#7a5510] dark:border-[rgba(201,169,110,0.25)] dark:bg-[rgba(201,169,110,0.08)] dark:text-[#C9A96E]'>
              {isGroupOccasion(form.occasion)
                ? <>{occasionObj?.emoji} The <strong>{form.recipientName}</strong> Buzzbook opens on <strong>{formatRevealDate(form.revealAt)}</strong>. Share the link so everyone adds their page before then.</>
                : <>📖 The Buzzbook for <strong>{form.recipientName}</strong> will be revealed on <strong>{formatRevealDate(form.revealAt)}</strong>.</>}
            </div>
          )}

          {/* Public / private toggle */}
          <button
            type='button'
            role='switch'
            aria-checked={form.isPublic}
            onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition',
              'border-[#e8d8c4] bg-[#faf8f4] hover:bg-[rgba(201,169,110,0.04)]',
              'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:hover:bg-[rgba(201,169,110,0.04)]'
            )}
          >
            <div>
              <p className='text-sm font-medium text-[#1a1108] dark:text-[#F5EFE6]'>
                {form.isPublic ? '🌍 Share in community feed' : '🔒 Keep private'}
              </p>
              <p className='text-xs text-[#9E8B76]'>
                {form.isPublic
                  ? 'Visible to the Buzzwin community'
                  : 'Only people with the link can access it'}
              </p>
            </div>
            <span
              className={cn(
                'relative ml-4 h-6 w-11 shrink-0 rounded-full transition-colors',
                form.isPublic ? 'bg-[#C97D60]' : 'bg-[#e8d8c4] dark:bg-[#2a1d10]'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  form.isPublic ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </span>
          </button>

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

      {/* ── Step 3: Title Page ── */}
      {step === 'titlepage' && (
        <div className='space-y-5'>
          <div>
            <h2 className='mb-1 text-2xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
              Add the first page ✨
            </h2>
            <p className='text-sm text-[#6b5744] dark:text-[#9E8B76]'>
              Your page kicks it off — write a welcome message, add a photo, or let AI write one for you.
            </p>
          </div>

          {/* AI generate button */}
          <button
            type='button'
            onClick={() => void handleGenerateMessage()}
            disabled={aiMsgLoading}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition',
              'border-[rgba(201,169,110,0.35)] bg-[rgba(201,169,110,0.07)] text-[#8a6520]',
              'hover:border-[rgba(201,169,110,0.55)] hover:bg-[rgba(201,169,110,0.12)]',
              'dark:border-[rgba(201,169,110,0.25)] dark:bg-[rgba(201,169,110,0.06)] dark:text-[#C9A96E]',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {aiMsgLoading ? (
              <>
                <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24' fill='none'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z'/>
                </svg>
                Generating…
              </>
            ) : (
              <>✨ Write opening message with AI</>
            )}
          </button>

          {/* Type toggle */}
          <div className='grid grid-cols-2 gap-2'>
            {(['text', 'photo'] as TitleType[]).map((t) => (
              <button
                key={t}
                type='button'
                onClick={() => setTitleType(t)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition',
                  titleType === t
                    ? 'bg-[#C97D60] text-white shadow-sm'
                    : 'border border-[#e8d8c4] bg-[#faf8f4] text-[#6b5744] hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.06)] dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-[#C4B5A0]'
                )}
              >
                <span>{t === 'text' ? '💬' : '📷'}</span>
                {t === 'text' ? 'Write a message' : 'Add a photo'}
              </button>
            ))}
          </div>

          {/* Text input */}
          {titleType === 'text' && (
            <div>
              <textarea
                className={cn(inputCls, 'min-h-[140px] resize-none')}
                placeholder={
                  isGroupOccasion(form.occasion)
                    ? `Welcome to the ${form.recipientName} Buzzbook! Set the scene…`
                    : `Write a welcome message for ${form.recipientName}'s Buzzbook…`
                }
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                maxLength={500}
                autoFocus={!aiMsgLoading}
              />
              <p className='mt-1 text-right text-xs text-[#9E8B76]'>{titleText.length} / 500</p>
            </div>
          )}

          {/* Photo input */}
          {titleType === 'photo' && (
            <div>
              {titlePhotoPreview ? (
                <div className='relative'>
                  <img src={titlePhotoPreview} alt='Title photo' className='max-h-64 w-full rounded-xl object-cover' />
                  <button
                    type='button'
                    onClick={() => { setTitlePhoto(null); setTitlePhotoPreview(null); if (titleFileRef.current) titleFileRef.current.value = ''; }}
                    className='absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70'
                  >
                    <HeroIcon iconName='XMarkIcon' className='h-4 w-4' />
                  </button>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={() => titleFileRef.current?.click()}
                  className={cn(
                    'flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition',
                    'border-[#e8d8c4] bg-[#faf8f4] text-[#9E8B76]',
                    'hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.06)] hover:text-[#C9A96E]',
                    'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:hover:border-[rgba(201,169,110,0.4)]'
                  )}
                >
                  <HeroIcon iconName='PhotoIcon' className='h-8 w-8' />
                  <span className='text-sm font-medium'>Tap to pick a photo</span>
                  <span className='text-xs opacity-60'>Up to 10 MB</span>
                </button>
              )}
              <input ref={titleFileRef} type='file' accept='image/*' className='hidden' onChange={handleTitlePhotoChange} />
            </div>
          )}

          {/* Actions */}
          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={() => void handleAddTitlePage(true)}
              className={ghostBtn}
            >
              Skip for now
            </button>
            <Button
              type='button'
              onClick={() => void handleAddTitlePage(false)}
              disabled={
                titlePageLoading ||
                (titleType === 'text' && !titleText.trim()) ||
                (titleType === 'photo' && !titlePhoto)
              }
              loading={titlePageLoading}
              className={primaryBtn}
            >
              {!titlePageLoading && <span>✍️</span>}
              {titlePageLoading ? 'Adding…' : 'Add my page'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Done ── */}
      {step === 'done' && (
        <div className='space-y-6 text-center'>
          <div>
            <span className='text-5xl'>{(form.occasion && DONE_EMOJI[form.occasion]) ?? '🎉'}</span>
            <h2 className='mt-3 text-2xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
              {(form.occasion && DONE_HEADING[form.occasion]) ?? 'Your Buzz is live!'}
            </h2>
            <p className='mt-1 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
              {(form.occasion && DONE_DESC[form.occasion]) ?? 'Share the link so friends can add their page before the Buzzbook is revealed.'}
            </p>
          </div>

          {/* Share URL */}
          <div className='flex overflow-hidden rounded-xl border border-gray-200 dark:border-[#2a1d10]'>
            <span className='flex-1 truncate bg-gray-50 px-4 py-3 text-left text-sm text-gray-600 dark:bg-[#1c1510] dark:text-[#C4B5A0]'>
              {shareUrl}
            </span>
            <button
              onClick={copyLink}
              className='flex shrink-0 items-center gap-1.5 border-l border-[#e8d8c4] bg-[#faf8f4] px-4 py-3 text-sm font-medium text-[#8a6520] transition hover:bg-[rgba(201,169,110,0.06)] dark:border-[#2a1d10] dark:bg-[#1c1510] dark:hover:bg-[rgba(201,169,110,0.08)]'
            >
              <HeroIcon iconName='ClipboardDocumentIcon' className='h-4 w-4' />
              Copy
            </button>
          </div>

          {/* Share actions */}
          <div className='flex gap-2'>
            <button onClick={copyLink} className={cn(ghostBtn, 'flex-1')}>
              <HeroIcon iconName='LinkIcon' className='h-4 w-4' />
              Copy link
            </button>
            <WhatsappShareButton
              url={shareUrl}
              title={
                isGroupOccasion(form.occasion)
                  ? `Add your page to the ${form.recipientName} Buzzbook! ${occasionObj?.emoji ?? ''}📖\n`
                  : `Add your page to ${form.recipientName}'s Buzz! 📖\n`
              }
              className='flex-1'
            >
              <span className='flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#25D366]/30 py-3 text-sm font-medium text-[#1a9e4e] transition hover:bg-[#25D366]/5 dark:border-[#25D366]/20 dark:text-[#25D366]'>
                <WhatsappIcon size={16} round />
                WhatsApp
              </span>
            </WhatsappShareButton>
          </div>

          {createdBuzzId && user?.id && (
            <InviteSection
              buzzId={createdBuzzId}
              senderUserId={user.id}
            />
          )}

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
