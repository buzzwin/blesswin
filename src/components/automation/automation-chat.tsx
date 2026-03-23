import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, CheckCircle2, X, Loader2, Bookmark } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { cn } from '@lib/utils';
import { BounceButton } from '@components/animations/bounce-button';
import { MessageWithLinks } from '@components/agent/message-with-links';
import type { ConversationMessage, Automation } from '@lib/types/automation';
import type { AgentPreferences } from '@lib/types/agent';

interface AutomationChatProps {
  onAutomationCreated?: (automation: Automation) => void;
  initialMessage?: string;
  /** Override header (default: Automation Assistant) */
  headerTitle?: string;
  headerSubtitle?: string;
  /** Quick prompts shown above the input (e.g. Ask Buzzwin page) */
  suggestedPrompts?: string[];
  /** Injected into /api/automations/chat for personalization */
  agentPreferences?: AgentPreferences | null;
  /** Show "Save last response" for assistant messages (Ask Buzzwin) */
  enableSavePlan?: boolean;
  placeholder?: string;
}

export function AutomationChat({
  onAutomationCreated,
  initialMessage,
  headerTitle = 'Automation Assistant',
  headerSubtitle = "Let's set up your automation",
  suggestedPrompts,
  agentPreferences,
  enableSavePlan = false,
  placeholder = 'Describe what you want to automate...'
}: AutomationChatProps): JSX.Element {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: 'assistant',
      content: initialMessage || "Hi! I'm here to help you turn desires into clear plans. Share a goal or intention — whether it's about business, health, habits, or something else — and I'll help refine it into actionable steps, identify skills or resources you might need, and suggest timelines and milestones. What would you like to work on?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedAutomation, setSuggestedAutomation] = useState<Partial<Automation> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (): Promise<void> => {
    if (!input.trim() || loading) return;

    if (!user?.id) {
      toast.error('Please sign in to create automations');
      return;
    }

    const userMessage: ConversationMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const historyForApi = [...messages, userMessage];

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call API to process the automation request
      const response = await fetch('/api/automations/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          message: input.trim(),
          conversationHistory: historyForApi,
          agentPreferences: agentPreferences ?? undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process automation request');
      }

      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: data.suggestedAutomation ? {
          suggestedAutomation: data.suggestedAutomation
        } : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If automation was suggested, show it
      if (data.suggestedAutomation) {
        setSuggestedAutomation(data.suggestedAutomation);
      }
    } catch (error) {
      console.error('Error processing automation request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process request');
      
      const errorMessage: ConversationMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Could you try rephrasing your request?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleCreateAutomation = async (): Promise<void> => {
    if (!suggestedAutomation || !user?.id) return;

    try {
      const response = await fetch('/api/automations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...suggestedAutomation,
          conversationHistory: messages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create automation');
      }

      toast.success('Automation created! 🎉');
      setSuggestedAutomation(null);
      onAutomationCreated?.(data.automation);

      // Add confirmation message
      const confirmationMessage: ConversationMessage = {
        role: 'assistant',
        content: `Great! Your automation "${suggestedAutomation.title}" has been created and added to your automation registry. You can view it in the "My Automations" tab, share it with others, or keep it private.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      console.error('Error creating automation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create automation');
    }
  };

  const handleSaveLastAssistant = async (): Promise<void> => {
    if (!user?.id) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant?.content?.trim()) {
      toast.error('No assistant message to save yet');
      return;
    }
    const raw = lastAssistant.content.trim();
    const title =
      raw.split('\n')[0].slice(0, 120) || 'Saved plan';
    try {
      const res = await fetch('/api/agent/save-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title,
          content: raw
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast.success('Plan saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save plan');
    }
  };

  const applySuggestedPrompt = (text: string): void => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div className='flex h-[600px] flex-col rounded-lg border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
      {/* Header */}
      <div className='flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex gap-2 items-center'>
          <div className='flex justify-center items-center w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full'>
            <Sparkles className='w-4 h-4 text-white' />
          </div>
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-white'>{headerTitle}</h3>
            <p className='text-xs text-gray-600 dark:text-gray-400'>{headerSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className='overflow-y-auto flex-1 p-4 space-y-4'>
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2',
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                )}
              >
                {message.role === 'assistant' ? (
                  <p className='text-sm whitespace-pre-wrap'>
                    <MessageWithLinks text={message.content} />
                  </p>
                ) : (
                  <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className='flex justify-start'>
            <div className='px-4 py-2 bg-gray-100 rounded-lg dark:bg-gray-700'>
              <Loader2 className='w-4 h-4 text-gray-600 animate-spin dark:text-gray-400' />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Automation Card */}
      {suggestedAutomation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='p-4 mx-4 mb-4 bg-purple-50 rounded-lg border-2 border-purple-200 dark:border-purple-800 dark:bg-purple-900/20'
        >
          <div className='flex justify-between items-start mb-3'>
            <div>
              <h4 className='font-semibold text-gray-900 dark:text-white'>
                {suggestedAutomation.title}
              </h4>
              {suggestedAutomation.description && (
                <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                  {suggestedAutomation.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setSuggestedAutomation(null)}
              className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
          <div className='flex gap-2'>
            <BounceButton
              variant='secondary'
              size='sm'
              onClick={() => setSuggestedAutomation(null)}
            >
              Edit
            </BounceButton>
            <BounceButton
              variant='primary'
              size='sm'
              onClick={handleCreateAutomation}
            >
              <CheckCircle2 className='mr-2 w-4 h-4' />
              Create Automation
            </BounceButton>
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
        {enableSavePlan && messages.some((m) => m.role === 'assistant') && (
          <div className='mb-3 flex justify-end'>
            <button
              type='button'
              onClick={() => void handleSaveLastAssistant()}
              className='inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-800 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-200 dark:hover:bg-purple-900/50'
            >
              <Bookmark className='h-3.5 w-3.5' />
              Save last response as plan
            </button>
          </div>
        )}
        {suggestedPrompts && suggestedPrompts.length > 0 && (
          <div className='mb-3 flex flex-wrap gap-2'>
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                type='button'
                onClick={() => applySuggestedPrompt(p)}
                className='rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-left text-xs text-gray-700 transition-colors hover:border-purple-300 hover:bg-purple-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-purple-600'
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <div className='flex gap-2'>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder={placeholder}
            className='flex-1 px-4 py-2 text-sm bg-white rounded-lg border-2 border-gray-300 resize-none focus:border-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white'
            rows={2}
            disabled={loading}
          />
          <BounceButton
            variant='primary'
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className='self-end'
          >
            <Send className='w-4 h-4' />
          </BounceButton>
        </div>
      </div>
    </div>
  );
}
