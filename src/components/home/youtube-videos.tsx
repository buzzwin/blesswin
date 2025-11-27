import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Calendar, Eye, Loader2, Youtube } from 'lucide-react';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
  category: 'yoga' | 'meditation';
}

interface YouTubeVideosProps {
  category?: 'yoga' | 'meditation' | 'all';
  limit?: number;
}

const categoryColors = {
  yoga: 'from-green-500 to-emerald-600',
  meditation: 'from-purple-500 to-violet-600'
};

const categoryLabels = {
  yoga: 'Yoga',
  meditation: 'Meditation'
};

export function YouTubeVideos({
  category = 'all',
  limit = 6
}: YouTubeVideosProps): JSX.Element {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          category,
          limit: limit.toString()
        });

        const response = await fetch(`/api/youtube-videos?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch videos');
        }

        const data = await response.json();
        console.log('YouTube videos response:', data);
        setVideos(data.videos || []);
      } catch (err) {
        console.error('Error fetching YouTube videos:', err);
        setError(err instanceof Error ? err.message : 'Failed to load videos');
      } finally {
        setLoading(false);
      }
    }

    void fetchVideos();
  }, [category, limit]);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-12 text-center'>
        <div className='mx-auto max-w-2xl rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20'>
          <p className='mb-4 font-semibold text-yellow-900 dark:text-yellow-200'>
            {error.includes('not enabled') || error.includes('blocked')
              ? 'YouTube Data API v3 Not Enabled'
              : error.includes('YouTube API key')
              ? 'YouTube API Key Not Configured'
              : 'Unable to Load Videos'}
          </p>
          <p className='mb-4 text-sm text-yellow-800 dark:text-yellow-300'>
            {error.includes('not enabled') || error.includes('blocked')
              ? 'The YouTube Data API v3 needs to be enabled in Google Cloud Console for your API key.'
              : error.includes('YouTube API key')
              ? 'Please add NEXT_PUBLIC_YOUTUBE_API_KEY to your environment variables.'
              : error}
          </p>
          <div className='text-xs text-yellow-700 dark:text-yellow-400'>
            <p className='mb-2 font-medium'>To fix this:</p>
            <ol className='list-inside list-decimal space-y-1 text-left'>
              <li>Go to{' '}
                <a
                  href='https://console.cloud.google.com/apis/library/youtube.googleapis.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='underline hover:text-yellow-900 dark:hover:text-yellow-200'
                >
                  Google Cloud Console - YouTube Data API v3
                </a>
              </li>
              <li>Select your project</li>
              <li>Click &quot;Enable&quot; to enable the API</li>
              <li>Wait a few minutes for the changes to propagate</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className='py-12 text-center'>
        <p className='text-gray-600 dark:text-gray-400'>
          No videos found. Please check your YouTube API configuration.
        </p>
      </div>
    );
  }

  const formatViewCount = (count?: string): string => {
    if (!count) return '';
    const num = parseInt(count, 10);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    }
    return `${num} views`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return dateString;
    }
  };

  const openVideo = (videoId: string): void => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <h3 className='text-2xl font-normal text-gray-900 dark:text-white md:text-3xl'>
          Trending Videos
        </h3>
        <Link href='/videos'>
          <a className='text-sm text-gray-600 underline dark:text-gray-400'>
            View All
          </a>
        </Link>
      </div>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
        {videos.map((video) => {
          const gradient = categoryColors[video.category] || categoryColors.meditation;
          const categoryLabel = categoryLabels[video.category] || 'Wellness';

          return (
            <button
              key={video.videoId}
              onClick={() => openVideo(video.videoId)}
              className='group w-full text-left transition-opacity hover:opacity-70'
            >
              <div className='relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700'>
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  layout='fill'
                  objectFit='cover'
                />
              </div>
              <h4 className='mb-1 line-clamp-2 text-base font-medium leading-snug text-gray-900 dark:text-white'>
                {video.title}
              </h4>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {video.channelTitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

