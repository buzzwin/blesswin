import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { auth } from '@lib/firebase/app';
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
    <div className='w-full max-w-md space-y-8 rounded-2xl border border-[#e8d8c4] bg-[#faf8f4] p-8 shadow-lg dark:border-[#2a1d10] dark:bg-[#1c1510]'>
      <div className='text-center'>
        <HeroIcon
          iconName='KeyIcon'
          className='mx-auto h-12 w-12 text-[#C9A96E]'
        />
        <h2 className='mt-6 font-display text-3xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
          Reset your password
        </h2>
        <p className='mt-2 text-[#6b5744] dark:text-[#9E8B76]'>
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
            className='w-full rounded-xl border border-[#e8d8c4] bg-[#faf8f4] px-4 py-3 text-[#1a1108] placeholder-[#9E8B76] focus:border-[#C9A96E] focus:outline-none focus:ring-2 focus:ring-[rgba(201,169,110,0.25)] dark:border-[#2a1d10] dark:bg-[#110d07] dark:text-[#F5EFE6] dark:placeholder-[#6b5744]'
            required
          />
        </div>

        <Button type='submit' disabled={loading} className='w-full'>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>

        <div className='text-center'>
          <Link href='/login'>
            <a className='text-sm text-[#C9A96E] hover:text-[#E8B86D]'>
              Back to login
            </a>
          </Link>
        </div>
      </form>
    </div>
  );
}
