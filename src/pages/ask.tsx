import { useAuth } from '@lib/context/auth-context';
import { useRequireAuth } from '@lib/hooks/useRequireAuth';
import { CommonLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { SEO } from '@components/common/seo';
import { AutomationChat } from '@components/automation/automation-chat';
import { AgentPreferencesForm } from '@components/agent/agent-preferences-form';
import { SavedPlansList } from '@components/agent/saved-plans-list';
import type { ReactElement, ReactNode } from 'react';

const SUGGESTED_PROMPTS = [
  'Plan my Friday night',
  "I'm bored — give me 3 options",
  'Suggest a calm weekend morning routine'
];

export default function AskBuzzwinPage(): JSX.Element {
  useRequireAuth('/login');
  const { user } = useAuth();

  return (
    <MainContainer>
      <SEO
        title='Ask Buzzwin - Decide and act / Buzzwin'
        description='Tell Buzzwin what you want. Get plans, options, and next steps — not just discovery.'
      />
      <MainHeader title='Ask Buzzwin' useMobileSidebar />

      <p className='mb-6 text-center text-sm text-gray-600 dark:text-gray-400'>
        Desire → Plan with AI · Expectation → Simulate and prepare · Belief → Execute and adapt — your AI co-pilot.
      </p>

      <div className='space-y-6'>
        <AutomationChat
          headerTitle='Ask Buzzwin'
          headerSubtitle='Decide and act — plans, options, and automations'
          suggestedPrompts={SUGGESTED_PROMPTS}
          agentPreferences={user?.agentPreferences ?? null}
          enableSavePlan
          placeholder='Ask anything: trips, meals, habits, or what to automate…'
        />

        <AgentPreferencesForm />
        <SavedPlansList />
      </div>
    </MainContainer>
  );
}

AskBuzzwinPage.getLayout = (page: ReactElement): ReactNode => (
  <CommonLayout>
    <MainLayout>{page}</MainLayout>
  </CommonLayout>
);
