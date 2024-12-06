import { useRouter } from 'next/router';
import {
  TrendsLayout,
  ProtectedLayout
} from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';
import { MainContainer } from '@components/home/main-container';
import { AsideTrends } from '@components/aside/aside-trends';
import { Button } from '@components/ui/button';
import { ToolTip } from '@components/ui/tooltip';
import { HeroIcon } from '@components/ui/hero-icon';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '@lib/utils';
import { useEffect, useState } from 'react';

export default function Trends(): JSX.Element {
  const { back } = useRouter();

  return (
    <MainContainer>
      <SEO title='Trends / Buzzwin' />
      <MainHeader useActionButton title='Trends' action={back}>
        <Button
          className={cn(
            'group relative ml-auto p-2',
            'cursor-not-allowed',
            'hover:bg-light-primary/10 active:bg-light-primary/20',
            'dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
          )}
        >
          <HeroIcon className='w-5 h-5' iconName='Cog8ToothIcon' />
          <ToolTip tip='Settings' />
        </Button>
      </MainHeader>
      <AsideTrends inTrendsPage />
    </MainContainer>
  );
}

Trends.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <TrendsLayout>{page}</TrendsLayout>
    </MainLayout>
  </ProtectedLayout>
);
