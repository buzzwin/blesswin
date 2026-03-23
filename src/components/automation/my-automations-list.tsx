import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trash2, Share2, Edit2, Power, PowerOff } from 'lucide-react';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import { BounceButton } from '@components/animations/bounce-button';
import { Loading } from '@components/ui/loading';
import { cn } from '@lib/utils';
import type { Automation } from '@lib/types/automation';

const userAutomationsCollection = (userId: string) => 
  collection(db, 'users', userId, 'automations');

const categoryColors: Record<string, string> = {
  wellness: 'from-green-500 to-emerald-500',
  productivity: 'from-blue-500 to-cyan-500',
  relationships: 'from-pink-500 to-rose-500',
  health: 'from-red-500 to-orange-500',
  finance: 'from-yellow-500 to-amber-500',
  learning: 'from-purple-500 to-indigo-500',
  other: 'from-gray-500 to-slate-500'
};

export function MyAutomationsList(): JSX.Element {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      void fetchAutomations();
    }
  }, [user?.id]);

  const fetchAutomations = async (): Promise<void> => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const q = query(
        userAutomationsCollection(user.id),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const automationList: Automation[] = [];
      
      snapshot.forEach((doc) => {
        automationList.push({
          id: doc.id,
          ...doc.data()
        } as Automation);
      });

      setAutomations(automationList);
    } catch (error) {
      console.error('Error fetching automations:', error);
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (automation: Automation): Promise<void> => {
    if (!user?.id || !automation.id) return;

    try {
      await updateDoc(doc(userAutomationsCollection(user.id), automation.id), {
        isActive: !automation.isActive
      });
      toast.success(`Automation ${!automation.isActive ? 'activated' : 'deactivated'}`);
      void fetchAutomations();
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast.error('Failed to update automation');
    }
  };

  const handleDelete = async (automation: Automation): Promise<void> => {
    if (!user?.id || !automation.id) return;

    if (!confirm(`Are you sure you want to delete "${automation.title}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(userAutomationsCollection(user.id), automation.id));
      toast.success('Automation deleted');
      void fetchAutomations();
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast.error('Failed to delete automation');
    }
  };

  const handleShare = async (automation: Automation): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to share automations');
      return;
    }

    try {
      const shareText = `Check out this automation: "${automation.title}" - ${automation.description}\n\nUse it yourself or customize it for your needs!`;
      
      const response = await fetch('/api/impact-moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          text: shareText,
          tags: ['community'],
          effortLevel: 'tiny',
          isPublic: true,
          automationId: automation.id,
          automationShare: {
            automationId: automation.id || '',
            sourceUserId: automation.userId,
            title: automation.title
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to share automation');
      }

      toast.success('Automation shared to your feed! 🌱');
    } catch (error) {
      console.error('Error sharing automation:', error);
      toast.error('Failed to share automation');
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loading />
      </div>
    );
  }

  if (automations.length === 0) {
    return (
      <div className='rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-900/50'>
        <Sparkles className='mx-auto mb-3 h-12 w-12 text-gray-400' />
        <p className='mb-4 text-sm font-medium text-gray-600 dark:text-gray-400'>
          Your running automations will appear here — track progress, get reminders, and adapt as you go.
        </p>
        <BounceButton
          variant='primary'
          onClick={() => window.location.href = '/automations?tab=create'}
        >
          Plan with AI
        </BounceButton>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {automations.map((automation, index) => {
        const categoryColor = categoryColors[automation.category] || categoryColors.other;
        
        return (
          <motion.div
            key={automation.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='rounded-lg border-2 border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800'
          >
            <div className='mb-3 flex items-start justify-between'>
              <div className='flex-1'>
                <div className='mb-2 flex items-center gap-2'>
                  <span
                    className={cn(
                      'rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white',
                      categoryColor
                    )}
                  >
                    {automation.category}
                  </span>
                  {automation.isActive ? (
                    <span className='flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400'>
                      <Power className='h-3 w-3' />
                      Active
                    </span>
                  ) : (
                    <span className='flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400'>
                      <PowerOff className='h-3 w-3' />
                      Inactive
                    </span>
                  )}
                </div>
                <h3 className='mb-1 text-lg font-semibold text-gray-900 dark:text-white'>
                  {automation.title}
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {automation.description}
                </p>
              </div>
            </div>

            {/* Triggers & Actions */}
            <div className='mb-4 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50'>
              <div>
                <p className='mb-1 text-xs font-medium text-gray-500 dark:text-gray-400'>
                  Triggers
                </p>
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {automation.triggers.length} trigger{automation.triggers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p className='mb-1 text-xs font-medium text-gray-500 dark:text-gray-400'>
                  Actions
                </p>
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {automation.actions.length} action{automation.actions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-2'>
              <BounceButton
                variant='secondary'
                size='sm'
                onClick={() => handleToggleActive(automation)}
              >
                {automation.isActive ? (
                  <>
                    <PowerOff className='mr-2 h-4 w-4' />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className='mr-2 h-4 w-4' />
                    Activate
                  </>
                )}
              </BounceButton>
              <BounceButton
                variant='secondary'
                size='sm'
                onClick={() => handleShare(automation)}
              >
                <Share2 className='mr-2 h-4 w-4' />
                Share
              </BounceButton>
              <BounceButton
                variant='secondary'
                size='sm'
                onClick={() => handleDelete(automation)}
                className='text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </BounceButton>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
