import { useState, useEffect } from 'react';
import { useAuth } from '@lib/context/auth-context';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { RealStory } from '@lib/types/real-story';

interface StoryBookmarkButtonProps {
  story: RealStory;
  className?: string;
  onBookmarkChange?: (bookmarked: boolean) => void;
}

export function StoryBookmarkButton({ 
  story, 
  className = '',
  onBookmarkChange 
}: StoryBookmarkButtonProps): JSX.Element {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check bookmark status on mount
  useEffect(() => {
    const checkBookmarkStatus = async (): Promise<void> => {
      if (!user?.id) {
        setChecking(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/story-bookmarks/check?userId=${encodeURIComponent(user.id)}&storyId=${encodeURIComponent(story.title)}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setBookmarked(data.bookmarked);
            onBookmarkChange?.(data.bookmarked);
          }
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      } finally {
        setChecking(false);
      }
    };

    void checkBookmarkStatus();
  }, [user?.id, story.title, onBookmarkChange]);

  const handleToggleBookmark = async (): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to bookmark stories');
      return;
    }

    setLoading(true);

    try {
      if (bookmarked) {
        // Unbookmark
        const response = await fetch('/api/story-bookmarks', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            storyId: story.title
          })
        });

        if (!response.ok) {
          throw new Error('Failed to remove bookmark');
        }

        setBookmarked(false);
        onBookmarkChange?.(false);
        toast.success('Removed from bookmarks');
        
        // Trigger a custom event to refresh bookmarked stories list
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('storyUnbookmarked', { detail: { storyId: story.title } }));
        }
      } else {
        // Bookmark
        const response = await fetch('/api/story-bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            story: story
          })
        });

        if (!response.ok) {
          throw new Error('Failed to bookmark story');
        }

        setBookmarked(true);
        onBookmarkChange?.(true);
        toast.success('Story bookmarked! 📚');
        
        // Trigger a custom event to refresh bookmarked stories list
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('storyBookmarked', { detail: { storyId: story.title } }));
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-gray-400 ${className}`}
      >
        <Bookmark className='h-4 w-4' />
        <span>...</span>
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        void handleToggleBookmark();
      }}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        bookmarked
          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {bookmarked ? (
        <>
          <BookmarkCheck className='h-4 w-4' />
          <span>Saved</span>
        </>
      ) : (
        <>
          <Bookmark className='h-4 w-4' />
          <span>Save</span>
        </>
      )}
    </button>
  );
}

