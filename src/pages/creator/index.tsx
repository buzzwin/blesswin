import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { useRequireAuth } from '@lib/hooks/useRequireAuth';
import { CommonLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import type { ReactElement, ReactNode } from 'react';
import type { CreatorAgent, CreatorProposal, CreatorProposalStatus } from '@lib/types/creator';

type ProposalsResponse = {
  success: boolean;
  proposals?: CreatorProposal[];
  error?: string;
};

const AGENT_OPTIONS: CreatorAgent[] = ['research', 'content', 'growth', 'monetization'];

export default function CreatorConsolePage(): JSX.Element {
  useRequireAuth('/login');
  const { user, isAdmin } = useAuth();

  const [statusFilter, setStatusFilter] = useState<CreatorProposalStatus | 'all'>('pending');
  const [proposals, setProposals] = useState<CreatorProposal[]>([]);
  const [loading, setLoading] = useState(false);

  const [agent, setAgent] = useState<CreatorAgent>('research');
  const [input, setInput] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [editedContent, setEditedContent] = useState('');

  const selected = useMemo(
    () => proposals.find((item) => item.id === selectedId) ?? null,
    [proposals, selectedId]
  );

  const fetchProposals = async (): Promise<void> => {
    if (!user?.id || !isAdmin) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/creator/proposals?userId=${encodeURIComponent(user.id)}&status=${statusFilter}`
      );
      const data = (await response.json()) as ProposalsResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load proposals');
      }
      setProposals(data.proposals || []);
      if (!selectedId && data.proposals?.length) {
        setSelectedId(data.proposals[0].id || null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAdmin, statusFilter]);

  const runAgent = async (): Promise<void> => {
    if (!user?.id) return;
    if (!input.trim()) {
      toast.error('Enter a prompt for the agent');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/creator/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id, agent, input })
      });

      const data = (await response.json()) as { success: boolean; id?: string; error?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Run failed');
      }
      toast.success('Proposal queued for review');
      setInput('');
      await fetchProposals();
      if (data.id) setSelectedId(data.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Run failed');
    } finally {
      setLoading(false);
    }
  };

  const reviewProposal = async (status: CreatorProposalStatus): Promise<void> => {
    if (!selected?.id || !user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/creator/proposals/${selected.id}?userId=${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          status,
          reviewNotes,
          editedContent
        })
      });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Review failed');
      }

      toast.success(`Proposal marked ${status}`);
      setReviewNotes('');
      setEditedContent('');
      await fetchProposals();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Review failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <MainContainer>
        <SEO title='Creator Console / Buzzwin' description='Creator console for editorial workflows.' />
        <MainHeader title='Creator Console' useMobileSidebar />
        <div className='rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
          Creator access is restricted.
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <SEO
        title='Creator Console / Buzzwin'
        description='Human-in-the-loop creator workflow for research, content, growth, and monetization proposals.'
      />
      <MainHeader title='Creator Console' useMobileSidebar />

      <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
        Agents draft proposals. You approve, edit, or reject before anything ships.
      </p>

      <section className='mb-6 rounded-xl border border-gray-200 p-4 dark:border-gray-800'>
        <h2 className='mb-2 text-sm font-semibold text-gray-900 dark:text-white'>
          Run agent
        </h2>
        <div className='grid gap-2 sm:grid-cols-[180px,1fr,120px]'>
          <select
            value={agent}
            onChange={(e) => setAgent(e.target.value as CreatorAgent)}
            className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900'
          >
            {AGENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Topic or brief input'
            className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900'
          />
          <button
            type='button'
            onClick={() => void runAgent()}
            disabled={loading}
            className='rounded-md bg-black px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-black'
          >
            Queue
          </button>
        </div>
      </section>

      <div className='mb-3 flex flex-wrap items-center gap-2'>
        {(['pending', 'approved', 'rejected', 'edited', 'all'] as const).map((value) => (
          <button
            key={value}
            type='button'
            onClick={() => setStatusFilter(value)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              statusFilter === value
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-black'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className='grid gap-4 lg:grid-cols-[320px,1fr]'>
        <aside className='max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-800'>
          {loading && !proposals.length ? (
            <p className='p-2 text-sm text-gray-500'>Loading…</p>
          ) : proposals.length ? (
            proposals.map((proposal) => (
              <button
                key={proposal.id}
                type='button'
                onClick={() => setSelectedId(proposal.id || null)}
                className={`mb-1 w-full rounded-lg border p-2 text-left ${
                  selectedId === proposal.id
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                <p className='text-xs uppercase tracking-wide text-gray-500'>
                  {proposal.agent} · {proposal.status}
                </p>
                <p className='line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white'>
                  {proposal.title}
                </p>
              </button>
            ))
          ) : (
            <p className='p-2 text-sm text-gray-500'>No proposals yet.</p>
          )}
        </aside>

        <section className='rounded-xl border border-gray-200 p-4 dark:border-gray-800'>
          {selected ? (
            <>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                {selected.title}
              </h3>
              <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                {selected.summary}
              </p>

              <div className='mt-4 grid gap-3'>
                <div>
                  <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500'>Payload</p>
                  <pre className='max-h-64 overflow-auto rounded-lg bg-gray-100 p-3 text-xs dark:bg-gray-900'>
                    {JSON.stringify(selected.payload, null, 2)}
                  </pre>
                </div>

                <div>
                  <label className='mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Review notes
                  </label>
                  <textarea
                    rows={3}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900'
                    placeholder='Decision context or notes'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Edited content (optional)
                  </label>
                  <textarea
                    rows={6}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900'
                    placeholder='Manual edits before approval'
                  />
                </div>
              </div>

              <div className='mt-4 flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={() => void reviewProposal('approved')}
                  className='rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white'
                >
                  Approve
                </button>
                <button
                  type='button'
                  onClick={() => void reviewProposal('edited')}
                  className='rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white'
                >
                  Save as edited
                </button>
                <button
                  type='button'
                  onClick={() => void reviewProposal('rejected')}
                  className='rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white'
                >
                  Reject
                </button>
              </div>
            </>
          ) : (
            <p className='text-sm text-gray-500'>Select a proposal to review.</p>
          )}
        </section>
      </div>
    </MainContainer>
  );
}

CreatorConsolePage.getLayout = (page: ReactElement): ReactNode => (
  <CommonLayout>
    <MainLayout>{page}</MainLayout>
  </CommonLayout>
);
