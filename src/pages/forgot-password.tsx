import { ForgotPassword } from '@components/login/forgot-password';
import { AuthLayout } from '@components/layout/auth-layout';
import type { ReactElement, ReactNode } from 'react';

export default function ForgotPasswordPage(): JSX.Element {
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <ForgotPassword />
    </div>
  );
}

ForgotPasswordPage.getLayout = (page: ReactElement): ReactNode => (
  <AuthLayout>{page}</AuthLayout>
);
