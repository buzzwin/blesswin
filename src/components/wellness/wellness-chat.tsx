import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Send, X, Moon, Flower2, Waves, Sparkles } from 'lucide-react';
import { Button } from '@components/ui/button-shadcn';

import { RitualFormModal } from '@components/rituals/ritual-form-modal';
import type { RitualDefinition } from '@lib/types/ritual';
import { Plus } from 'lucide-react';

export type WellnessAgentType = 'yoga' | 'meditation' | 'harmony' | 'wellness';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  agentType?: WellnessAgentType;
  ritualSuggestion?: Partial<RitualDefinition>;
}

interface WellnessChatProps {
  agentType: WellnessAgentType;
  onClose?: () => void;
  className?: string;
  onLoginRequest?: () => void;
  userId?: string;
}

const agentConfig = {
  wellness: {
    name: 'Wellness AI Pal',
    icon: Sparkles,
    color: 'from-purple-500 to-teal-500',
    initialMessage: 'Hello! I\'m your Wellness AI Pal, your complete wellness companion. I can help you with yoga poses and sequences, meditation and mindfulness practices, finding inner peace and harmony, and creating personalized wellness rituals. Whether you\'re looking to start a new practice or deepen an existing one, I\'m here to guide you. What would you like to explore today?',
    suggestions: [
      'Yoga for beginners',
      'Meditation techniques',
      'Finding inner peace',
      'Wellness rituals'
    ]
  },
  yoga: {
    name: 'Yoga AI Pal',
    icon: Flower2,
    color: 'from-green-500 to-emerald-600',
    initialMessage: 'Namaste! I\'m your Yoga AI Pal. I can help you with poses, sequences, breathing techniques, and finding the perfect practice for your needs. What would you like to explore today?',
    suggestions: [
      'Morning yoga routine',
      'Yoga for stress relief',
      'Beginner-friendly poses',
      'Yoga for better sleep'
    ]
  },
  meditation: {
    name: 'Meditation & Mindfulness AI Pal',
    icon: Moon,
    color: 'from-purple-500 to-violet-600',
    initialMessage: 'Welcome! I\'m your Meditation & Mindfulness AI Pal. I can help you start or deepen your meditation practice, cultivate present-moment awareness, and guide you through mindfulness techniques. What brings you here today?',
    suggestions: [
      'Guided meditation',
      'Mindfulness exercises',
      'Meditation for beginners',
      'Mindful breathing techniques'
    ]
  },
  harmony: {
    name: 'Harmony AI Pal',
    icon: Waves,
    color: 'from-teal-500 to-cyan-600',
    initialMessage: 'Peace be with you! I\'m your Harmony AI Pal, dedicated to helping you find balance, inner peace, and harmony in all aspects of life. Together, we can work towards world peace, one peaceful thought at a time. How can I help you today?',
    suggestions: [
      'Finding inner peace',
      'Living in harmony',
      'Peaceful daily practices',
      'Spreading positive energy'
    ]
  }
};

export function WellnessChat({
  agentType,
  onClose,
  className,
  onLoginRequest,
  userId
}: WellnessChatProps): JSX.Element {
  const config = agentConfig[agentType];
  const AgentIcon = config.icon;
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const initialMessages: Message[] = [
    {
      id: '1',
      role: 'agent',
      agentType,
      content: config.initialMessage
    }
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRitualModal, setShowRitualModal] = useState(false);
  const [selectedRitual, setSelectedRitual] = useState<Partial<RitualDefinition> | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || showLoginPrompt) return;

    const newUserMessageCount = userMessageCount + 1;
    setUserMessageCount(newUserMessageCount);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/wellness-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          agentType,
          userId
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        agentType,
        content: data.message || 'I\'m here to support your wellness journey. How can I help you further?',
        ritualSuggestion: data.ritualSuggestion
      };

      setMessages((prev) => [...prev, agentMessage]);

      if (newUserMessageCount >= 3 && !showLoginPrompt && !userId) {
        setShowLoginPrompt(true);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        agentType,
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or sign in for a more personalized experience.'
      };
      setMessages((prev) => [...prev, errorMessage]);

      if (newUserMessageCount >= 3 && !showLoginPrompt) {
        setShowLoginPrompt(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex h-full flex-col ${className ?? ''}`}>
      {/* Header */}
      {onClose && (
        <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${config.color}`}>
              <AgentIcon className='h-4 w-4 text-white' />
            </div>
            <div>
              <h3 className='text-sm font-bold text-gray-900 dark:text-white'>
                {config.name}
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Your AI wellness companion
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            size='icon'
            variant='ghost'
            className='h-8 w-8'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className='flex-1 space-y-4 overflow-y-auto p-4'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.role === 'agent' && (
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${config.color} ring-4 ${config.color.replace('from-', 'ring-').replace(' to-', '/30')}`}>
                <AgentIcon className='h-5 w-5 text-white' />
              </div>
            )}

            <div
              className={`group relative max-w-[85%] flex-1 rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
                message.role === 'user'
                  ? 'border border-gray-100 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                  : `border border-transparent bg-gradient-to-br ${config.color.replace('from-', 'from-').replace(' to-', '/10 to-').replace('to-', '')}/5 to-white/50 dark:to-gray-900/50`
              }`}
            >
              {message.role === 'agent' && (
                <div className='mb-2 flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700/50'>
                  <span className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                    {config.name}
                  </span>
                </div>
              )}

              <div
                className={`prose prose-sm max-w-none leading-relaxed ${
                  message.role === 'user'
                    ? 'text-gray-700 dark:text-gray-200'
                    : 'text-gray-800 dark:text-gray-100'
                }`}
              >
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className='mb-1 last:mb-0'>
                    {line}
                  </p>
                ))}
              </div>


              {message.ritualSuggestion && (
                <button
                  onClick={() => {
                    setSelectedRitual(message.ritualSuggestion);
                    setShowRitualModal(true);
                  }}
                  className={`mt-3 flex items-center gap-1.5 rounded-lg border border-${config.color.split('-')[1]}-200 bg-${config.color.split('-')[1]}-50 px-3 py-1.5 text-xs font-semibold text-${config.color.split('-')[1]}-700 transition-colors hover:bg-${config.color.split('-')[1]}-100 dark:border-${config.color.split('-')[1]}-800 dark:bg-${config.color.split('-')[1]}-900/30 dark:text-${config.color.split('-')[1]}-300 dark:hover:bg-${config.color.split('-')[1]}-900/50`}
                >
                  <Plus className='h-3.5 w-3.5' />
                  Create Ritual
                </button>
              )}
            </div>

            {message.role === 'user' && (
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-blue-400/50'>
                <Heart className='h-5 w-5 text-white' />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className='flex items-start gap-3'>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${config.color}`}>
              <AgentIcon className='h-5 w-5 animate-pulse text-white' />
            </div>
            <div className={`rounded-2xl border border-opacity-30 bg-gradient-to-br ${config.color} bg-opacity-10 p-4 dark:bg-opacity-20`}>
              <div className='flex gap-1'>
                <div className={`h-2 w-2 animate-bounce rounded-full bg-opacity-60 ${config.color.split(' ')[0].replace('from-', 'bg-')}`} />
                <div
                  className={`h-2 w-2 animate-bounce rounded-full bg-opacity-60 ${config.color.split(' ')[0].replace('from-', 'bg-')}`}
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className={`h-2 w-2 animate-bounce rounded-full bg-opacity-60 ${config.color.split(' ')[0].replace('from-', 'bg-')}`}
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className='border-t border-gray-100 bg-gray-50/50 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50'>
          <p className='mb-3 text-xs font-medium text-gray-500 dark:text-gray-400'>
            Suggested topics:
          </p>
          <div className='flex flex-wrap gap-2'>
            {config.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(suggestion);
                  setTimeout(() => {
                    void handleSend();
                  }, 100);
                }}
                className={`rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-${config.color.split('-')[1]}-200 hover:text-${config.color.split('-')[1]}-600 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-${config.color.split('-')[1]}-500 dark:hover:text-${config.color.split('-')[1]}-400`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className={`border-t border-gray-200 bg-gradient-to-r ${config.color} bg-opacity-10 p-4 dark:border-gray-700`}>
          <div className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
            <div className='mb-2 flex items-center gap-2'>
              <Heart className={`h-4 w-4 ${config.color.split(' ')[0].replace('from-', 'text-')}`} />
              <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                Continue Your Wellness Journey
              </p>
            </div>
            <p className='mb-3 text-xs text-gray-600 dark:text-gray-400'>
              Sign in to save your progress, get personalized recommendations, and access your wellness history.
            </p>
            {onLoginRequest ? (
              <Button
                onClick={onLoginRequest}
                className={`w-full rounded-lg bg-gradient-to-r ${config.color} text-white hover:opacity-90`}
              >
                <Heart className='mr-2 h-4 w-4' />
                Sign In to Continue
              </Button>
            ) : (
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Sign in to unlock personalized wellness guidance
              </p>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer Notice */}
      <div className='border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/50'>
        <p className='text-[10px] leading-relaxed text-gray-600 dark:text-gray-400'>
          <strong className='text-gray-700 dark:text-gray-300'>Disclaimer:</strong> This platform does not provide medical advice. 
          Consult a healthcare professional before starting any wellness practice. 
          <Link href='/disclaimer' className='ml-1 underline hover:text-gray-900 dark:hover:text-gray-200'>
            Learn more
          </Link>
        </p>
      </div>

      {/* Input */}
      <div className='border-t border-gray-200 p-4 dark:border-gray-700'>
        {showLoginPrompt ? (
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-3 text-center dark:border-gray-700 dark:bg-gray-800'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              👆 Sign in above to continue your wellness journey
            </p>
          </div>
        ) : (
          <div className='flex gap-2'>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={`Ask ${config.name}...`}
              className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
              disabled={loading || showLoginPrompt}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading || showLoginPrompt}
              className={`h-10 rounded-lg bg-gradient-to-r ${config.color} px-4 py-2 text-white hover:opacity-90 disabled:opacity-50`}
            >
              <Send className='h-4 w-4' />
            </Button>
          </div>
        )}
      </div>

      {/* Ritual Creation Modal */}
      {showRitualModal && (
        <RitualFormModal
          open={showRitualModal}
          closeModal={() => setShowRitualModal(false)}
          ritual={selectedRitual as RitualDefinition}
          onSuccess={() => {
            setShowRitualModal(false);
            // Optional: Add a system message confirming creation
          }}
        />
      )}
    </div>
  );
}

