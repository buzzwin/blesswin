import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { toast } from 'react-hot-toast';
import {
  query,
  orderBy,
  startAt,
  endAt,
  limit,
  getDocs
} from 'firebase/firestore';
import { usersCollection } from '@lib/firebase/collections';
import { cn } from '@lib/utils';
import { HeroIcon } from '@components/ui/hero-icon';
import type { User } from '@lib/types/user';

type UserChip = { kind: 'user'; id: string; name: string; username: string; photoURL: string };
type EmailChip = { kind: 'email'; email: string };
type Chip = UserChip | EmailChip;

type Props = {
  buzzId: string;
  senderUserId: string;
  className?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Avatar({ chip }: { chip: Chip }): JSX.Element {
  if (chip.kind === 'user' && chip.photoURL) {
    return <img src={chip.photoURL} alt={chip.name} className='h-5 w-5 rounded-full object-cover' />;
  }
  if (chip.kind === 'user') {
    const initials = chip.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    return (
      <span className='flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(201,169,110,0.2)] text-[9px] font-bold text-[#8a6520]'>
        {initials}
      </span>
    );
  }
  return <span className='text-sm'>✉️</span>;
}

export function InviteSection({ buzzId, senderUserId, className }: Props): JSX.Element {
  const [inputVal, setInputVal] = useState('');
  const [chips, setChips] = useState<Chip[]>([]);
  const [results, setResults] = useState<User[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced user search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);

    const term = inputVal.trim().toLowerCase();
    if (term.length < 2) {
      setResults([]);
      setDropdownOpen(false);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const usernameQ = query(
          usersCollection,
          orderBy('username'),
          startAt(term),
          endAt(term + ''),
          limit(5)
        );
        const nameQ = query(
          usersCollection,
          orderBy('name'),
          startAt(term.charAt(0).toUpperCase() + term.slice(1)),
          endAt(term.charAt(0).toUpperCase() + term.slice(1) + ''),
          limit(5)
        );
        const [usernameSnap, nameSnap] = await Promise.all([getDocs(usernameQ), getDocs(nameQ)]);
        const seen = new Set<string>();
        const merged: User[] = [];
        for (const snap of [usernameSnap, nameSnap]) {
          for (const d of snap.docs) {
            if (!seen.has(d.id) && d.id !== senderUserId) {
              seen.add(d.id);
              merged.push(d.data());
            }
          }
        }
        // Filter out users already chipped
        const chippedUserIds = new Set(chips.filter((c) => c.kind === 'user').map((c) => (c as UserChip).id));
        setResults(merged.filter((u) => !chippedUserIds.has(u.id)).slice(0, 6));
        setDropdownOpen(true);
        setActiveIdx(-1);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
  }, [inputVal]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent): void {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function addUserChip(user: User): void {
    if (chips.some((c) => c.kind === 'user' && (c as UserChip).id === user.id)) return;
    setChips((prev) => [...prev, { kind: 'user', id: user.id, name: user.name, username: user.username, photoURL: user.photoURL }]);
    setInputVal('');
    setResults([]);
    setDropdownOpen(false);
    inputRef.current?.focus();
  }

  function tryAddEmailChip(raw: string): void {
    const email = raw.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL_RE.test(email)) { toast.error(`"${raw.trim()}" isn't a valid email`); return; }
    if (chips.some((c) => c.kind === 'email' && (c as EmailChip).email === email)) { setInputVal(''); return; }
    setChips((prev) => [...prev, { kind: 'email', email }]);
    setInputVal('');
    setDropdownOpen(false);
    inputRef.current?.focus();
  }

  function removeChip(idx: number): void {
    setChips((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (dropdownOpen && results.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); return; }
      if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); addUserChip(results[activeIdx]); return; }
    }
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (EMAIL_RE.test(inputVal.trim())) tryAddEmailChip(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && chips.length > 0) {
      setChips((prev) => prev.slice(0, -1));
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  }

  async function sendInvites(): Promise<void> {
    const allChips = [...chips];
    if (EMAIL_RE.test(inputVal.trim())) {
      allChips.push({ kind: 'email', email: inputVal.trim().toLowerCase() });
      setInputVal('');
    }
    if (allChips.length === 0) { toast.error('Add at least one person to invite'); return; }

    const emails = allChips.filter((c): c is EmailChip => c.kind === 'email').map((c) => c.email);
    const userIds = allChips.filter((c): c is UserChip => c.kind === 'user').map((c) => c.id);

    setSending(true);
    try {
      const res = await fetch('/api/buzz-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buzzId, emails, userIds, senderUserId })
      });
      const data = (await res.json()) as { sent?: number; failed?: number; usersAdded?: number; error?: string };
      if (!res.ok || data.error) { toast.error(data.error ?? 'Could not send invites'); return; }

      const parts: string[] = [];
      if ((data.usersAdded ?? 0) > 0) parts.push(`${data.usersAdded} added to Buzzbook`);
      if ((data.sent ?? 0) > 0) parts.push(`${data.sent} email${(data.sent ?? 0) !== 1 ? 's' : ''} sent`);
      if ((data.failed ?? 0) > 0) parts.push(`${data.failed} failed`);
      toast.success(parts.join(' · ') || 'Invites sent! 🎉');
      setChips([]);
    } catch {
      toast.error('Could not send invites — try again');
    } finally {
      setSending(false);
    }
  }

  const showEmailOption = EMAIL_RE.test(inputVal.trim()) && !chips.some((c) => c.kind === 'email' && (c as EmailChip).email === inputVal.trim().toLowerCase());
  const hasItems = chips.length > 0 || EMAIL_RE.test(inputVal.trim());

  return (
    <div className={cn('rounded-2xl border border-[#e8d8c4] bg-[#faf8f4] p-5 dark:border-[#2a1d10] dark:bg-[#1c1510]', className)}>
      <p className='mb-1 text-sm font-semibold text-[#1a1108] dark:text-[#C4B5A0]'>
        Invite people to add a page
      </p>
      <p className='mb-3 text-xs text-[#9E8B76]'>
        Search by name or @username, or type an email address.
      </p>

      {/* Chip input area */}
      <div
        className={cn(
          'relative flex min-h-[48px] flex-wrap gap-1.5 rounded-xl border px-3 py-2 transition cursor-text',
          'border-[#e8d8c4] bg-white dark:border-[#2a1d10] dark:bg-[#120e09]',
          'focus-within:border-[#C9A96E] focus-within:ring-2 focus-within:ring-[rgba(201,169,110,0.2)]'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Chips */}
        {chips.map((chip, idx) => (
          <span
            key={idx}
            className='flex items-center gap-1.5 rounded-full border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.1)] py-0.5 pl-1.5 pr-1 text-xs font-medium text-[#7a5510] dark:border-[rgba(201,169,110,0.2)] dark:bg-[rgba(201,169,110,0.08)] dark:text-[#C9A96E]'
          >
            <Avatar chip={chip} />
            <span>{chip.kind === 'user' ? chip.name : chip.email}</span>
            {chip.kind === 'user' && (
              <span className='text-[#9E8B76]'>@{chip.username}</span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); removeChip(idx); }}
              className='ml-0.5 rounded-full p-0.5 text-[#9E8B76] hover:text-[#C9A96E]'
            >
              <HeroIcon iconName='XMarkIcon' className='h-3 w-3' />
            </button>
          </span>
        ))}

        {/* Text input */}
        <input
          ref={inputRef}
          type='text'
          className='min-w-[160px] flex-1 bg-transparent text-sm text-[#1a1108] outline-none placeholder:text-[#9E8B76] dark:text-white'
          placeholder={chips.length === 0 ? 'Search name, @username, or email…' : 'Add another…'}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setDropdownOpen(true); }}
          disabled={sending}
          autoComplete='off'
        />

        {searching && (
          <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8B76]'>
            <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24' fill='none'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z'/>
            </svg>
          </span>
        )}
      </div>

      {/* Dropdown */}
      {dropdownOpen && (results.length > 0 || showEmailOption) && (
        <div
          ref={dropdownRef}
          className='mt-1 overflow-hidden rounded-xl border border-[#e8d8c4] bg-white shadow-lg dark:border-[#2a1d10] dark:bg-[#1c1510]'
        >
          {results.map((user, idx) => (
            <button
              key={user.id}
              type='button'
              onMouseDown={(e) => { e.preventDefault(); addUserChip(user); }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left transition',
                idx === activeIdx
                  ? 'bg-[rgba(201,169,110,0.1)] dark:bg-[rgba(201,169,110,0.08)]'
                  : 'hover:bg-[rgba(201,169,110,0.06)] dark:hover:bg-[rgba(201,169,110,0.05)]'
              )}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className='h-8 w-8 shrink-0 rounded-full object-cover' />
              ) : (
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(201,169,110,0.15)] text-xs font-bold text-[#8a6520]'>
                  {user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-[#1a1108] dark:text-[#F5EFE6]'>{user.name}</p>
                <p className='text-xs text-[#9E8B76]'>@{user.username}</p>
              </div>
              <span className='shrink-0 rounded-full bg-[rgba(156,175,136,0.15)] px-2 py-0.5 text-[10px] font-medium text-[#5a7a48] dark:bg-[rgba(156,175,136,0.12)] dark:text-[#9CAF88]'>
                On Buzzwin
              </span>
            </button>
          ))}

          {showEmailOption && (
            <button
              type='button'
              onMouseDown={(e) => { e.preventDefault(); tryAddEmailChip(inputVal); }}
              className='flex w-full items-center gap-3 border-t border-[#e8d8c4] px-4 py-2.5 text-left transition hover:bg-[rgba(201,169,110,0.06)] dark:border-[#2a1d10] dark:hover:bg-[rgba(201,169,110,0.05)]'
            >
              <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(181,96,60,0.08)] text-base'>
                ✉️
              </span>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-[#1a1108] dark:text-[#F5EFE6]'>Invite by email</p>
                <p className='truncate text-xs text-[#9E8B76]'>{inputVal.trim()}</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Send button */}
      <button
        onClick={() => void sendInvites()}
        disabled={sending || !hasItems}
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
            {chips.length > 0
              ? `Send ${chips.length} invite${chips.length !== 1 ? 's' : ''}`
              : 'Send invite'}
          </>
        )}
      </button>
    </div>
  );
}
