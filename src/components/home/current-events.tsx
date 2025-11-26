import { useState, useEffect } from 'react';
import { Calendar, ExternalLink, Loader2, Sparkles } from 'lucide-react';

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
        const response = await fetch('/api/current-events');
        
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
    <div className='space-y-4'>
      <div className='mb-6 flex items-center gap-2'>
        <Sparkles className='h-5 w-5 text-gray-600 dark:text-gray-400' />
        <h3 className='text-lg font-light text-gray-900 dark:text-white'>
          Current Events
        </h3>
      </div>
      <div className='space-y-3'>
        {events.map((event, idx) => {
          const gradient = categoryColors[event.category] || categoryColors.wellness;
          const categoryLabel = categoryLabels[event.category] || 'Wellness';
          
          const hasValidUrl = isValidUrl(event.url);

          const content = (
            <>
              <div className='mb-2 flex items-start justify-between gap-2'>
                <div className='flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <span
                      className={`inline-block rounded-full bg-gradient-to-r ${gradient} px-2 py-0.5 text-xs font-medium text-white`}
                    >
                      {categoryLabel}
                    </span>
                    <span className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                      <Calendar className='h-3 w-3' />
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <h4 className='mb-1 text-sm font-semibold text-gray-900 dark:text-white'>
                    {event.title}
                  </h4>
                </div>
                {hasValidUrl && (
                  <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                    <ExternalLink className='h-3 w-3' />
                    <span>Link</span>
                  </div>
                )}
              </div>
              <p className='text-xs leading-relaxed text-gray-600 dark:text-gray-300'>
                {event.description}
              </p>
              {event.source && (
                <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                  Source: {event.source}
                </p>
              )}
            </>
          );

          if (hasValidUrl && event.url) {
            return (
              <a
                key={idx}
                href={event.url}
                target='_blank'
                rel='noopener noreferrer'
                className='group block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
              >
                {content}
              </a>
            );
          }

          return (
            <div
              key={idx}
              className='group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800'
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

