import { useRouter } from 'next/router';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { CreateBuzzForm } from '@components/buzz/create-buzz-form';
import type { ReactElement, ReactNode } from 'react';

export default function NewBuzz(): JSX.Element {
  const { back } = useRouter();
  return (
    <section>
      <SEO title='Start a Buzz / Buzzwin' />
      <MainHeader title='Start a Buzz' useActionButton iconName='ArrowLeftIcon' action={back} />
      <CreateBuzzForm />
    </section>
  );
}

NewBuzz.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <HomeLayout>{page}</HomeLayout>
  </ProtectedLayout>
);
