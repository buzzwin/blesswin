import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { WhatsappShareButton, WhatsappIcon } from 'next-share';
import { toast } from 'react-hot-toast';
import { auth } from '@lib/firebase/app';
import { useAuth } from '@lib/context/auth-context';
import { signBuzz, uploadBuzzMedia, awardBuzzKarma } from '@lib/firebase/utils/buzz';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { GoogleIcon } from '@components/ui/google-icon';
import { LoadingDots } from '@components/ui/loading';
import { cn } from '@lib/utils';
import type { Buzz } from '@lib/types/buzz';

type Props = {
  buzz: Buzz;
  shareUrl: string;
};

type SignType = 'text' | 'photo';

const MAX_PHOTO_MB = 10;

const GROUP_OCCASIONS = new Set([
  'trip', 'movie', 'series', 'gamenight', 'bookclub'
]);

const inputCls = cn(
  'w-full rounded-xl border px-4 py-3 text-sm outline-none transition',
  'border-[#e8d8c4] bg-[#faf8f4] text-[#1a1108] placeholder:text-[#9E8B76]',
  'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white dark:placeholder:text-[#6b5744]',
  'focus:border-[#C9A96E] focus:ring-2 focus:ring-[rgba(201,169,110,0.2)]'
);

// ── Inline auth gate ────────────────────────────────────────────────────────

function AuthGate({ buzz }: { buzz: Buzz }): JSX.Element {
  const { signInWithGoogle, signInWithEmail, createUserWithEmail } = useAuth();
  const [showEmail, setShowEmail] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isGroup = GROUP_OCCASIONS.has(buzz.occasion);

  async function handleGoogle(): Promise<void> {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      toast.error('Google sign-in failed — try again');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmail(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmail(email, password);
        toast.success('Account created!');
      } else {
        await signInWithEmail(email, password);
        toast.success('Signed in!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='space-y-5'>
      {/* Context */}
      <div className='rounded-2xl border border-[rgba(201,169,110,0.25)] bg-[rgba(201,169,110,0.06)] p-4 dark:border-[rgba(201,169,110,0.15)] dark:bg-[rgba(201,169,110,0.05)]'>
        <p className='text-sm font-semibold text-[#7a5510] dark:text-[#C9A96E]'>
          Create a free account to add your page
        </p>
        <p className='mt-0.5 text-xs text-[#6b5744] dark:text-[#9E8B76]'>
          {isGroup
            ? `Your name and photo will appear in the ${buzz.recipientName} Buzzbook when it opens.`
            : `Your page will be part of ${buzz.recipientName}'s Buzzbook — revealed on the day.`}
        </p>
      </div>

      {/* Google */}
      <button
        type='button'
        onClick={() => void handleGoogle()}
        disabled={loading}
        className={cn(
          'flex w-full items-center justify-center gap-2.5 rounded-xl border py-3 text-sm font-semibold transition',
          'border-[#e8d8c4] bg-[#faf8f4] text-[#1a1108] hover:bg-[#f5f1ea]',
          'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-[#F5EFE6] dark:hover:bg-[#231a10]',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        {loading ? <LoadingDots size='sm' /> : (
          <>
            <GoogleIcon className='h-5 w-5' />
            Continue with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-[#e8d8c4] dark:border-[#2a1d10]' />
        </div>
        <div className='relative flex justify-center'>
          <button
            type='button'
            onClick={() => setShowEmail((s) => !s)}
            className='bg-[#faf8f4] px-3 text-xs text-[#9E8B76] transition hover:text-[#C9A96E] dark:bg-[#1c1510]'
          >
            {showEmail ? 'hide email form ↑' : 'or use email ↓'}
          </button>
        </div>
      </div>

      {/* Email form */}
      {showEmail && (
        <form onSubmit={(e) => void handleEmail(e)} className='space-y-3'>
          <input
            type='email'
            placeholder='Email address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            required
            autoComplete='email'
          />
          <input
            type='password'
            placeholder='Password (min 6 characters)'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            required
            minLength={6}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
          <button
            type='submit'
            disabled={loading}
            className='btn-festive w-full justify-center py-3 disabled:opacity-40'
          >
            {loading ? <LoadingDots size='sm' /> : isSignUp ? 'Create account & add page' : 'Sign in & add page'}
          </button>
          <button
            type='button'
            onClick={() => setIsSignUp((s) => !s)}
            className='w-full text-center text-xs text-[#C9A96E] hover:text-[#E8B86D]'
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </form>
      )}

      <p className='text-center text-xs text-[#9E8B76]'>
        Already have an account?{' '}
        <Link href='/login'>
          <a className='font-medium text-[#C9A96E] hover:text-[#E8B86D]'>Sign in here</a>
        </Link>
      </p>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function SignBuzzForm({ buzz, shareUrl }: Props): JSX.Element {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(auth.currentUser === null);

  const [name, setName] = useState('');
  const [type, setType] = useState<SignType>('text');
  const [text, setText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track real Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthLoading(false);
      // Pre-fill name from profile when they just signed in
      if (u && !u.isAnonymous && u.displayName && !name) {
        setName(u.displayName);
      }
    });
    return unsub;
  }, []);

  // Pre-fill name if already signed in on mount
  useEffect(() => {
    if (firebaseUser && !firebaseUser.isAnonymous && firebaseUser.displayName && !name) {
      setName(firebaseUser.displayName);
    }
  }, [firebaseUser]);

  const needsAuth = !authLoading && (!firebaseUser || firebaseUser.isAnonymous);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      toast.error(`Photo must be under ${MAX_PHOTO_MB} MB`);
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhoto(): void {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function canSubmit(): boolean {
    if (!name.trim()) return false;
    if (type === 'text') return text.trim().length > 0;
    return photoFile !== null;
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!canSubmit() || !firebaseUser) return;
    setLoading(true);

    try {
      const uid = firebaseUser.uid;

      let mediaURL: string | null = null;
      if (type === 'photo' && photoFile) {
        mediaURL = await uploadBuzzMedia(buzz.id, uid, photoFile);
      }

      await signBuzz({
        buzzId: buzz.id,
        authorId: uid,
        authorName: name.trim(),
        authorPhotoURL: firebaseUser.photoURL ?? null,
        type,
        text: type === 'text' ? text.trim() : null,
        mediaURL,
        mediaThumbnailURL: null
      });

      await awardBuzzKarma(uid, 5);
      setDone(true);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        toast.error("You've already added your page to this Buzz!");
      } else {
        toast.error('Something went wrong — please try again');
      }
    } finally {
      setLoading(false);
    }
  }

  const isGroup = GROUP_OCCASIONS.has(buzz.occasion);
  const revealDateStr = buzz.revealAt.toDate().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  // ── Done state ──────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className='space-y-5 text-center'>
        <div>
          <span className='text-5xl'>🎉</span>
          <h3 className='mt-3 text-xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
            Your page is in!
          </h3>
          <p className='mt-1 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
            {isGroup
              ? <>The {buzz.recipientName} Buzzbook opens on <strong>{revealDateStr}</strong> — you'll all see it together.</>
              : <>Your page will be revealed with everyone else's on <strong>{revealDateStr}</strong>.</>}
          </p>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={() => void navigator.clipboard.writeText(shareUrl).then(() => toast.success('Link copied!'))}
            className='flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e8d8c4] py-2.5 text-sm font-medium text-[#6b5744] transition hover:border-[#C9A96E] hover:text-[#C9A96E] dark:border-[#2a1d10] dark:text-[#9E8B76]'
          >
            <HeroIcon iconName='LinkIcon' className='h-4 w-4' />
            Copy link
          </button>
          <WhatsappShareButton
            url={shareUrl}
            title={`Add your page to ${isGroup ? 'the' : ''} ${buzz.recipientName}${isGroup ? '' : "'s"} Buzzbook! 📖\n`}
            className='flex-1'
          >
            <span className='flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#25D366]/30 py-2.5 text-sm font-medium text-[#1a9e4e] transition hover:bg-[#25D366]/5 dark:border-[#25D366]/20 dark:text-[#25D366]'>
              <WhatsappIcon size={16} round />
              WhatsApp
            </span>
          </WhatsappShareButton>
        </div>

        <div className='flex flex-col gap-2'>
          <Link href='/home'>
            <a className='flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.06)] px-5 py-2.5 text-sm font-semibold text-[#8a6520] transition hover:bg-[rgba(201,169,110,0.1)] dark:border-[rgba(201,169,110,0.2)] dark:text-[#C9A96E]'>
              Go to home feed
              <HeroIcon iconName='ArrowRightIcon' className='h-4 w-4' />
            </a>
          </Link>
          <Link href='/buzzes/new'>
            <a className='btn-festive w-full justify-center py-2.5 text-sm'>
              Start your own Buzzbook
            </a>
          </Link>
        </div>
      </div>
    );
  }

  // ── Auth loading ────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className='flex justify-center py-8 text-[#9E8B76]'>
        <HeroIcon iconName='ArrowPathIcon' className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  // ── Auth gate ───────────────────────────────────────────────────────────────
  if (needsAuth) {
    return <AuthGate buzz={buzz} />;
  }

  // ── Sign form ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={(e) => void handleSubmit(e)} className='space-y-5'>
      {/* Name — pre-filled from profile, editable */}
      <div>
        <input
          type='text'
          className={inputCls}
          placeholder='Your name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          autoFocus={!name}
          required
        />
        {firebaseUser?.photoURL && (
          <div className='mt-2 flex items-center gap-2 text-xs text-[#9E8B76]'>
            <img
              src={firebaseUser.photoURL}
              alt={name}
              className='h-6 w-6 rounded-full object-cover'
            />
            <span>Posting as {firebaseUser.email}</span>
          </div>
        )}
      </div>

      {/* Type toggle */}
      <div className='grid grid-cols-2 gap-2'>
        {(['text', 'photo'] as SignType[]).map((t) => (
          <button
            key={t}
            type='button'
            onClick={() => setType(t)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition',
              type === t
                ? 'bg-[#C97D60] text-white shadow-sm'
                : 'border border-[#e8d8c4] bg-[#faf8f4] text-[#6b5744] hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.06)] dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-[#C4B5A0] dark:hover:border-[rgba(201,169,110,0.3)]'
            )}
          >
            <span>{t === 'text' ? '💬' : '📷'}</span>
            {t === 'text' ? 'Write a message' : 'Share a photo'}
          </button>
        ))}
      </div>

      {/* Text input */}
      {type === 'text' && (
        <div>
          <textarea
            className={cn(inputCls, 'min-h-[140px] resize-none')}
            placeholder={
              isGroup
                ? `Share a memory, an in-joke, or a highlight from ${buzz.recipientName}…`
                : `Write something for ${buzz.recipientName}… a memory, a wish, or just how you feel`
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            required
          />
          <p className='mt-1 text-right text-xs text-[#9E8B76]'>
            {text.length} / 500
          </p>
        </div>
      )}

      {/* Photo input */}
      {type === 'photo' && (
        <div>
          {photoPreview ? (
            <div className='relative'>
              <img
                src={photoPreview}
                alt='Your photo'
                className='max-h-64 w-full rounded-xl object-cover'
              />
              <button
                type='button'
                onClick={clearPhoto}
                className='absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70'
              >
                <HeroIcon iconName='XMarkIcon' className='h-4 w-4' />
              </button>
            </div>
          ) : (
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition',
                'border-[#e8d8c4] bg-[#faf8f4] text-[#9E8B76]',
                'hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.06)] hover:text-[#C9A96E]',
                'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:hover:border-[rgba(201,169,110,0.4)] dark:hover:bg-[rgba(201,169,110,0.06)]'
              )}
            >
              <HeroIcon iconName='PhotoIcon' className='h-8 w-8' />
              <span className='text-sm font-medium'>Tap to pick a photo</span>
              <span className='text-xs opacity-60'>Up to {MAX_PHOTO_MB} MB · any format</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handlePhotoChange}
          />
        </div>
      )}

      <Button
        type='submit'
        disabled={!canSubmit() || loading}
        loading={loading}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition',
          'bg-[#C97D60] text-white hover:bg-[#B56540] disabled:opacity-40'
        )}
      >
        {!loading && <span>✍️</span>}
        {loading ? 'Adding your page…' : 'Add my page'}
      </Button>
    </form>
  );
}
