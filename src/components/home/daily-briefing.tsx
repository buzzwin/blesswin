import { motion } from 'framer-motion';
import { Sparkles, Heart, Calendar } from 'lucide-react';
import { cn } from '@lib/utils';

interface DailyBriefingProps {
  userName?: string;
  dayContext?: 'busy' | 'calm' | 'travel' | 'weekend' | 'stress';
  message?: string;
}

const contextMessages: Record<string, { icon: JSX.Element; message: string; color: string }> = {
  busy: {
    icon: <Calendar className='h-5 w-5' />,
    message: "Today looks full. Let's find small moments of calm.",
    color: 'from-orange-500 to-red-500'
  },
  calm: {
    icon: <Sparkles className='h-5 w-5' />,
    message: 'A gentle day ahead. Perfect for intentional moments.',
    color: 'from-blue-500 to-purple-500'
  },
  travel: {
    icon: <Calendar className='h-5 w-5' />,
    message: 'On the move? Keep your rituals simple and portable.',
    color: 'from-indigo-500 to-blue-500'
  },
  weekend: {
    icon: <Heart className='h-5 w-5' />,
    message: 'Weekend vibes. Time for connection and rest.',
    color: 'from-pink-500 to-rose-500'
  },
  stress: {
    icon: <Heart className='h-5 w-5' />,
    message: 'Feeling heavy? Small rituals can lighten the load.',
    color: 'from-purple-500 to-pink-500'
  }
};

export function DailyBriefing({
  userName,
  dayContext = 'calm',
  message
}: DailyBriefingProps): JSX.Element {
  const context = contextMessages[dayContext] || contextMessages.calm;
  const displayMessage = message || context.message;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border-2 border-transparent bg-gradient-to-br p-4 shadow-sm',
        `bg-gradient-to-br ${context.color}`
      )}
    >
      <div className='flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
          {context.icon}
        </div>
        <div className='flex-1'>
          <h2 className='text-lg font-semibold text-white'>
            {userName ? `Hi ${userName.split(' ')[0]}` : 'Welcome back'}
          </h2>
          <p className='mt-1 text-sm text-white/90'>{displayMessage}</p>
        </div>
      </div>
    </motion.div>
  );
}
