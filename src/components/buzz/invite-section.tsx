import { useState, useRef, KeyboardEvent } from 'react';
import { toast } from 'react-hot-toast';
import { cn } from '@lib/utils';
import { HeroIcon } from '@components/ui/hero-icon';

type Props = {
  buzzId: string;
  senderUserId: string;
  className?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteSection({ buzzId, senderUserId, className }: Props): JSX.Element {
  const [inputVal, setInputVal] = useState('');
  const [chips, setChips] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function tryAddChip(raw: string): void {
    const email = raw.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      toast.error(`"${email}" isn't a valid email`);
      return;
    }
    if (chips.includes(email)) {
      setInputVal('');
      return;
    }
    setChips((prev) => [...prev, email]);
    setInputVal('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      tryAddChip(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && chips.length > 0) {
      setChips((prev) => prev.slice(0, -1));
    }
  }

  function removeChip(email: string): void {
    setChips((prev) => prev.filter((c) => c !== email));
  }

  async function sendInvites(): Promise<void> {
    const toSend = [...chips];
    const pending = inputVal.trim();
    if (pending && EMAIL_RE.test(pending)) {
      toSend.push(pending.toLowerCase());
      setInputVal('');
    }
    if (toSend.length === 0) {
      toast.error('Add at least one email address');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/buzz-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buzzId, emails: toSend, senderUserId })
      });
      const data = (await res.json()) as { sent?: number; failed?: number; error?: string };
      if (!res.ok || data.error) {
        toast.error(data.error ?? 'Could not send invites');
        return;
      }
      if (data.failed && data.failed > 0) {
        toast.success(`Sent ${data.sent ?? 0} invite${(data.sent ?? 0) !== 1 ? 's' : ''}. ${data.failed} failed.`);
      } else {
        toast.success(`Invite${(data.sent ?? 0) !== 1 ? 's' : ''} sent! 🎉`);
      }
      setChips([]);
    } catch {
      toast.error('Could not send invites — try again');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={cn('rounded-2xl border border-[#e8d8c4] bg-[#faf8f4] p-5 dark:border-[#2a1d10] dark:bg-[#1c1510]', className)}>
      <p className='mb-1 text-sm font-semibold text-[#1a1108] dark:text-[#C4B5A0]'>
        Invite people to add a page
      </p>
      <p className='mb-3 text-xs text-[#9E8B76]'>
        Type an email and press Enter to add — then hit Send.
      </p>

      {/* Chip input */}
      <div
        className={cn(
          'flex min-h-[48px] flex-wrap gap-1.5 rounded-xl border px-3 py-2 transition cursor-text',
          'border-[#e8d8c4] bg-white dark:border-[#2a1d10] dark:bg-[#120e09]',
          'focus-within:border-[#C9A96E] focus-within:ring-2 focus-within:ring-[rgba(201,169,110,0.2)]'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {chips.map((email) => (
          <span
            key={email}
            className='flex items-center gap-1 rounded-full border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.1)] px-2.5 py-0.5 text-xs font-medium text-[#7a5510] dark:border-[rgba(201,169,110,0.2)] dark:bg-[rgba(201,169,110,0.08)] dark:text-[#C9A96E]'
          >
            {email}
            <button
              onClick={(e) => { e.stopPropagation(); removeChip(email); }}
              className='ml-0.5 rounded-full p-0.5 text-[#9E8B76] hover:text-[#C9A96E]'
              aria-label={`Remove ${email}`}
            >
              <HeroIcon iconName='XMarkIcon' className='h-3 w-3' />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type='email'
          className='min-w-[140px] flex-1 bg-transparent text-sm text-[#1a1108] outline-none placeholder:text-[#9E8B76] dark:text-white'
          placeholder={chips.length === 0 ? 'name@example.com, ...' : 'Add another…'}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputVal.includes('@')) tryAddChip(inputVal); }}
          disabled={sending}
        />
      </div>

      <button
        onClick={() => void sendInvites()}
        disabled={sending || (chips.length === 0 && !inputVal.trim())}
        className={cn(
          'btn-festive mt-3 w-full justify-center py-2.5 text-sm disabled:opacity-40',
          sending && 'cursor-not-allowed'
        )}
      >
        {sending ? (
          <>
            <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24' fill='none'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z'/>
            </svg>
            Sending…
          </>
        ) : (
          <>
            <HeroIcon iconName='PaperAirplaneIcon' className='h-4 w-4' />
            Send {chips.length > 0 ? `${chips.length} invite${chips.length !== 1 ? 's' : ''}` : 'invites'}
          </>
        )}
      </button>
    </div>
  );
}
