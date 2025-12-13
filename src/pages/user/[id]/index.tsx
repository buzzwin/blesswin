import { useUser } from '@lib/context/user-context';
import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
import { UserDataLayout } from '@components/layout/user-data-layout';
import { UserHomeLayout } from '@components/layout/user-home-layout';
import { UserImpactMoments } from '@components/user/user-impact-moments';
import type { ReactElement, ReactNode } from 'react';
import type { RippleType } from '@lib/types/impact-moment';

export default function UserImpactMomentsPage(): JSX.Element {
  const { user } = useUser();
  const { id } = user ?? {};

  const handleRipple = (momentId: string, rippleType: RippleType): void => {
    // Ripple handling can be implemented here if needed
    // For now, it's handled in the ImpactMomentCard component
  };

  return (
    <div className='space-y-0'>
      {id ? (
        <UserImpactMoments userId={id} onRipple={handleRipple} />
      ) : (
        <div className='mt-5 text-center text-gray-500 dark:text-gray-400'>
          Loading user...
        </div>
      )}
    </div>
  );
}

UserImpactMomentsPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <UserLayout>
      <UserDataLayout>
        <UserHomeLayout>{page}</UserHomeLayout>
      </UserDataLayout>
    </UserLayout>
  </ProtectedLayout>
);
