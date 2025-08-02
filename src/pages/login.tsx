import { ReactElement, ReactNode } from 'react';
import { AuthLayout } from '@components/layout/auth-layout';
import { SEO } from '@components/common/seo';
import JustLogin from '@components/login/justlogin';

export default function Login(): JSX.Element {
  return (
    <div className='grid min-h-screen grid-rows-[1fr,auto]'>
      <SEO
        title='Sign In - Buzzwin'
        description='Sign in to Buzzwin and start sharing your favorite shows and movies'
      />
      <div className='dark:via-amber-950/20 dark:to-orange-950/20 flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900'>
        <div className='w-full max-w-md p-8'>
          <div className='mb-8 text-center'>
            <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
              Welcome to Buzzwin
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Your next favorite show awaits
            </p>
          </div>
          <div className='rounded-2xl border border-amber-200 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-amber-800/30 dark:bg-gray-800/80'>
            <JustLogin />
          </div>
        </div>
      </div>
    </div>
  );
}

Login.getLayout = (page: ReactElement): ReactNode => (
  <AuthLayout>{page}</AuthLayout>
);
