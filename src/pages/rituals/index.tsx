import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RitualsPage(): null {
  const router = useRouter();

  useEffect(() => {
    const { tab, ...otherParams } = router.query;
    
    // Map old ritual tab names to new view parameter
    let view = 'today'; // default view
    if (tab === 'progress') {
      view = 'progress';
    } else if (tab === 'achievements') {
      view = 'achievements';
    } else if (tab === 'leaderboard') {
      view = 'leaderboard';
    } else if (tab === 'joined' || tab === 'available' || tab === 'created') {
      view = 'all';
    }
    
    // Build redirect URL
    const params = new URLSearchParams();
    params.set('tab', 'rituals');
    if (view !== 'today') {
      params.set('view', view);
    }
    // Preserve filter if provided
    if (tab === 'joined' || tab === 'available' || tab === 'created') {
      params.set('filter', tab as string);
    }
    // Preserve other query params
    Object.entries(otherParams).forEach(([key, value]) => {
      if (key !== 'tab' && value) {
        params.set(key, Array.isArray(value) ? value[0] : value);
      }
    });
    
    const redirectUrl = `/automations?${params.toString()}`;
    void router.replace(redirectUrl);
  }, [router]);

  return null;
}
