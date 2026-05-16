import { AuthLayout } from '@components/layout/auth-layout';
import { SEO } from '@components/common/seo';
import JustLogin from '@components/login/justlogin';
import type { ReactElement, ReactNode } from 'react';

export default function Login(): JSX.Element {
  return (
    <div className='min-h-screen bg-[#f5f1ea] dark:bg-[#110d07]'>
      <SEO
        title='Sign In - Buzzwin'
        description='Sign in to Buzzwin and celebrate the people who matter'
      />
      <div className='mx-auto max-w-md px-6 py-12'>
        <div className='mb-8 text-center'>
          <h1 className='font-display text-2xl font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
            Welcome to Buzzwin
          </h1>
        </div>
        <div className='rounded-2xl border border-[#e8d8c4] bg-[#faf8f4] p-8 shadow-sm dark:border-[#2a1d10] dark:bg-[#1c1510]'>
          <JustLogin />
        </div>
      </div>
    </div>
  );
}

Login.getLayout = (page: ReactElement): ReactNode => (
  <AuthLayout>{page}</AuthLayout>
);
