import { AuthLayout } from '@components/layout/auth-layout';
import { SEO } from '@components/common/seo';
import { LoginMain } from '@components/login/login-main';
import { LoginFooter } from '@components/login/login-footer';
import type { ReactElement, ReactNode } from 'react';
import { HeroIcon } from '@components/ui/hero-icon';

export default function Login(): JSX.Element {
  return (
    <div className='grid min-h-screen grid-rows-[1fr,auto]'>
      <SEO
        title='Buzzwin - What will you watch next ?'
        description='So many movies, so many shows to choose from. What are you watching now ? What will you watch next? '
      />
      <div className='border-b border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'>
        <div className='mx-auto max-w-7xl py-3 px-4'>
          <div className='flex items-center gap-3'>
            <HeroIcon
              iconName='InformationCircleIcon'
              className='h-5 w-5 text-yellow-600 dark:text-yellow-500'
            />
            <p className='text-sm text-yellow-700 dark:text-yellow-300'>
              Anonymous logins have been temporarily disabled due to high volume
              of automated accounts.
            </p>
          </div>
        </div>
      </div>
      <LoginMain />
      <LoginFooter />
    </div>
  );
}

Login.getLayout = (page: ReactElement): ReactNode => (
  <AuthLayout>{page}</AuthLayout>
);
