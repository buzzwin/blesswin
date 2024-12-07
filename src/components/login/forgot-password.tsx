import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@lib/firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';

export function ForgotPassword(): JSX.Element {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900'>
      <div className='text-center'>
        <HeroIcon
          iconName='KeyIcon'
          className='mx-auto h-12 w-12 text-emerald-500'
        />
        <h2 className='mt-6 text-3xl font-bold text-gray-900 dark:text-white'>
          Reset your password
        </h2>
        <p className='mt-2 text-gray-600 dark:text-gray-400'>
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleReset} className='mt-8 space-y-6'>
        <div>
          <label htmlFor='email' className='sr-only'>
            Email address
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e): void => setEmail(e.target.value)}
            placeholder='Enter your email'
            className='w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            required
          />
        </div>

        <Button type='submit' disabled={loading} className='w-full'>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>

        <div className='text-center'>
          <Link href='/login'>
            <a className='text-sm text-emerald-600 hover:text-emerald-500 dark:text-emerald-400'>
              Back to login
            </a>
          </Link>
        </div>
      </form>
    </div>
  );
}
