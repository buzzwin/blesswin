import { useState, useEffect } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { usersCollection } from '@lib/firebase/collections';

export function useFollowUser(targetUserId: string) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (user?.following) {
      setIsFollowing(user.following.includes(targetUserId));
    }
  }, [user?.following, targetUserId]);

  const toggleFollow = async () => {
    if (!user) return;

    const userRef = doc(usersCollection, user.id);
    const targetUserRef = doc(usersCollection, targetUserId);

    try {
      if (isFollowing) {
        await updateDoc(userRef, {
          following: arrayRemove(targetUserId)
        });
        await updateDoc(targetUserRef, {
          followers: arrayRemove(user.id)
        });
      } else {
        await updateDoc(userRef, {
          following: arrayUnion(targetUserId)
        });
        await updateDoc(targetUserRef, {
          followers: arrayUnion(user.id)
        });
      }
    } catch (error) {
      // console.error('Error toggling follow:', error);
    }
  };

  return { isFollowing, toggleFollow };
} 