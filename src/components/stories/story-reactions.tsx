import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import { storyReactionLabels, storyReactionIcons, storyReactionColors, type StoryReactionType, type StoryReactions } from '@lib/types/story-reaction';

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

interface StoryReactionsProps {
  storyId: string;
  storyTitle: string;
  onReactionChange?: (reactions: StoryReactions) => void;
}

export function StoryReactions({ storyId, storyTitle, onReactionChange }: StoryReactionsProps): JSX.Element {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<StoryReactions>({
    inspired: [],
    want_to_try: [],
    sharing: [],
    matters_to_me: [],
    reactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [reacting, setReacting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setMenuOpen(false));

  // Fetch reactions
  useEffect(() => {
    const fetchReactions = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/story-reactions/${encodeURIComponent(storyId)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.reactions) {
            setReactions(data.reactions);
            onReactionChange?.(data.reactions);
          }
        }
      } catch (error) {
        console.error('Error fetching story reactions:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchReactions();
  }, [storyId, onReactionChange]);

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
          storyId,
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
      
      const updatedReactions = { ...reactions };
      
      if (hasReacted) {
        // Remove reaction
        updatedReactions[reactionType] = updatedReactions[reactionType].filter(id => id !== user.id);
        updatedReactions.reactionCount = Math.max(0, updatedReactions.reactionCount - 1);
        toast.success(`Removed ${storyReactionLabels[reactionType]}`);
      } else {
        // Remove from other reaction types if user switched
        const allReactionTypes: StoryReactionType[] = ['inspired', 'want_to_try', 'sharing', 'matters_to_me'];
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
        toast.success(`Added ${storyReactionLabels[reactionType]}! ✨`);
      }

      setReactions(updatedReactions);
      onReactionChange?.(updatedReactions);
    } catch (error) {
      console.error('Error reacting to story:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to react');
    } finally {
      setReacting(false);
    }
  };

  const getUserReaction = (): StoryReactionType | null => {
    if (!user?.id) return null;
    const allReactionTypes: StoryReactionType[] = ['inspired', 'want_to_try', 'sharing', 'matters_to_me'];
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
            ? `${storyReactionColors[userReaction]} bg-opacity-10 hover:bg-opacity-20`
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        } ${reacting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Sparkles className={`h-4 w-4 ${userReaction ? storyReactionColors[userReaction] : ''}`} />
        <span>
          {userReaction ? storyReactionLabels[userReaction] : 'React'}
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
            {(['inspired', 'want_to_try', 'sharing', 'matters_to_me'] as StoryReactionType[]).map(
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
  );
}

