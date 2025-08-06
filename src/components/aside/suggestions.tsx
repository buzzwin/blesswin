import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@lib/context/auth-context';
import { useCollection } from '@lib/hooks/useCollection';
import { usersCollection } from '@lib/firebase/collections';
import { cn } from '@lib/utils';
import { UserCard } from '@components/user/user-card';
import { Loading } from '@components/ui/loading';
import { Error } from '@components/ui/error';

const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8 }
};

export function Suggestions(): JSX.Element {
  const { user } = useAuth();
  const [randomUsers, setRandomUsers] = useState<string[]>([]);

  const { data: users, loading: usersLoading } = useCollection(
    usersCollection,
    {
      allowNull: true,
      disabled: !user
    }
  );

  useEffect(() => {
    if (users?.length && user?.id) {
      const filteredUsers = users
        .filter((u) => u.id !== user.id) // Exclude current user
        .sort(() => 0.5 - Math.random()) // Randomize
        .slice(0, 3); // Take first 3

      setRandomUsers(filteredUsers.map((u) => u.id));
    }
  }, [users, user?.id]);

  if (usersLoading) return <Loading />;
  if (!users?.length) return <></>;

  return (
    <section className='sticky top-0 py-4'>
      <motion.div
        className={cn(
          'rounded-2xl bg-white/5 p-4',
          'hover:bg-white/10 dark:bg-black/20 dark:hover:bg-black/40',
          'backdrop-blur-sm hover:backdrop-blur-lg',
          'border border-white/10 hover:border-emerald-500/20',
          'shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10',
          'transition-all duration-500'
        )}
        {...variants}
      >
        <h2 className='mb-4 text-xl font-bold text-white'>Who to follow</h2>
        <div className='flex flex-col gap-3'>
          {randomUsers.map((userId) => (
            <UserCard key={userId} userId={userId} follow />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
