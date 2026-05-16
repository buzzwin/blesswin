import cn from 'clsx';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '@lib/context/auth-context';
import { GoogleIcon } from '@components/ui/google-icon';
import { LoadingDots } from '@components/ui/loading';

export default function JustLogin(): JSX.Element {
  const { signInWithGoogle, signInWithEmail, createUserWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmail(email, password);
        toast.success('Account created successfully!');
      } else {
        await signInWithEmail(email, password);
        toast.success('Signed in successfully!');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Authentication failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        <h2 className='font-display text-2xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className='text-[#6b5744] dark:text-[#9E8B76]'>
          Create Buzzbooks, celebrate your people, and join your community.
        </p>
      </div>

      <div className='flex flex-col gap-4'>
        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className='space-y-4'>
          <div className='space-y-2'>
            <input
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'w-full rounded-lg px-4 py-2',
                'bg-[#faf8f4] dark:bg-white/10',
                'border border-[#e8d8c4] dark:border-white/10',
                'text-[#1a1108] dark:text-[#F5EFE6] placeholder-[#9E8B76] dark:placeholder-[#6b5744]',
                'focus:border-[#C9A96E] focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/50'
              )}
              required
            />
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                'w-full rounded-lg px-4 py-2',
                'bg-[#faf8f4] dark:bg-white/10',
                'border border-[#e8d8c4] dark:border-white/10',
                'text-[#1a1108] dark:text-[#F5EFE6] placeholder-[#9E8B76] dark:placeholder-[#6b5744]',
                'focus:border-[#C9A96E] focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/50'
              )}
              required
              minLength={6}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              {/* existing remember me checkbox */}
            </div>
            <Link href='/forgot-password'>
              <a className='text-sm text-[#C9A96E] hover:text-[#E8B86D]'>
                Forgot password?
              </a>
            </Link>
          </div>

          <button
            type='submit'
            disabled={loading}
            className={cn(
              'w-full rounded-lg px-4 py-2',
              'bg-[#C97D60] text-white',
              'hover:bg-[#B56540]',
              'transition-colors duration-200',
              'font-medium',
              'flex items-center justify-center gap-2',
              loading && 'cursor-not-allowed opacity-50'
            )}
          >
            {loading ? (
              <LoadingDots size='sm' />
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-[#e8d8c4] dark:border-[#2a1d10]'></div>
          </div>
          <div className='relative flex justify-center'>
            <span className='bg-[#faf8f4] px-2 text-sm text-[#6b5744] dark:bg-[#1c1510] dark:text-[#9E8B76]'>
              or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          type='button'
          className={cn(
            'flex items-center justify-center gap-2',
            'w-full rounded-lg px-4 py-2.5',
            'bg-[#faf8f4] text-[#1a1108] dark:bg-[#1c1510] dark:text-[#F5EFE6]',
            'border border-[#e8d8c4] dark:border-[#2a1d10]',
            'hover:bg-[#f5f1ea] dark:hover:bg-[#231a10]',
            'active:bg-[#ede8de] dark:active:bg-[#2a1d10]',
            'transition-colors duration-200',
            'font-medium',
            'touch-manipulation',
            'cursor-pointer',
            'select-none'
          )}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setLoading(true);
            try {
              await signInWithGoogle();
            } catch (error) {
              // Error handling is done in signInWithGoogle
            } finally {
              setLoading(false);
            }
          }}
        >
          <GoogleIcon className='h-5 w-5' />
          Continue with Google
        </button>

        {/* Toggle Sign Up/Sign In */}
        <button
          type='button'
          onClick={() => setIsSignUp(!isSignUp)}
          className='text-sm text-[#C9A96E] hover:text-[#E8B86D]'
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>

        <p className='text-center text-sm text-[#6b5744] dark:text-[#9E8B76]'>
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
