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
      // console.error('Auth error:', error);
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
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className='text-gray-600 dark:text-gray-300'>
          Connect with others on their wellness journey, share your positive
          actions, and inspire others to do good.
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
                'bg-white/10 backdrop-blur-sm',
                'border border-white/10',
                'text-white placeholder-gray-400',
                'focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
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
                'bg-white/10 backdrop-blur-sm',
                'border border-white/10',
                'text-white placeholder-gray-400',
                'focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
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
              <a className='text-sm text-emerald-600 hover:text-emerald-500 dark:text-emerald-400'>
                Forgot password?
              </a>
            </Link>
          </div>

          <button
            type='submit'
            disabled={loading}
            className={cn(
              'w-full rounded-lg px-4 py-2',
              'bg-emerald-500 text-white',
              'hover:bg-emerald-600',
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
            <div className='w-full border-t border-gray-300 dark:border-gray-600'></div>
          </div>
          <div className='relative flex justify-center'>
            <span className='bg-white px-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
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
            'bg-white text-gray-900 dark:bg-gray-800 dark:text-white',
            'border border-gray-300 dark:border-gray-600',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'active:bg-gray-200 dark:active:bg-gray-600',
            'transition-colors duration-200',
            'font-medium',
            'touch-manipulation', // Better touch handling on iOS
            'cursor-pointer',
            'select-none' // Prevent text selection on tap
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void signInWithGoogle();
          }}
          onTouchStart={(e) => {
            // Ensure touch events work properly on iOS
            e.currentTarget.style.opacity = '0.8';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <GoogleIcon className='h-5 w-5' />
          Continue with Google
        </button>

        {/* Toggle Sign Up/Sign In */}
        <button
          type='button'
          onClick={() => setIsSignUp(!isSignUp)}
          className='text-sm text-emerald-400 hover:text-emerald-300'
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>

        <p className='text-center text-sm text-gray-400'>
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
