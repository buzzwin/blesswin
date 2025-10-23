import { useState, useRef } from 'react';
import {
  Share2,
  Download,
  Copy,
  Heart,
  Star,
  Zap,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@components/ui/button-shadcn';
import { Card, CardContent } from '@components/ui/card';

interface ViralShareGeneratorProps {
  userStats?: {
    totalRatings: number;
    topGenres: string[];
    favoriteShows: string[];
    matchRate: number;
  };
  className?: string;
}

export function ViralShareGenerator({
  userStats,
  className = ''
}: ViralShareGeneratorProps): JSX.Element {
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateViralContent = async () => {
    setIsGenerating(true);

    // Simulate content generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const content = {
      title: 'My Buzzwin Journey 🔥',
      stats: userStats || {
        totalRatings: 127,
        topGenres: ['Thriller', 'Drama', 'Comedy'],
        favoriteShows: ['The Bear', 'Succession', 'Wednesday'],
        matchRate: 94
      },
      quote: 'This app predicted my taste perfectly! 🔮',
      hashtags: ['#Buzzwin', '#MovieRecs', '#AI', '#Entertainment']
    };

    generateShareableImage(content);
    setIsGenerating(false);
  };

  const generateShareableImage = (content: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1080;
    canvas.height = 1080;

    // Create gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(0.5, '#EC4899');
    gradient.addColorStop(1, '#3B82F6');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2
      );
    }

    // Add title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(content.title as string, canvas.width / 2, 120);

    // Add stats
    ctx.font = 'bold 36px Arial';
    ctx.fillText(
      `${content.stats.totalRatings} Shows Rated`,
      canvas.width / 2,
      200
    );
    ctx.fillText(
      `${content.stats.matchRate}% Match Rate`,
      canvas.width / 2,
      260
    );

    // Add top genres
    ctx.font = '24px Arial';
    ctx.fillText(
      `Top Genres: ${content.stats.topGenres.join(', ')}`,
      canvas.width / 2,
      320
    );

    // Add quote
    ctx.font = 'italic 32px Arial';
    ctx.fillText(content.quote as string, canvas.width / 2, 400);

    // Add hashtags
    ctx.font = '20px Arial';
    ctx.fillText(content.hashtags.join(' '), canvas.width / 2, 480);

    // Add app logo placeholder
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height - 200, 200, 100);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Buzzwin', canvas.width / 2, canvas.height - 150);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'buzzwin-stats.png';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Shareable image downloaded!');
      }
    });
  };

  const copyToClipboard = async () => {
    const text =
      '🔥 Just discovered my perfect show match on Buzzwin! \n\n📊 My Stats:\n• ' +
      (userStats?.totalRatings || 127) +
      ' shows rated\n• ' +
      (userStats?.matchRate || 94) +
      '% match rate\n• Top genres: ' +
      (userStats?.topGenres?.join(', ') || 'Thriller, Drama') +
      '\n\nThis AI actually gets my taste! Try it: buzzwin.com\n\n#Buzzwin #MovieRecs #AI #Entertainment';

    void navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Buzzwin Journey',
          text: 'Just discovered my perfect show match on Buzzwin! This AI actually gets my taste. Try it: buzzwin.com',
          url: window.location.origin
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card
      className={`border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg ${className}`}
    >
      <CardContent className='p-6'>
        <div className='mb-6 text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500'>
              <Share2 className='h-8 w-8 text-white' />
            </div>
          </div>
          <h3 className='mb-2 text-2xl font-bold text-white'>
            Share Your Journey
          </h3>
          <p className='text-blue-200'>
            Generate shareable content about your entertainment taste
          </p>
        </div>

        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <Button
            onClick={generateViralContent}
            disabled={isGenerating}
            className='flex flex-col items-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white hover:from-purple-700 hover:to-pink-700'
          >
            <Download className='mb-2 h-6 w-6' />
            <span className='text-sm font-semibold'>
              {isGenerating ? 'Generating...' : 'Create Image'}
            </span>
          </Button>

          <Button
            onClick={shareNative}
            variant='outline'
            className='flex flex-col items-center rounded-xl border-white/30 p-4 text-white hover:bg-white/10'
          >
            <Share2 className='mb-2 h-6 w-6' />
            <span className='text-sm font-semibold'>Share Native</span>
          </Button>

          <Button
            onClick={copyToClipboard}
            variant='outline'
            className='flex flex-col items-center rounded-xl border-white/30 p-4 text-white hover:bg-white/10'
          >
            <Copy className='mb-2 h-6 w-6' />
            <span className='text-sm font-semibold'>Copy Text</span>
          </Button>
        </div>

        {/* Stats Preview */}
        <div className='mb-4 rounded-xl bg-white/10 p-4'>
          <h4 className='mb-3 text-lg font-bold text-white'>Your Stats</h4>
          <div className='grid grid-cols-2 gap-4 text-center'>
            <div>
              <div className='text-2xl font-bold text-yellow-400'>
                {userStats?.totalRatings || 127}
              </div>
              <div className='text-sm text-blue-200'>Shows Rated</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-green-400'>
                {userStats?.matchRate || 94}%
              </div>
              <div className='text-sm text-blue-200'>Match Rate</div>
            </div>
          </div>
        </div>

        <div className='text-center'>
          <p className='text-sm text-blue-200'>
            Share your journey and help friends discover their next obsession!
            🎬
          </p>
        </div>

        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} className='hidden' width={1080} height={1080} />
      </CardContent>
    </Card>
  );
}
