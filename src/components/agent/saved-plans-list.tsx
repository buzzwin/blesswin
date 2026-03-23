import { useState, useEffect } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { Loader2 } from 'lucide-react';

type PlanRow = {
  id: string;
  title: string;
  content: string;
  createdAt: unknown;
};

export function SavedPlansList(): JSX.Element | null {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agent/saved-plans?userId=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setPlans(data.plans ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  if (!user?.id) return null;

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex items-center justify-between gap-2'>
        <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>Saved plans</h3>
        <button
          type='button'
          onClick={() => void load()}
          className='text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400'
        >
          Refresh
        </button>
      </div>
      {loading && (
        <div className='flex items-center gap-2 py-6 text-sm text-gray-500'>
          <Loader2 className='h-4 w-4 animate-spin' />
          Loading…
        </div>
      )}
      {error && <p className='py-2 text-sm text-red-600 dark:text-red-400'>{error}</p>}
      {!loading && !error && plans.length === 0 && (
        <p className='py-4 text-sm text-gray-600 dark:text-gray-400'>
          No saved plans yet. Use &quot;Save last response as plan&quot; after a reply.
        </p>
      )}
      {!loading && plans.length > 0 && (
        <ul className='mt-3 max-h-48 space-y-3 overflow-y-auto'>
          {plans.map((p) => (
            <li
              key={p.id}
              className='rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-600 dark:bg-gray-900/40'
            >
              <div className='font-medium text-gray-900 dark:text-white'>{p.title}</div>
              <p className='mt-1 line-clamp-3 whitespace-pre-wrap text-gray-600 dark:text-gray-400'>
                {p.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
