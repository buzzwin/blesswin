import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import { Sparkles, X, Loader2, Calendar, ArrowRight } from 'lucide-react';
import { Modal } from '@components/modal/modal';
import { ImpactMomentInput } from '@components/impact/impact-moment-input';
import { storyReactionLabels, storyReactionIcons, type StoryReactionType, type StoryReactions } from '@lib/types/story-reaction';
import { siteURL } from '@lib/env';
import type { RealStory } from '@lib/types/real-story';
import type { RitualDefinition } from '@lib/types/ritual';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';

interface StoryActionFlowProps {
  story: RealStory;
  onReactionChange?: (reactions: StoryReactions) => void;
}

// Simple click outside hook
function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent): void => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Map story categories to Impact Tags
function mapCategoryToTags(category: RealStory['category']): ImpactTag[] {
  const categoryMap: Record<RealStory['category'], ImpactTag[]> = {
    community: ['community'],
    environment: ['nature'],
    education: ['mind', 'community'],
    health: ['body', 'mind'],
    'social-justice': ['community', 'relationships'],
    innovation: ['mind', 'community']
  };
  return categoryMap[category] || ['community'];
}

// Generate suggested text based on story
function generateSuggestedText(story: RealStory): string {
  return `Inspired by "${story.title}" - ${story.description.substring(0, 100)}...`;
}

export function StoryActionFlow({ story, onReactionChange }: StoryActionFlowProps): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [reactions, setReactions] = useState<StoryReactions>({
    storyId: story.title,
    inspired: [],
    matters_to_me: [],
    reactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [reacting, setReacting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<StoryReactionType | null>(null);
  const [actionType, setActionType] = useState<'moment' | 'rituals' | null>(null);
  const [ritualSuggestions, setRitualSuggestions] = useState<RitualDefinition[]>([]);
  const [ritualLoading, setRitualLoading] = useState(false);
  const [ritualAnalysis, setRitualAnalysis] = useState<{
    connection: string;
    whyTheseRituals: string[];
    personalizedNote?: string;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setMenuOpen(false));

  // Fetch reactions
  useEffect(() => {
    const fetchReactions = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/story-reactions/${encodeURIComponent(story.title)}`);
        if (response.ok) {
        const data = await response.json();
        if (data.success && data.reactions) {
          const reactionsData: StoryReactions = {
            ...data.reactions,
            storyId: data.reactions.storyId || story.title
          };
          setReactions(reactionsData);
          onReactionChange?.(reactionsData);
        }
        }
      } catch (error) {
        console.error('Error fetching story reactions:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchReactions();
  }, [story.title, onReactionChange]);

  const handleReaction = async (reactionType: StoryReactionType): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to react to stories');
      return;
    }

    setMenuOpen(false);
    setReacting(true);

    try {
      const response = await fetch('/api/story-reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storyId: story.title,
          userId: user.id,
          reactionType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to react');
      }

      const data = await response.json();
      
      // Update local state
      const currentReactionUsers = reactions[reactionType] || [];
      const hasReacted = currentReactionUsers.includes(user.id);
      
      const updatedReactions: StoryReactions = { 
        ...reactions,
        storyId: reactions.storyId || story.title
      };
      
      if (hasReacted) {
        // Remove reaction
        updatedReactions[reactionType] = updatedReactions[reactionType].filter(id => id !== user.id);
        updatedReactions.reactionCount = Math.max(0, updatedReactions.reactionCount - 1);
        setReactions(updatedReactions);
        onReactionChange?.(updatedReactions);
        toast.success(`Removed ${storyReactionLabels[reactionType]}`);
        setActionModalOpen(false);
        setSelectedReaction(null);
      } else {
        // Remove from other reaction types if user switched
        const allReactionTypes: StoryReactionType[] = ['inspired', 'matters_to_me'];
        let wasReactedElsewhere = false;
        for (const type of allReactionTypes) {
          if (type !== reactionType && updatedReactions[type].includes(user.id)) {
            wasReactedElsewhere = true;
            updatedReactions[type] = updatedReactions[type].filter(id => id !== user.id);
          }
        }
        
        // Add reaction
        updatedReactions[reactionType] = [...updatedReactions[reactionType], user.id];
        if (!wasReactedElsewhere) {
          updatedReactions.reactionCount += 1;
        }
        
        setReactions(updatedReactions);
        onReactionChange?.(updatedReactions);
        
        // Open action modal for "inspired" reaction
        if (reactionType === 'inspired') {
          setSelectedReaction(reactionType);
          setActionModalOpen(true);
          toast.success('You\'re inspired! ✨ What would you like to do?');
        } else {
          toast.success(`Added ${storyReactionLabels[reactionType]}! ✨`);
        }
      }
    } catch (error) {
      console.error('Error reacting to story:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to react');
    } finally {
      setReacting(false);
    }
  };

  const fetchRitualSuggestions = async (): Promise<void> => {
    setRitualLoading(true);
    try {
      const response = await fetch('/api/story-ritual-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          story,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ritual suggestions');
      }

      const data = await response.json();
      if (data.success) {
        setRitualSuggestions(data.suggestions || []);
        setRitualAnalysis(data.analysis || null);
      }
    } catch (error) {
      console.error('Error fetching ritual suggestions:', error);
      toast.error('Failed to load ritual suggestions');
    } finally {
      setRitualLoading(false);
    }
  };

    const getUserReaction = (): StoryReactionType | null => {
      if (!user?.id) return null;
      const allReactionTypes: StoryReactionType[] = ['inspired', 'matters_to_me'];
    for (const type of allReactionTypes) {
      if (reactions[type].includes(user.id)) {
        return type;
      }
    }
    return null;
  };

  const userReaction = getUserReaction();
  const totalReactions = reactions.reactionCount;

  if (loading) {
    return (
      <div className='flex items-center gap-2'>
        <div className='h-5 w-5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
        <span className='text-sm text-gray-500 dark:text-gray-400'>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className='relative'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!user) {
              toast.error('Please sign in to react to stories');
              return;
            }
            setMenuOpen(!menuOpen);
          }}
          disabled={reacting}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            userReaction
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
          } ${reacting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Sparkles className='h-4 w-4' />
          <span>
            {userReaction ? storyReactionLabels[userReaction] : 'Get Inspired'}
          </span>
          {totalReactions > 0 && (
            <span className='text-xs opacity-75'>({totalReactions})</span>
          )}
        </button>

        {/* Reaction Menu */}
        {menuOpen && (
          <div
            ref={menuRef}
            className='absolute left-0 top-full z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'
          >
            <div className='p-2'>
              {(['inspired', 'matters_to_me'] as StoryReactionType[]).map(
                (reactionType) => {
                  const isActive = reactions[reactionType].includes(user?.id || '');
                  return (
                    <button
                      key={reactionType}
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleReaction(reactionType);
                      }}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        isActive
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className='text-lg'>{storyReactionIcons[reactionType]}</span>
                      <span className='font-medium flex-1'>{storyReactionLabels[reactionType]}</span>
                      {reactions[reactionType].length > 0 && (
                        <span className='text-xs text-gray-500'>
                          {reactions[reactionType].length}
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Modal - Shows when user reacts with "Inspired" */}
      <Modal open={actionModalOpen} closeModal={() => {
        setActionModalOpen(false);
        setActionType(null);
        setRitualSuggestions([]);
        setRitualAnalysis(null);
      }} modalClassName='max-w-2xl'>
        <div className='p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'>
                <Sparkles className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              </div>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                You're Inspired! What's Next?
              </h2>
            </div>
            <button
              onClick={() => {
                setActionModalOpen(false);
                setActionType(null);
                setRitualSuggestions([]);
                setRitualAnalysis(null);
              }}
              className='rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          <div className='mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
            <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
              {story.title}
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {story.description}
            </p>
          </div>

          {!actionType ? (
            <div className='space-y-3'>
              <p className='mb-4 text-gray-700 dark:text-gray-300'>
                Turn your inspiration into action! Choose how you'd like to engage:
              </p>
              
              <button
                onClick={() => setActionType('moment')}
                className='w-full rounded-lg border-2 border-purple-200 bg-purple-50 p-4 text-left transition-colors hover:border-purple-300 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/30'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-600'>
                    <Sparkles className='h-5 w-5 text-white' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      Create Impact Moment
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Share how this story inspires you and document your response
                    </p>
                  </div>
                  <ArrowRight className='h-5 w-5 text-gray-400' />
                </div>
              </button>

              <button
                onClick={() => {
                  // Store story in sessionStorage and navigate to create page
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('ritualStory', JSON.stringify(story));
                  }
                  void router.push('/rituals/create');
                }}
                className='w-full rounded-lg border-2 border-purple-200 bg-purple-50 p-4 text-left transition-colors hover:border-purple-300 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/30'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-600'>
                    <Calendar className='h-5 w-5 text-white' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      Get Ritual Suggestions
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Discover daily rituals that connect to this story's themes
                    </p>
                  </div>
                  <ArrowRight className='h-5 w-5 text-gray-400' />
                </div>
              </button>
            </div>
          ) : actionType === 'moment' ? (
            <div>
              <div className='mb-4 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20'>
                <p className='text-sm text-purple-800 dark:text-purple-200'>
                  ✨ Inspired by: <span className='font-semibold'>{story.title}</span>
                </p>
              </div>

              <ImpactMomentInput
                onSuccess={() => {
                  setActionModalOpen(false);
                  setActionType(null);
                  void router.push('/home');
                }}
                onCancel={() => {
                  setActionType(null);
                }}
                defaultExpanded={true}
                initialText={generateSuggestedText(story)}
                initialTags={mapCategoryToTags(story.category)}
                initialEffortLevel={'medium' as EffortLevel}
                storyId={story.title}
                storyTitle={story.title}
              />
            </div>
          ) : (
            <div>
              {ritualLoading ? (
                <div className='flex flex-col items-center justify-center py-12'>
                  <Loader2 className='mb-4 h-8 w-8 animate-spin text-purple-600' />
                  <p className='text-gray-600 dark:text-gray-400'>
                    Finding rituals that connect to this story...
                  </p>
                </div>
              ) : ritualSuggestions.length > 0 ? (
                <div className='space-y-4'>
                  {ritualAnalysis && (
                    <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
                      <p className='mb-2 text-sm font-semibold text-purple-900 dark:text-purple-200'>
                        Why These Rituals?
                      </p>
                      <p className='mb-2 text-sm text-purple-800 dark:text-purple-300'>
                        {ritualAnalysis.connection}
                      </p>
                      {ritualAnalysis.personalizedNote && (
                        <p className='text-sm text-purple-700 dark:text-purple-400'>
                          {ritualAnalysis.personalizedNote}
                        </p>
                      )}
                    </div>
                  )}

                  <div className='space-y-3'>
                    {ritualSuggestions.map((ritual, idx) => (
                      <div
                        key={ritual.id}
                        className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'
                      >
                        <h4 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                          {ritual.title}
                        </h4>
                        <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
                          {ritual.description}
                        </p>
                        {ritualAnalysis?.whyTheseRituals[idx] && (
                          <p className='text-xs text-purple-600 dark:text-purple-400'>
                            💡 {ritualAnalysis.whyTheseRituals[idx]}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            void router.push('/rituals');
                          }}
                          className='mt-3 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
                        >
                          Add to My Rituals →
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setActionType(null)}
                    className='mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  >
                    Back to Options
                  </button>
                </div>
              ) : (
                <div className='py-8 text-center'>
                  <p className='text-gray-600 dark:text-gray-400'>
                    No ritual suggestions available at this time.
                  </p>
                  <button
                    onClick={() => setActionType(null)}
                    className='mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  >
                    Back to Options
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

