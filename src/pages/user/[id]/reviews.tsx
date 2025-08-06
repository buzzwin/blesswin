import { useRouter } from 'next/router';
import { useUser } from '@lib/context/user-context';
import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { UserDataLayout } from '@components/layout/user-data-layout';
import { UserHomeLayout } from '@components/layout/user-home-layout';
import { UserReviews } from '@components/user/user-reviews';
import type { ReactElement, ReactNode } from 'react';

export default function UserReviewsPage(): JSX.Element {
  const { user } = useUser();
  const { query } = useRouter();
  const userId = query.id as string;

  return (
    <section>
      <SEO
        title={`Reviews by ${user?.name as string} (@${
          user?.username as string
        }) / Buzzwin`}
      />
      <UserReviews userId={userId} />
    </section>
  );
}

UserReviewsPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <UserLayout>
        <UserDataLayout>
          <UserHomeLayout>{page}</UserHomeLayout>
        </UserDataLayout>
      </UserLayout>
    </MainLayout>
  </ProtectedLayout>
);
