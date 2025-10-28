import { useState, useRef, useEffect } from 'react';
import { Bot, Users, Send, Trophy, Star, X } from 'lucide-react';
import { Button } from '@components/ui/button-shadcn';

interface Message {
  id: string;
  role: 'user' | 'curator';
  content: string;
  curatorName?: string;
  badges?: Array<{ text: string; icon?: React.ReactNode }>;
  suggestions?: string[];
}

interface CuratorChatProps {
  onClose?: () => void;
  className?: string;
  onLoginRequest?: () => void;
  userId?: string; // For authenticated chat
}

export function CuratorChat({
  onClose,
  className,
  onLoginRequest,
  userId
}: CuratorChatProps): JSX.Element {
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // Will show after 3 messages

  // Different initial messages for authenticated vs unauthenticated users
  const initialMessages: Message[] = userId
    ? [
        {
          id: '1',
          role: 'curator',
          curatorName: 'CineWolf-93',
          content:
            "Hey! I've analyzed your taste profile. What are you in the mood for tonight?",
          badges: [
            { text: 'WIN STREAK: 7', icon: <Trophy className='h-3 w-3' /> },
            { text: '95% match', icon: <Star className='h-3 w-3' /> }
          ],
          suggestions: [
            'Dark thrillers from 2024',
            'Popular sci-fi series',
            'Comedy shows under 30 min'
          ]
        }
      ]
    : [
        {
          id: '1',
          role: 'user',
          content:
            'What should I watch tonight? Feeling something dark but not depressing.'
        },
        {
          id: '2',
          role: 'curator',
          curatorName: 'CineWolf-93',
          content:
            "I've got 3 dark-smart thrillers under 40 min per ep. Want me to battle FilmSnob.AI for the best pick?",
          badges: [
            { text: 'WIN STREAK: 7', icon: <Trophy className='h-3 w-3' /> },
            { text: '95% match', icon: <Star className='h-3 w-3' /> }
          ]
        },
        {
          id: '3',
          role: 'curator',
          curatorName: 'FilmSnob.AI',
          content:
            "Respectfully, your picks are mid. Here's what actually matters..."
        },
        {
          id: '4',
          role: 'curator',
          curatorName: 'CineWolf-93',
          content:
            "Hold up. My human's watched 847 shows. I know them scarily well. Let's battle."
        }
      ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || showLoginPrompt) return;

    // Track user messages (excluding the initial demo message)
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
      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role === 'user' ? ('user' as const) : ('curator' as const),
        content: msg.content,
        curatorName: msg.curatorName
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: apiMessages, userId })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const curatorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'curator',
        curatorName: data.curatorName,
        content: data.message,
        badges:
          data.curatorName === 'CineWolf-93'
            ? [
                { text: 'WIN STREAK: 7', icon: <Trophy className='h-3 w-3' /> },
                { text: '95% match', icon: <Star className='h-3 w-3' /> }
              ]
            : undefined,
        suggestions: data.suggestions || []
      };

      setMessages((prev) => [...prev, curatorMessage]);

      // Show login prompt after 3 user messages (after response is received)
      if (newUserMessageCount >= 3 && !showLoginPrompt) {
        setShowLoginPrompt(true);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'curator',
        curatorName: 'CineWolf-93',
        content: "Sorry, I'm having trouble connecting. Try again?"
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Show login prompt even on error if threshold reached
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
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500'>
              <Bot className='h-4 w-4 text-white' />
            </div>
            <div>
              <h3 className='text-sm font-bold text-gray-900 dark:text-white'>
                Chat with Your Curator
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Ask CineWolf-93 anything
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
            {message.role === 'curator' && (
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  message.curatorName === 'CineWolf-93'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 ring-4 ring-purple-500/30'
                    : 'bg-gray-600 ring-2 ring-gray-500/50'
                }`}
              >
                <Bot className='h-5 w-5 text-white' />
              </div>
            )}

            <div
              className={`max-w-[80%] flex-1 rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'border border-gray-200 bg-gray-50 dark:border-white/20 dark:bg-white/10'
                  : message.curatorName === 'CineWolf-93'
                  ? 'border border-purple-400/30 bg-purple-50 dark:border-purple-400/30 dark:bg-purple-500/20'
                  : 'border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/5'
              }`}
            >
              {message.role === 'curator' && (
                <div className='mb-1 flex items-center gap-2'>
                  <span className='text-[10px] font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-200'>
                    {message.curatorName}
                  </span>
                  {message.curatorName === 'CineWolf-93' && (
                    <span className='rounded-full bg-purple-200 px-2 py-0.5 text-[9px] font-medium text-purple-700 dark:bg-purple-400/20 dark:text-purple-200'>
                      Your Curator
                    </span>
                  )}
                </div>
              )}

              <p
                className={`text-sm ${
                  message.role === 'user'
                    ? 'text-gray-900 dark:text-white'
                    : message.curatorName === 'CineWolf-93'
                    ? 'text-purple-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {message.content}
              </p>

              {message.badges && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {message.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className='inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-[10px] font-semibold text-purple-700 dark:bg-purple-500/30 dark:text-purple-200'
                    >
                      {badge.icon}
                      {badge.text}
                    </span>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions &&
                message.suggestions.length > 0 &&
                message.role === 'curator' && (
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={async () => {
                          if (loading || showLoginPrompt) return;

                          // Increment user message count
                          const newUserMessageCount = userMessageCount + 1;
                          setUserMessageCount(newUserMessageCount);

                          // Set input and send immediately
                          const userMessage: Message = {
                            id: Date.now().toString(),
                            role: 'user',
                            content: suggestion.trim()
                          };
                          setMessages((prev) => [...prev, userMessage]);
                          setLoading(true);

                          try {
                            const apiMessages = [...messages, userMessage].map(
                              (msg) => ({
                                role:
                                  msg.role === 'user'
                                    ? ('user' as const)
                                    : ('curator' as const),
                                content: msg.content,
                                curatorName: msg.curatorName
                              })
                            );

                            const response = await fetch('/api/chat', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                messages: apiMessages,
                                userId
                              })
                            });

                            if (!response.ok)
                              throw new Error('Failed to get response');

                            const data = await response.json();

                            const curatorMessage: Message = {
                              id: (Date.now() + 1).toString(),
                              role: 'curator',
                              curatorName: data.curatorName,
                              content: data.message,
                              badges:
                                data.curatorName === 'CineWolf-93'
                                  ? [
                                      {
                                        text: 'WIN STREAK: 7',
                                        icon: <Trophy className='h-3 w-3' />
                                      },
                                      {
                                        text: '95% match',
                                        icon: <Star className='h-3 w-3' />
                                      }
                                    ]
                                  : undefined,
                              suggestions: data.suggestions || []
                            };

                            setMessages((prev) => [...prev, curatorMessage]);

                            // Show login prompt after 3 user messages (after response is received)
                            if (newUserMessageCount >= 3 && !showLoginPrompt) {
                              setShowLoginPrompt(true);
                            }
                          } catch (error) {
                            console.error('Chat error:', error);

                            // Show login prompt even on error if threshold reached
                            if (newUserMessageCount >= 3 && !showLoginPrompt) {
                              setShowLoginPrompt(true);
                            }
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading || showLoginPrompt}
                        className='dark:hover:bg-purple-950/20 rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-xs font-medium text-purple-700 transition-all hover:border-purple-400 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-700 dark:bg-gray-800 dark:text-purple-300'
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {message.role === 'user' && (
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 ring-2 ring-blue-400/50'>
                <Users className='h-5 w-5 text-white' />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-400'>
              <Bot className='h-5 w-5 animate-pulse text-white' />
            </div>
            <div className='rounded-2xl border border-gray-200 bg-gray-100 p-4 dark:border-white/10 dark:bg-white/5'>
              <div className='flex gap-1'>
                <div className='h-2 w-2 animate-bounce rounded-full bg-gray-400' />
                <div
                  className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className='dark:from-purple-950/20 dark:to-pink-950/20 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-gray-700'>
          <div className='rounded-lg border border-purple-200 bg-white p-4 dark:border-purple-800 dark:bg-gray-800'>
            <div className='mb-2 flex items-center gap-2'>
              <Trophy className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                Get Personal Recommendations
              </p>
            </div>
            <p className='mb-3 text-xs text-gray-600 dark:text-gray-400'>
              Sign in to get personalized show recommendations based on your
              taste profile. Your Curator learns from your ratings to suggest
              perfect matches.
            </p>
            {onLoginRequest ? (
              <Button
                onClick={() => {
                  if (onLoginRequest) {
                    onLoginRequest();
                  }
                }}
                className='w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
              >
                <Bot className='mr-2 h-4 w-4' />
                Sign In to Continue
              </Button>
            ) : (
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Sign in to unlock personalized recommendations
              </p>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className='border-t border-gray-200 p-4 dark:border-gray-700'>
        {showLoginPrompt ? (
          <div className='dark:bg-purple-950/20 rounded-lg border border-purple-200 bg-purple-50 p-3 text-center dark:border-purple-800'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              👆 Sign in above to continue chatting with your Curator
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
              placeholder='Ask your Curator...'
              className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
              disabled={loading || showLoginPrompt}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading || showLoginPrompt}
              className='h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-white hover:from-purple-500 hover:to-pink-500 disabled:opacity-50'
            >
              <Send className='h-4 w-4' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
