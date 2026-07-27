import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { query, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@lib/context/auth-context';
import {
  usersCollection,
  buzzesCollection,
  ritualsCollection
} from '@lib/firebase/collections';
import { useCollection } from '@lib/hooks/useCollection';
import { formatDate } from '@lib/date';
import { ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';
import { MainContainer } from '@components/home/main-container';
import { Loading } from '@components/ui/loading';
import { UserAvatar } from '@components/user/user-avatar';
import type { ReactElement, ReactNode } from 'react';
import type { Timestamp } from 'firebase/firestore';

const RECENT_LIMIT = 20;

function SectionHeading({
  emoji,
  title,
  count
}: {
  emoji: string;
  title: string;
  count: number | null;
}): JSX.Element {
  return (
    <div className='flex items-center gap-2 px-4 pt-6 pb-2'>
      <span className='text-xl'>{emoji}</span>
      <h2 className='font-display text-lg font-extrabold'>{title}</h2>
      {count !== null && (
        <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
          {count}
        </span>
      )}
    </div>
  );
}

function joinedDate(createdAt: Timestamp | Date | undefined): string {
  if (!createdAt) return '—';
  if (createdAt instanceof Date) return createdAt.toLocaleDateString('en-gb');
  return formatDate(createdAt, 'tweet');
}

export default function Admin(): JSX.Element {
  const { isAdmin, loading: authLoading } = useAuth();
  const { replace, back } = useRouter();

  useEffect(() => {
    if (!authLoading && !isAdmin) void replace('/home');
  }, [authLoading, isAdmin, replace]);

  const { data: recentUsers, loading: usersLoading } = useCollection(
    query(usersCollection, orderBy('createdAt', 'desc'), limit(RECENT_LIMIT)),
    { allowNull: true, disabled: !isAdmin }
  );

  const { data: recentBuzzes, loading: buzzesLoading } = useCollection(
    query(buzzesCollection, orderBy('createdAt', 'desc'), limit(RECENT_LIMIT)),
    { allowNull: true, disabled: !isAdmin }
  );

  const { data: recentRituals, loading: ritualsLoading } = useCollection(
    query(ritualsCollection, orderBy('createdAt', 'desc'), limit(RECENT_LIMIT)),
    { allowNull: true, disabled: !isAdmin }
  );

  if (authLoading || !isAdmin)
    return (
      <MainContainer>
        <Loading className='mt-5' />
      </MainContainer>
    );

  return (
    <MainContainer>
      <SEO title='Admin / Buzzwin' />
      <MainHeader useActionButton title='Admin' action={back} />

      <section>
        <SectionHeading
          emoji='🌱'
          title='New signups'
          count={recentUsers?.length ?? null}
        />
        {usersLoading ? (
          <Loading className='mt-3' />
        ) : !recentUsers?.length ? (
          <p className='px-4 text-light-secondary dark:text-dark-secondary'>
            No signups found.
          </p>
        ) : (
          <ul>
            {recentUsers.map((u) => (
              <li
                key={u.id}
                className='flex items-center gap-3 border-b border-light-border px-4 py-3 dark:border-dark-border'
              >
                <UserAvatar src={u.photoURL} alt={u.name} username={u.username} />
                <div className='min-w-0 flex-1'>
                  <p className='truncate font-bold'>{u.name}</p>
                  <p className='truncate text-sm text-light-secondary dark:text-dark-secondary'>
                    @{u.username}
                  </p>
                </div>
                <span className='shrink-0 text-sm text-light-secondary dark:text-dark-secondary'>
                  {joinedDate(u.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeading
          emoji='📖'
          title='New buzzes'
          count={recentBuzzes?.length ?? null}
        />
        {buzzesLoading ? (
          <Loading className='mt-3' />
        ) : !recentBuzzes?.length ? (
          <p className='px-4 text-light-secondary dark:text-dark-secondary'>
            No buzzes found.
          </p>
        ) : (
          <ul>
            {recentBuzzes.map((buzz) => (
              <li
                key={buzz.id}
                className='border-b border-light-border px-4 py-3 dark:border-dark-border'
              >
                <div className='flex items-center justify-between gap-2'>
                  <p className='truncate font-bold'>{buzz.title}</p>
                  <span className='shrink-0 text-sm text-light-secondary dark:text-dark-secondary'>
                    {joinedDate(buzz.createdAt)}
                  </span>
                </div>
                <p className='text-sm text-light-secondary dark:text-dark-secondary'>
                  For {buzz.recipientName} · {buzz.occasion}
                  {buzz.customOccasion ? ` (${buzz.customOccasion})` : ''} ·{' '}
                  {buzz.totalSignatures} signature
                  {buzz.totalSignatures === 1 ? '' : 's'} ·{' '}
                  {buzz.status === 'revealed' ? 'Buzzbook revealed' : 'Collecting'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className='pb-8'>
        <SectionHeading
          emoji='🔁'
          title='New rituals'
          count={recentRituals?.length ?? null}
        />
        {ritualsLoading ? (
          <Loading className='mt-3' />
        ) : !recentRituals?.length ? (
          <p className='px-4 text-light-secondary dark:text-dark-secondary'>
            No rituals found.
          </p>
        ) : (
          <ul>
            {recentRituals.map((ritual) => (
              <li
                key={ritual.id}
                className='border-b border-light-border px-4 py-3 dark:border-dark-border'
              >
                <div className='flex items-center justify-between gap-2'>
                  <p className='truncate font-bold'>
                    {ritual.icon ? `${ritual.icon} ` : ''}
                    {ritual.title}
                  </p>
                  <span className='shrink-0 text-sm text-light-secondary dark:text-dark-secondary'>
                    {joinedDate(ritual.createdAt)}
                  </span>
                </div>
                <p className='truncate text-sm text-light-secondary dark:text-dark-secondary'>
                  {ritual.scope} · {ritual.joinedByUsers?.length ?? 0} joined ·{' '}
                  {ritual.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </MainContainer>
  );
}

Admin.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>{page}</MainLayout>
  </ProtectedLayout>
);
