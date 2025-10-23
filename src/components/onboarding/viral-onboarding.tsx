import { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  Zap,
  Target,
  Crown,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@components/ui/button-shadcn';
import { Card, CardContent } from '@components/ui/card';

interface Genre {
  id: string;
  name: string;
  emoji: string;
  selected: boolean;
}

interface Platform {
  id: string;
  name: string;
  logo: string;
  selected: boolean;
}

interface ViralOnboardingProps {
  onComplete: (preferences: any) => void;
  onSkip: () => void;
}

export function ViralOnboarding({
  onComplete,
  onSkip
}: ViralOnboardingProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);
  const [genres, setGenres] = useState<Genre[]>([
    { id: 'action', name: 'Action', emoji: '💥', selected: false },
    { id: 'comedy', name: 'Comedy', emoji: '😂', selected: false },
    { id: 'drama', name: 'Drama', emoji: '🎭', selected: false },
    { id: 'horror', name: 'Horror', emoji: '👻', selected: false },
    { id: 'romance', name: 'Romance', emoji: '💕', selected: false },
    { id: 'thriller', name: 'Thriller', emoji: '🔪', selected: false },
    { id: 'sci-fi', name: 'Sci-Fi', emoji: '🚀', selected: false },
    { id: 'fantasy', name: 'Fantasy', emoji: '🧙‍♂️', selected: false },
    { id: 'mystery', name: 'Mystery', emoji: '🔍', selected: false },
    { id: 'documentary', name: 'Documentary', emoji: '📚', selected: false },
    { id: 'animation', name: 'Animation', emoji: '🎨', selected: false },
    { id: 'musical', name: 'Musical', emoji: '🎵', selected: false }
  ]);

  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 'netflix', name: 'Netflix', logo: '🔴', selected: false },
    { id: 'hulu', name: 'Hulu', logo: '🟢', selected: false },
    { id: 'disney', name: 'Disney+', logo: '🔵', selected: false },
    { id: 'hbo', name: 'HBO Max', logo: '🟣', selected: false },
    { id: 'amazon', name: 'Prime Video', logo: '🔵', selected: false },
    { id: 'apple', name: 'Apple TV+', logo: '⚪', selected: false },
    { id: 'paramount', name: 'Paramount+', logo: '🔵', selected: false },
    { id: 'peacock', name: 'Peacock', logo: '🟦', selected: false }
  ]);

  const [swipeCount, setSwipeCount] = useState(0);
  const [demoShows, setDemoShows] = useState([
    { id: 1, title: 'The Bear', genre: 'Comedy', rating: 8.5, poster: '🍳' },
    { id: 2, title: 'Succession', genre: 'Drama', rating: 9.2, poster: '👔' },
    { id: 3, title: 'Wednesday', genre: 'Comedy', rating: 8.1, poster: '🖤' }
  ]);
  const [currentShowIndex, setCurrentShowIndex] = useState(0);

  const steps = [
    {
      title: 'What genres make you binge?',
      subtitle: 'Pick up to 5 favorites',
      icon: <Target className='h-8 w-8' />
    },
    {
      title: 'Where do you watch?',
      subtitle: 'Select your streaming platforms',
      icon: <Sparkles className='h-8 w-8' />
    },
    {
      title: 'Try the magic!',
      subtitle: 'Swipe through some shows',
      icon: <Heart className='h-8 w-8' />
    },
    {
      title: "You're ready!",
      subtitle: "Let's create your account",
      icon: <Crown className='h-8 w-8' />
    }
  ];

  const handleGenreToggle = (genreId: string) => {
    const selectedCount = genres.filter((g) => g.selected).length;
    const genre = genres.find((g) => g.id === genreId);

    if (genre) {
      if (genre.selected) {
        genre.selected = false;
      } else if (selectedCount < 5) {
        genre.selected = true;
      } else {
        toast.error('You can select up to 5 genres');
        return;
      }
      setGenres([...genres]);
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    const selectedCount = platforms.filter((p) => p.selected).length;
    const platform = platforms.find((p) => p.id === platformId);

    if (platform) {
      if (platform.selected) {
        platform.selected = false;
      } else if (selectedCount < 4) {
        platform.selected = true;
      } else {
        toast.error('You can select up to 4 platforms');
        return;
      }
      setPlatforms([...platforms]);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeCount((prev) => prev + 1);

    if (direction === 'right') {
      toast.success(`Loved ${demoShows[currentShowIndex].title}! ❤️`);
    } else {
      toast.success(`Passed on ${demoShows[currentShowIndex].title} 👎`);
    }

    setTimeout(() => {
      setCurrentShowIndex((prev) => (prev + 1) % demoShows.length);
    }, 1000);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      const selectedGenres = genres.filter((g) => g.selected);
      if (selectedGenres.length === 0) {
        toast.error('Please select at least one genre');
        return;
      }
    }

    if (currentStep === 1) {
      const selectedPlatforms = platforms.filter((p) => p.selected);
      if (selectedPlatforms.length === 0) {
        toast.error('Please select at least one platform');
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const preferences = {
        genres: genres.filter((g) => g.selected).map((g) => g.id),
        platforms: platforms.filter((p) => p.selected).map((p) => p.id),
        swipeCount
      };
      onComplete(preferences);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: {
        return (
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
            {genres.map((genre) => (
              <Card
                key={genre.id}
                className={`cursor-pointer transition-all duration-200 ${
                  genre.selected
                    ? 'scale-105 transform border-purple-400 bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
                onClick={() => handleGenreToggle(genre.id)}
              >
                <CardContent className='p-4 text-center'>
                  <div className='mb-2 text-3xl'>{genre.emoji}</div>
                  <div className='text-sm font-semibold'>{genre.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      }

      case 1: {
        return (
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
            {platforms.map((platform) => (
              <Card
                key={platform.id}
                className={`cursor-pointer transition-all duration-200 ${
                  platform.selected
                    ? 'scale-105 transform border-blue-400 bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
                onClick={() => handlePlatformToggle(platform.id)}
              >
                <CardContent className='p-4 text-center'>
                  <div className='mb-2 text-3xl'>{platform.logo}</div>
                  <div className='text-sm font-semibold'>{platform.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      }

      case 2: {
        const currentShow = demoShows[currentShowIndex];
        return (
          <div className='mx-auto max-w-sm'>
            <Card className='border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg'>
              <CardContent className='p-8 text-center'>
                <div className='mb-4 text-6xl'>{currentShow.poster}</div>
                <h3 className='mb-2 text-2xl font-bold text-white'>
                  {currentShow.title}
                </h3>
                <p className='mb-4 text-blue-200'>
                  {currentShow.genre} • ⭐ {currentShow.rating}
                </p>
                <p className='mb-6 text-blue-200'>
                  Swipe left to pass, right to love!
                </p>

                <div className='flex justify-center space-x-4'>
                  <Button
                    onClick={() => handleSwipe('left')}
                    size='lg'
                    className='rounded-full bg-red-500 px-6 py-3 text-white hover:bg-red-600'
                  >
                    👎 Pass
                  </Button>
                  <Button
                    onClick={() => handleSwipe('right')}
                    size='lg'
                    className='rounded-full bg-green-500 px-6 py-3 text-white hover:bg-green-600'
                  >
                    ❤️ Love
                  </Button>
                </div>

                <div className='mt-4 text-sm text-blue-200'>
                  Swipes: {swipeCount} • Show {currentShowIndex + 1} of{' '}
                  {demoShows.length}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      case 3: {
        const selectedGenres = genres.filter((g) => g.selected);
        const selectedPlatforms = platforms.filter((p) => p.selected);
        return (
          <div className='text-center'>
            <div className='mb-6'>
              <div className='mb-4 text-6xl'>🎉</div>
              <h3 className='mb-4 text-2xl font-bold text-white'>Perfect!</h3>
              <p className='mb-6 text-blue-200'>
                We've learned your taste! Now let's create your account to start
                getting personalized recommendations.
              </p>
            </div>

            <div className='mb-6 rounded-xl bg-white/10 p-4'>
              <h4 className='mb-3 font-semibold text-white'>
                Your Preferences:
              </h4>
              <div className='mb-3 flex flex-wrap justify-center gap-2'>
                {selectedGenres.map((genre) => (
                  <span
                    key={genre.id}
                    className='rounded-full bg-purple-500/30 px-3 py-1 text-sm text-white'
                  >
                    {genre.emoji} {genre.name}
                  </span>
                ))}
              </div>
              <div className='flex flex-wrap justify-center gap-2'>
                {selectedPlatforms.map((platform) => (
                  <span
                    key={platform.id}
                    className='rounded-full bg-blue-500/30 px-3 py-1 text-sm text-white'
                  >
                    {platform.logo} {platform.name}
                  </span>
                ))}
              </div>
            </div>

            <div className='text-sm text-blue-200'>
              <Check className='mr-1 inline h-4 w-4' />
              {swipeCount} swipes completed
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4'>
      <div className='w-full max-w-2xl'>
        {/* Progress Bar */}
        <div className='mb-8'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='font-semibold text-white'>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className='text-blue-200'>
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className='h-2 w-full rounded-full bg-white/20'>
            <div
              className='h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500'
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className='mb-8 border-white/20 bg-white/10 backdrop-blur-lg'>
          <CardContent className='p-8'>
            <div className='mb-8 text-center'>
              <div className='mb-4 flex justify-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500'>
                  {steps[currentStep].icon}
                </div>
              </div>
              <h2 className='mb-2 text-3xl font-bold text-white'>
                {steps[currentStep].title}
              </h2>
              <p className='text-blue-200'>{steps[currentStep].subtitle}</p>
            </div>

            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className='flex items-center justify-between'>
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            variant='outline'
            className='border-white/30 text-white hover:bg-white/10'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>

          <div className='flex space-x-4'>
            <Button
              onClick={onSkip}
              variant='ghost'
              className='text-blue-200 hover:text-white'
            >
              Skip for now
            </Button>

            <Button
              onClick={handleNext}
              className='bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            >
              {currentStep === steps.length - 1 ? 'Create Account' : 'Next'}
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
