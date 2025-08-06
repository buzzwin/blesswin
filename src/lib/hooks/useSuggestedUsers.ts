import { useState, useEffect } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import type { User } from '@lib/types/user';

export function useSuggestedUsers(limitCount = 3) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(limitCount));
        const snapshot = await getDocs(q);

        const suggestedUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as User[];

        setUsers(suggestedUsers);
      } catch (error) {
        // console.error('Error fetching suggested users:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchUsers();
  }, [limitCount]);

  return { users, loading };
} 