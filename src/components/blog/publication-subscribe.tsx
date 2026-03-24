import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@lib/utils';

type PublicationSubscribeProps = {
  className?: string;
};

export function PublicationSubscribe({
  className
}: PublicationSubscribeProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('Enter your email');
      return;
    }
    setPending(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed })
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? 'Something went wrong');
        return;
      }
      toast.success("You're on the list. Thanks!");
      setEmail('');
    } catch {
      toast.error('Network error — try again');
    } finally {
      setPending(false);
    }
  };

  return (
    <section
      id='publication-subscribe'
      className={cn(
        'scroll-mt-24 rounded-xl border border-charcoal/10 bg-white/80 p-5 dark:border-white/10 dark:bg-gray-900/60 sm:p-6',
        className
      )}
      aria-labelledby='publication-subscribe-heading'
    >
      <h2
        id='publication-subscribe-heading'
        className='font-display text-lg font-semibold text-charcoal dark:text-white'
      >
        New posts, free in your inbox
      </h2>
      <p className='mt-1 text-sm text-charcoal/70 dark:text-gray-400'>
        No account required. We will only use this to send journal updates.
      </p>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className='mt-4 flex flex-col gap-2 sm:flex-row sm:items-center'
      >
        <label htmlFor='publication-email' className='sr-only'>
          Email
        </label>
        <input
          id='publication-email'
          type='email'
          name='email'
          autoComplete='email'
          placeholder='you@example.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='min-h-11 w-full flex-1 rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-charcoal/40 focus:outline-none focus:ring-2 focus:ring-charcoal/20 dark:border-white/15 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white/30 dark:focus:ring-white/10'
        />
        <button
          type='submit'
          disabled={pending}
          className='min-h-11 shrink-0 rounded-lg bg-charcoal px-5 py-2 text-sm font-semibold text-cream transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-gray-900'
        >
          {pending ? '…' : 'Subscribe'}
        </button>
      </form>
    </section>
  );
}
