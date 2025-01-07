import { useState } from 'react';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { WatchClubsList } from '@components/clubs/watch-clubs-list';
import { CreateClubModal } from '@components/clubs/create-club-modal';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import type { ReactElement, ReactNode } from 'react';

export default function WatchClubs(): JSX.Element {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <section>
      <SEO title='Watch Clubs / Buzzwin' />
      <MainHeader>
        <div className='flex items-center justify-between px-4'>
          <h2 className='text-xl font-bold'>Watch Clubs</h2>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className='flex items-center gap-2 rounded-lg bg-main-accent px-4 py-2 text-white transition hover:bg-main-accent/90'
          >
            <HeroIcon iconName='PlusIcon' className='h-5 w-5' />
            Create Club
          </Button>
        </div>
      </MainHeader>

      <div className='mt-0.5 px-4'>
        <WatchClubsList />
      </div>

      <CreateClubModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </section>
  );
}

WatchClubs.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <HomeLayout>{page}</HomeLayout>
  </ProtectedLayout>
);
