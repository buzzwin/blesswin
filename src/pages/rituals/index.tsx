import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RitualsPage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const { tab, ...otherParams } = router.query;
    const tabVal = Array.isArray(tab) ? tab[0] : tab;

    // Map old ritual tab names to new view parameter
    let view = 'today'; // default view
    if (tabVal === 'progress') {
      view = 'progress';
    } else if (tabVal === 'achievements') {
      view = 'achievements';
    } else if (tabVal === 'leaderboard') {
      view = 'leaderboard';
    } else if (
      tabVal === 'joined' ||
      tabVal === 'available' ||
      tabVal === 'created'
    ) {
      view = 'all';
    }

    // Build redirect URL
    const params = new URLSearchParams();
    params.set('tab', 'rituals');
    if (view !== 'today') {
      params.set('view', view);
    }
    // Preserve filter if provided
    if (
      tabVal === 'joined' ||
      tabVal === 'available' ||
      tabVal === 'created'
    ) {
      params.set('filter', tabVal);
    }
    // Preserve other query params
    Object.entries(otherParams).forEach(([key, value]) => {
      if (key !== 'tab' && value) {
        params.set(key, Array.isArray(value) ? value[0] : value);
      }
    });

    const redirectUrl = `/automations?${params.toString()}`;
    void router.replace(redirectUrl);
  }, [router.isReady, router.asPath]);

  return (
    <div className='min-h-[40vh] bg-main-background dark:bg-black' aria-busy='true'>
      <div className='mx-auto flex max-w-2xl flex-col items-center justify-center gap-3 px-4 py-16 text-center'>
        <div className='h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800' />
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Opening…
        </p>
      </div>
    </div>
  );
}
