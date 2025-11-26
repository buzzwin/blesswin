import { AuthLayout } from '@components/layout/auth-layout';
import { SEO } from '@components/common/seo';
import JustLogin from '@components/login/justlogin';
import type { ReactElement, ReactNode } from 'react';

export default function Login(): JSX.Element {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <SEO
        title='Sign In - Buzzwin'
        description='Sign in to Buzzwin and start your wellness journey'
      />
      <div className='mx-auto max-w-md px-6 py-12'>
        <div className='mb-8 text-center'>
          <h1 className='text-2xl font-light text-gray-900 dark:text-white'>
            Welcome to Buzzwin
          </h1>
        </div>
        <div className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
          <JustLogin />
        </div>
      </div>
    </div>
  );
}

Login.getLayout = (page: ReactElement): ReactNode => (
  <AuthLayout>{page}</AuthLayout>
);
