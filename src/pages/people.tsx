import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { where } from 'firebase/firestore';
import { useAuth } from '@lib/context/auth-context';
import { usersCollection } from '@lib/firebase/collections';
import { useInfiniteScroll } from '@lib/hooks/useInfiniteScroll';
import {
  PeopleLayout,
  ProtectedLayout
} from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';
import { MainContainer } from '@components/home/main-container';
import { UserCard } from '@components/user/user-card';
import { Loading } from '@components/ui/loading';
import { Error } from '@components/ui/error';
import type { ReactElement, ReactNode } from 'react';
import type { MotionProps } from 'framer-motion';

const variants: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8 }
};

export default function People(): JSX.Element {
  const { user } = useAuth();

  const { data, loading, LoadMore } = useInfiniteScroll(
    usersCollection,
    [where('id', '!=', user?.id)],
    { allowNull: true, preserve: true },
    { marginBottom: 500 }
  );

  const { back } = useRouter();

  return (
    <MainContainer>
      <SEO title='People / Buzzwin' />
      <MainHeader useActionButton title='People' action={back} />
      <section>
        {loading ? (
          <Loading className='mt-5' />
        ) : !data ? (
          <Error message='Something went wrong' />
        ) : (
          <>
            <motion.div className='mt-0.5' {...variants}>
              {data?.map((userData) => (
                <UserCard userData={userData} key={userData.id} follow />
              ))}
            </motion.div>
            <LoadMore />
          </>
        )}
      </section>
    </MainContainer>
  );
}

People.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <PeopleLayout>{page}</PeopleLayout>
    </MainLayout>
  </ProtectedLayout>
);
