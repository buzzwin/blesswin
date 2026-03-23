import { motion } from 'framer-motion';
import { Share2, TrendingUp, Clock, Zap } from 'lucide-react';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import { BounceButton } from '@components/animations/bounce-button';
import { UserAvatar } from '@components/user/user-avatar';
import { cn } from '@lib/utils';
import type { AutomationRegistryEntry } from '@lib/types/automation';

interface AutomationCardProps {
  entry: AutomationRegistryEntry;
  onSelect?: (entry: AutomationRegistryEntry) => void;
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

export function AutomationCard({
  entry,
  onSelect
}: AutomationCardProps): JSX.Element {
  const { user } = useAuth();
  const { automation, creator, stats } = entry;

  const handleShare = async (): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to share automations');
      return;
    }

    try {
      // Create an impact moment to share this automation
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
            automationId: automation.id,
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

  const handleUse = async (): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to use automations');
      return;
    }

    try {
      // Copy automation to user's collection
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
      onSelect?.(entry);
    } catch (error) {
      console.error('Error using automation:', error);
      toast.error('Failed to use automation');
    }
  };

  const categoryColor = categoryColors[automation.category] || categoryColors.other;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className='group relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white p-5 transition-all hover:border-purple-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600'
    >
      {/* Category Badge */}
      <div className='mb-3 flex items-center justify-between'>
        <span
          className={cn(
            'rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white',
            categoryColor
          )}
        >
          {automation.category}
        </span>
        {stats.sharedCount > 0 && (
          <div className='flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400'>
            <TrendingUp className='h-3 w-3' />
            <span>{stats.sharedCount}</span>
          </div>
        )}
      </div>

      {/* Title & Description */}
      <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
        {automation.title}
      </h3>
      <p className='mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
        {automation.description}
      </p>

      {/* Triggers & Actions Preview */}
      <div className='mb-4 space-y-2'>
        <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500'>
          <Clock className='h-3 w-3' />
          <span>
            {automation.triggers.length} trigger{automation.triggers.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500'>
          <Zap className='h-3 w-3' />
          <span>
            {automation.actions.length} action{automation.actions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Creator */}
      <div className='mb-4 flex items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-700'>
        <UserAvatar src={creator.photoURL ?? 'default-avatar'} alt={creator.name} />
        <div className='flex-1'>
          <p className='text-xs font-medium text-gray-900 dark:text-white'>
            {creator.name}
          </p>
          <p className='text-xs text-gray-600 dark:text-gray-400'>
            @{creator.username}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-2'>
        <BounceButton
          variant='primary'
          size='sm'
          onClick={handleUse}
          className='flex-1'
        >
          Use This
        </BounceButton>
        <BounceButton
          variant='secondary'
          size='sm'
          onClick={handleShare}
        >
          <Share2 className='h-4 w-4' />
        </BounceButton>
      </div>
    </motion.div>
  );
}
