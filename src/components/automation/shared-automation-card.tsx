import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, collection } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import { BounceButton } from '@components/animations/bounce-button';
import { UserAvatar } from '@components/user/user-avatar';
import { Loading } from '@components/ui/loading';
import { cn } from '@lib/utils';
import type { Automation } from '@lib/types/automation';

interface SharedAutomationCardProps {
  automationId: string;
  sourceUserId: string;
  title: string;
  creatorName?: string;
  creatorUsername?: string;
  creatorPhotoURL?: string;
  onUse?: () => void;
}

const categoryColors: Record<string, string> = {
  wellness: 'from-green-500 to-emerald-500',
  productivity: 'from-blue-500 to-cyan-500',
  relationships: 'from-pink-500 to-rose-500',
  health: 'from-red-500 to-orange-500',
  finance: 'from-yellow-500 to-amber-500',
  learning: 'from-purple-500 to-indigo-500',
  other: 'from-gray-500 to-slate-500'
};

const userAutomationsCollection = (userId: string) => 
  collection(db, 'users', userId, 'automations');

export function SharedAutomationCard({
  automationId,
  sourceUserId,
  title,
  creatorName,
  creatorUsername,
  creatorPhotoURL,
  onUse
}: SharedAutomationCardProps): JSX.Element | null {
  const { user } = useAuth();
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAutomation = async (): Promise<void> => {
      try {
        const automationDoc = await getDoc(doc(userAutomationsCollection(sourceUserId), automationId));
        if (automationDoc.exists()) {
          setAutomation({ id: automationDoc.id, ...automationDoc.data() } as Automation);
        }
      } catch (error) {
        console.error('Error fetching automation:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchAutomation();
  }, [automationId, sourceUserId]);

  if (loading) {
    return (
      <div className='my-4 flex items-center justify-center rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
        <Loading />
      </div>
    );
  }

  if (!automation) {
    return null;
  }

  const categoryColor = categoryColors[automation.category] || categoryColors.other;

  const handleUse = async (): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to use automations');
      return;
    }

    try {
      const response = await fetch('/api/automations/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          automationId: automation.id,
          sourceUserId: automation.userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to use automation');
      }

      toast.success('Automation added to your collection! ✨');
      onUse?.();
    } catch (error) {
      console.error('Error using automation:', error);
      toast.error('Failed to use automation');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='my-4 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20'
    >
      <div className='mb-3 flex items-start gap-3'>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br', categoryColor)}>
          <Sparkles className='h-5 w-5 text-white' />
        </div>
        <div className='flex-1'>
          <div className='mb-1 flex items-center gap-2'>
            <h4 className='font-semibold text-gray-900 dark:text-white'>
              Shared Automation
            </h4>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium text-white', `bg-gradient-to-r ${categoryColor}`)}>
              {automation.category}
            </span>
          </div>
          <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
            {title}
          </h3>
          <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
            {automation.description}
          </p>
        </div>
      </div>

      {/* Creator Info */}
      {creatorName && (
        <div className='mb-3 flex items-center gap-2 border-t border-purple-200 pt-3 dark:border-purple-800'>
          <UserAvatar src={creatorPhotoURL ?? 'default-avatar'} alt={creatorName} />
          <div className='flex-1'>
            <p className='text-xs font-medium text-gray-900 dark:text-white'>
              Created by {creatorName}
            </p>
            {creatorUsername && (
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                @{creatorUsername}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className='flex gap-2'>
        <BounceButton
          variant='primary'
          size='sm'
          onClick={handleUse}
          className='flex-1'
        >
          Use This Automation
        </BounceButton>
        <Link href={`/automations?automation=${automation.id}`}>
          <BounceButton
            variant='secondary'
            size='sm'
          >
            View Details
          </BounceButton>
        </Link>
      </div>
    </motion.div>
  );
}
