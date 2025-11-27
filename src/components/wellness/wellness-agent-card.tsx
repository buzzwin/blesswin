import { useRouter } from 'next/router';
import { Flower2, Moon, Waves } from 'lucide-react';
import type { WellnessAgentType } from './wellness-chat';

interface WellnessAgentCardProps {
  agentType: WellnessAgentType;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

const agentIcons = {
  yoga: Flower2,
  meditation: Moon,
  harmony: Waves
};

export function WellnessAgentCard({
  agentType,
  title,
  description,
  icon: Icon,
  gradient
}: WellnessAgentCardProps): JSX.Element {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        void router.push(`/${agentType}`);
      }}
      className='group w-full text-left transition-opacity hover:opacity-80 active:opacity-70'
    >
      <div className='flex flex-col items-center text-center'>
        <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${gradient} md:h-20 md:w-20`}>
          <Icon className='h-8 w-8 text-white md:h-10 md:w-10' />
        </div>
        <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white md:text-xl'>
          {title}
        </h3>
        <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-400 md:text-base'>
          {description}
        </p>
      </div>
    </button>
  );
}

