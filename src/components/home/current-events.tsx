import { useState, useEffect } from 'react';
import { Calendar, ExternalLink, Loader2 } from 'lucide-react';

interface CurrentEvent {
  title: string;
  description: string;
  date: string;
  source?: string;
  url?: string;
  category: 'yoga' | 'meditation' | 'world-peace' | 'wellness';
}

const categoryColors = {
  yoga: 'from-green-500 to-emerald-600',
  meditation: 'from-purple-500 to-violet-600',
  'world-peace': 'from-teal-500 to-cyan-600',
  wellness: 'from-pink-500 to-rose-600'
};

const categoryLabels = {
  yoga: 'Yoga',
  meditation: 'Meditation',
  'world-peace': 'World Peace',
  wellness: 'Wellness'
};

export function CurrentEvents(): JSX.Element {
  const [events, setEvents] = useState<CurrentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);
        // Use cacheOnly=true for home page to avoid triggering Gemini calls
        const response = await fetch('/api/current-events?cacheOnly=true');
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching current events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    }

    void fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
      </div>
    );
  }

  if (error || events.length === 0) {
    return <></>; // Don't show anything if there's an error or no events
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    
    // Check for placeholder/invalid URLs
    const invalidPatterns = [
      'example.com',
      'placeholder',
      'test.com',
      'dummy',
      'fake'
    ];
    
    const urlLower = url.toLowerCase();
    if (invalidPatterns.some((pattern) => urlLower.includes(pattern))) {
      return false;
    }
    
    // Validate URL format
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className='space-y-8'>
      <div className='text-center'>
        <h3 className='text-2xl font-normal text-gray-900 dark:text-white md:text-3xl'>
          Current Events
        </h3>
      </div>
      <div className='space-y-6'>
        {events.map((event, idx) => {
          const gradient = categoryColors[event.category] || categoryColors.wellness;
          const categoryLabel = categoryLabels[event.category] || 'Wellness';
          
          const hasValidUrl = isValidUrl(event.url);

          const content = (
            <>
              <div className='mb-2 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400'>
                <span>{categoryLabel}</span>
                <span>•</span>
                <span>{formatDate(event.date)}</span>
              </div>
              <h4 className='mb-2 text-lg font-medium leading-snug text-gray-900 dark:text-white md:text-xl'>
                {event.title}
              </h4>
              <p className='text-base leading-relaxed text-gray-600 dark:text-gray-400'>
                {event.description}
              </p>
            </>
          );

          if (hasValidUrl && event.url) {
            return (
              <a
                key={idx}
                href={event.url}
                target='_blank'
                rel='noopener noreferrer'
                className='block border-b border-gray-200 pb-6 transition-opacity hover:opacity-70 dark:border-gray-700 last:border-0 last:pb-0'
              >
                {content}
              </a>
            );
          }

          return (
            <div
              key={idx}
              className='border-b border-gray-200 pb-6 dark:border-gray-700 last:border-0 last:pb-0'
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

