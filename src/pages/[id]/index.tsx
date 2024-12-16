import { useRouter } from 'next/router';
import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { UserDataLayout } from '@components/layout/user-data-layout';
import { UserHomeLayout } from '@components/layout/user-home-layout';
import { ReviewsList } from '@components/review/reviews-list';
import { useUser } from '@lib/context/user-context';
import { useEffect, useState } from 'react';
import { ReviewWithUser } from '@lib/types/review';
import { getUserReviews } from '@lib/firebase/utils/review';
import type { ReactElement, ReactNode } from 'react';

export default function UserProfile(): JSX.Element {
  const { user } = useUser();
  const { query } = useRouter();
  const userId = query.id as string;

  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserReviews = async (): Promise<void> => {
      if (!userId) return;

      try {
        const userReviews = await getUserReviews(userId);
        setReviews(userReviews);
      } catch (error) {
        console.error('Error loading user reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadUserReviews();
  }, [userId]);

  const handleReviewDeleted = (reviewId: string) => {
    setReviews((prevReviews) =>
      prevReviews.filter((review) => review.id !== reviewId)
    );
  };

  return (
    <section>
      <SEO
        title={`${user?.name as string} (@${
          user?.username as string
        }) / Buzzwin`}
      />
      <div className='mt-0.5 px-4'>
        <ReviewsList
          reviews={reviews}
          loading={loading}
          onReviewDeleted={handleReviewDeleted}
        />
      </div>
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
