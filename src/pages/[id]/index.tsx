import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useUser } from '@lib/context/user-context';
import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { UserDataLayout } from '@components/layout/user-data-layout';
import { UserHomeLayout } from '@components/layout/user-home-layout';
import { UserImpactMoments } from '@components/user/user-impact-moments';
import type { ReactElement, ReactNode } from 'react';
import type { RippleType } from '@lib/types/impact-moment';

export default function UserProfile(): JSX.Element {
  const { user } = useUser();
  const { query, push } = useRouter();
  const userId = query.id as string;

  // Redirect "home" to the main page
  useEffect(() => {
    if (userId === 'home') {
      void push('/');
    }
  }, [userId, push]);

  const handleRipple = (momentId: string, rippleType: RippleType): void => {
    // Ripple handling can be implemented here if needed
    // For now, it's handled in the ImpactMomentCard component
  };

  return (
    <section>
      <SEO
        title={`${user?.name as string} (@${
          user?.username as string
        }) / Buzzwin`}
      />
      {userId ? (
        <UserImpactMoments userId={userId} onRipple={handleRipple} />
      ) : (
        <div className='mt-5 text-center text-gray-500 dark:text-gray-400'>
          Loading user...
        </div>
      )}
    </section>
  );
}

UserProfile.getLayout = (page: ReactElement): ReactNode => (
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
