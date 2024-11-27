import { useState } from 'react';
import { Button } from '@components/ui/button';
import { CustomIcon } from '@components/ui/custom-icon';
import { FacebookIcon } from 'next-share';
import { useAuth } from '@lib/context/auth-context';

function JustLogin(): JSX.Element {
  const { signInWithGoogle, signInWithFacebook, signInAnon } = useAuth();

  return (
    <div className='mx-auto max-w-md'>
      <div className='space-y-4 text-center'>
        <h2 className='text-2xl font-bold text-white md:text-3xl'>
          Get Started Today
        </h2>
        <p className='text-lg text-gray-300'>
          Join our community of TV and movie enthusiasts
        </p>
      </div>

      <div className='mt-8 space-y-4'>
        <Button
          className='group relative flex w-full items-center justify-center space-x-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-200'
          onClick={signInWithGoogle}
        >
          <CustomIcon iconName='GoogleIcon' className='h-5 w-5' />
          <span>Continue with Google</span>
        </Button>

        <Button
          className='group relative flex w-full items-center justify-center space-x-2 rounded-lg bg-[#1877F2] px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:bg-[#1865F2] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
          onClick={signInWithFacebook}
        >
          <FacebookIcon className='h-5 w-5' />
          <span>Continue with Facebook</span>
        </Button>

        <div className='relative py-3'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-600'></div>
          </div>
          <div className='relative flex justify-center'>
            <span className='bg-[#1a1f35]/60 px-3 text-sm text-gray-400'>
              or
            </span>
          </div>
        </div>

        <Button
          onClick={signInAnon}
          className='group relative flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400'
        >
          Try as Guest
        </Button>
      </div>

      <p className='mt-6 text-center text-sm text-gray-400'>
        By signing up, you agree to our{' '}
        <a
          href='https://buzzwin.com/tos'
          className='text-teal-400 hover:text-teal-300'
        >
          Terms
        </a>{' '}
        and{' '}
        <a
          href='https://buzzwin.com/privacy'
          className='text-teal-400 hover:text-teal-300'
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
}

export default JustLogin;
