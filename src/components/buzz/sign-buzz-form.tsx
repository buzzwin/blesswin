import { useState, useRef } from 'react';
import Link from 'next/link';
import { signInAnonymously } from 'firebase/auth';
import { WhatsappShareButton, WhatsappIcon } from 'next-share';
import { toast } from 'react-hot-toast';
import { auth } from '@lib/firebase/app';
import { signBuzz, uploadBuzzMedia, awardBuzzKarma } from '@lib/firebase/utils/buzz';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
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

export function SignBuzzForm({ buzz, shareUrl }: Props): JSX.Element {
  const [name, setName] = useState('');
  const [type, setType] = useState<SignType>('text');
  const [text, setText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!canSubmit()) return;
    setLoading(true);

    try {
      let uid = auth.currentUser?.uid;
      if (!uid) {
        const { user } = await signInAnonymously(auth);
        uid = user.uid;
      }

      let mediaURL: string | null = null;
      if (type === 'photo' && photoFile) {
        mediaURL = await uploadBuzzMedia(buzz.id, uid, photoFile);
      }

      await signBuzz({
        buzzId: buzz.id,
        authorId: uid,
        authorName: name.trim(),
        authorPhotoURL: auth.currentUser?.photoURL ?? null,
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

  const inputCls = cn(
    'w-full rounded-xl border px-4 py-3 text-sm outline-none transition',
    'border-[#e8d8c4] bg-[#faf8f4] text-[#1a1108] placeholder:text-[#9E8B76]',
    'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-white dark:placeholder:text-[#6b5744]',
    'focus:border-[#C9A96E] focus:ring-2 focus:ring-[rgba(201,169,110,0.2)]'
  );

  const isGroup = GROUP_OCCASIONS.has(buzz.occasion);
  const revealDateStr = buzz.revealAt.toDate().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

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

        <WhatsappShareButton
          url={shareUrl}
          title={`Add your page to ${isGroup ? 'the' : ''} ${buzz.recipientName}${isGroup ? '' : "'s"} Buzzbook! 📖\n`}
          className='w-full'
        >
          <span className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-semibold text-white transition hover:bg-[#1ebe5d]'>
            <WhatsappIcon size={20} round />
            Share with others
          </span>
        </WhatsappShareButton>

        {auth.currentUser && !auth.currentUser.isAnonymous ? (
          /* Logged-in user — give them a way back to the app */
          <div className='flex flex-col gap-2'>
            <Link href='/home'>
              <a className='flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.06)] px-5 py-2.5 text-sm font-semibold text-[#8a6520] transition hover:bg-[rgba(201,169,110,0.1)] dark:border-[rgba(201,169,110,0.2)] dark:bg-[rgba(201,169,110,0.05)] dark:text-[#C9A96E]'>
                Go to home feed
                <HeroIcon iconName='ArrowRightIcon' className='h-4 w-4' />
              </a>
            </Link>
            <Link href='/buzzes/new'>
              <a className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#C97D60] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B56540]'>
                Start your own Buzzbook
                <HeroIcon iconName='ArrowRightIcon' className='h-4 w-4' />
              </a>
            </Link>
          </div>
        ) : (
          /* Anonymous / not signed in — nudge to create account */
          <div className='rounded-2xl border border-[rgba(201,169,110,0.2)] bg-[rgba(201,169,110,0.05)] p-5 dark:border-[rgba(201,169,110,0.15)] dark:bg-[rgba(201,169,110,0.04)]'>
            <p className='text-sm font-semibold text-[#1a1108] dark:text-[#F5EFE6]'>
              Want to create your own Buzzbook?
            </p>
            <p className='mt-1 text-xs text-[#6b5744] dark:text-[#9E8B76]'>
              Trips, movie nights, birthdays — collect everyone&apos;s pages and reveal together.
            </p>
            <Link href='/login'>
              <a className='mt-3 inline-flex items-center gap-2 rounded-xl bg-[#C97D60] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B56540]'>
                Create a free account
                <HeroIcon iconName='ArrowRightIcon' className='h-4 w-4' />
              </a>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      {/* Name — no asterisk, no label */}
      <input
        type='text'
        className={inputCls}
        placeholder='Your name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        autoFocus
        required
      />

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

      {/* Subtle sign-in nudge */}
      <p className='text-center text-xs text-[#9E8B76]'>
        Already have an account?{' '}
        <Link href='/login'>
          <a className='font-medium text-[#C9A96E] hover:text-[#E8B86D]'>Sign in</a>
        </Link>
        {' '}to track your Buzzes
      </p>
    </form>
  );
}
