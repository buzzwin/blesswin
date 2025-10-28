import { useAuth } from '@lib/context/auth-context';
import { HomeLayout } from '@components/layout/common-layout';
import { SEO } from '@components/common/seo';
import { CuratorChat } from '@components/chat/curator-chat';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { SectionShell } from '@components/layout/section-shell';
import { Bot } from 'lucide-react';

export default function CuratorPage(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      void router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <HomeLayout>
        <div className='flex h-screen items-center justify-center'>
          <div className='text-center'>
            <Bot className='mx-auto h-12 w-12 animate-pulse text-purple-500' />
            <p className='mt-4 text-gray-600 dark:text-gray-400'>
              Loading your Curator...
            </p>
          </div>
        </div>
      </HomeLayout>
    );
  }

  if (!user) {
    return (
      <HomeLayout>
        <div />
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <SEO title='Your AI Curator - Buzzwin' />
      <SectionShell>
        <div className='mx-auto flex h-screen max-w-6xl flex-col px-6 py-8'>
          {/* Header */}
          <div className='mb-6 text-center'>
            <div className='mb-2 flex items-center justify-center gap-2'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-4 ring-purple-500/30'>
                <Bot className='h-6 w-6 text-white' />
              </div>
            </div>
            <h1 className='text-3xl font-black text-gray-900 dark:text-white sm:text-4xl'>
              Chat with Your Curator
            </h1>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>
              Get personalized recommendations based on your taste profile
            </p>
          </div>

          {/* Chat Interface */}
          <div className='flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800/50 dark:backdrop-blur-sm'>
            <CuratorChat userId={user.id} className='h-full' />
          </div>
        </div>
      </SectionShell>
    </HomeLayout>
  );
}
