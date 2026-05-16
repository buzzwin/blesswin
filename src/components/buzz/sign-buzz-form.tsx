import { useState, useRef } from 'react';
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
      // Ensure we have an auth session (anon if needed)
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
        toast.error('You\'ve already added your page to this Buzz!');
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

  if (done) {
    return (
      <div className='space-y-5 text-center'>
        <div>
          <span className='text-5xl'>🎉</span>
          <h3 className='mt-3 text-xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
            Your page is in!
          </h3>
          <p className='mt-1 text-sm text-[#6b5744] dark:text-[#9E8B76]'>
            The Buzzbook for <strong>{buzz.recipientName}</strong> will be
            revealed on{' '}
            {buzz.revealAt.toDate().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
            .
          </p>
        </div>

        <div className='rounded-xl border border-[#e8d8c4] bg-[#faf8f4] p-4 text-sm text-[#6b5744] dark:border-[#2a1d10] dark:bg-[#1c1510] dark:text-[#C4B5A0]'>
          Know someone else who should add their page?
        </div>

        <WhatsappShareButton
          url={shareUrl}
          title={`Add your page to ${buzz.recipientName}'s Buzzbook! 📖\n`}
          className='w-full'
        >
          <span className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-semibold text-white transition hover:bg-[#1ebe5d]'>
            <WhatsappIcon size={20} round />
            Share with others
          </span>
        </WhatsappShareButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      {/* Name */}
      <div>
        <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#C4B5A0]'>
          Your name <span className='text-red-400'>*</span>
        </label>
        <input
          type='text'
          className={inputCls}
          placeholder='How should your page be signed?'
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          autoFocus
          required
        />
      </div>

      {/* Type toggle */}
      <div>
        <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#C4B5A0]'>
          What are you adding?
        </label>
        <div className='flex overflow-hidden rounded-xl border border-gray-200 dark:border-[#2a1d10]'>
          {(['text', 'photo'] as SignType[]).map((t) => (
            <button
              key={t}
              type='button'
              onClick={() => setType(t)}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium transition',
                type === t
                  ? 'bg-[#C97D60] text-white'
                  : 'bg-[#faf8f4] text-[#6b5744] hover:bg-[rgba(201,169,110,0.06)] dark:bg-[#1c1510] dark:text-[#C4B5A0] dark:hover:bg-[#231a10]'
              )}
            >
              {t === 'text' ? '💬 Message' : '📷 Photo / Meme'}
            </button>
          ))}
        </div>
      </div>

      {/* Text input */}
      {type === 'text' && (
        <div>
          <textarea
            className={cn(inputCls, 'min-h-[120px] resize-none')}
            placeholder={`Write something for ${buzz.recipientName}…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            required
          />
          <p className='mt-1 text-right text-xs text-[#9E8B76]'>
            {text.length}/500
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
                'flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition',
                'border-[#e8d8c4] bg-[#faf8f4] text-[#9E8B76] hover:border-[#C9A96E] hover:bg-[rgba(201,169,110,0.06)] hover:text-[#C9A96E]',
                'dark:border-[#2a1d10] dark:bg-[#1c1510] dark:hover:border-[#C9A96E] dark:hover:bg-emerald-900/20'
              )}
            >
              <HeroIcon iconName='PhotoIcon' className='h-8 w-8' />
              <span className='text-sm font-medium'>Tap to pick a photo or meme</span>
              <span className='text-xs'>Up to {MAX_PHOTO_MB} MB</span>
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
          'bg-[#C97D60] text-white hover:bg-[#C97D60] disabled:opacity-40'
        )}
      >
        {!loading && <HeroIcon iconName='PencilSquareIcon' className='h-4 w-4' />}
        {loading ? 'Adding your page…' : 'Add my page'}
      </Button>
    </form>
  );
}
