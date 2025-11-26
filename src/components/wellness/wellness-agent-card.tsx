import { useState } from 'react';
import { useRouter } from 'next/router';
import { Flower2, Moon, Waves, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@components/ui/button-shadcn';
import { WellnessChat, type WellnessAgentType } from './wellness-chat';
import { hasAcceptedDisclaimer } from './disclaimer-modal';

interface WellnessAgentCardProps {
  agentType: WellnessAgentType;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  onLoginRequest?: () => void;
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
  gradient,
  onLoginRequest
}: WellnessAgentCardProps): JSX.Element {
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className='group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
        
        {/* Content */}
        <div className='relative'>
          {/* Icon */}
          <div className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className='h-8 w-8 text-white' />
          </div>

          {/* Title */}
          <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
            {title}
          </h3>

          {/* Description */}
          <p className='mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
            {description}
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => {
              // Check if disclaimer accepted, if not, redirect to the page which will show the modal
              if (!hasAcceptedDisclaimer()) {
                void router.push(`/${agentType}`);
              } else {
                void router.push(`/${agentType}`);
              }
            }}
            className={`w-full rounded-lg bg-gradient-to-r ${gradient} text-white shadow-md transition-all hover:scale-105 hover:shadow-lg`}
          >
            <span className='flex items-center gap-2'>
              <Heart className='h-4 w-4' />
              Start Your Journey
              <ArrowRight className='h-4 w-4' />
            </span>
          </Button>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50'>
          <div className='relative h-full w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900'>
            <WellnessChat
              agentType={agentType}
              onClose={() => setShowChat(false)}
              className='h-full'
              onLoginRequest={onLoginRequest}
            />
          </div>
        </div>
      )}
    </>
  );
}

