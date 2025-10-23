import { useState, useEffect } from 'react';
import {
  Trophy,
  Star,
  Zap,
  Target,
  Crown,
  Award,
  Medal,
  Flame
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button-shadcn';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'rating' | 'social' | 'discovery' | 'streak';
}

interface AchievementSystemProps {
  userStats?: {
    totalRatings: number;
    consecutiveDays: number;
    sharedCount: number;
    discoveredShows: number;
  };
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

export function AchievementSystem({
  userStats,
  onAchievementUnlocked
}: AchievementSystemProps): JSX.Element {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_rating',
      title: 'First Steps',
      description: 'Rate your first show',
      icon: <Star className='h-6 w-6' />,
      points: 10,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      rarity: 'common',
      category: 'rating'
    },
    {
      id: 'rating_master',
      title: 'Rating Master',
      description: 'Rate 50 shows',
      icon: <Trophy className='h-6 w-6' />,
      points: 50,
      unlocked: false,
      progress: 0,
      maxProgress: 50,
      rarity: 'rare',
      category: 'rating'
    },
    {
      id: 'rating_legend',
      title: 'Rating Legend',
      description: 'Rate 200 shows',
      icon: <Crown className='h-6 w-6' />,
      points: 100,
      unlocked: false,
      progress: 0,
      maxProgress: 200,
      rarity: 'epic',
      category: 'rating'
    },
    {
      id: 'streak_starter',
      title: 'Streak Starter',
      description: 'Rate shows for 3 consecutive days',
      icon: <Zap className='h-6 w-6' />,
      points: 25,
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      rarity: 'rare',
      category: 'streak'
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Rate shows for 7 consecutive days',
      icon: <Flame className='h-6 w-6' />,
      points: 75,
      unlocked: false,
      progress: 0,
      maxProgress: 7,
      rarity: 'epic',
      category: 'streak'
    },
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Share your ratings 10 times',
      icon: <Award className='h-6 w-6' />,
      points: 30,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      rarity: 'rare',
      category: 'social'
    },
    {
      id: 'discovery_expert',
      title: 'Discovery Expert',
      description: 'Discover 20 new shows',
      icon: <Target className='h-6 w-6' />,
      points: 40,
      unlocked: false,
      progress: 0,
      maxProgress: 20,
      rarity: 'rare',
      category: 'discovery'
    },
    {
      id: 'taste_master',
      title: 'Taste Master',
      description: 'Get 95%+ match rate',
      icon: <Medal className='h-6 w-6' />,
      points: 100,
      unlocked: false,
      progress: 0,
      maxProgress: 95,
      rarity: 'legendary',
      category: 'rating'
    }
  ]);

  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (userStats) {
      // Update achievement progress based on user stats
      const updatedAchievements = achievements.map((achievement) => {
        let progress = 0;

        switch (achievement.id) {
          case 'first_rating':
          case 'rating_master':
          case 'rating_legend':
          case 'taste_master':
            progress = userStats.totalRatings;
            break;
          case 'streak_starter':
          case 'streak_master':
            progress = userStats.consecutiveDays;
            break;
          case 'social_butterfly':
            progress = userStats.sharedCount;
            break;
          case 'discovery_expert':
            progress = userStats.discoveredShows;
            break;
        }

        const unlocked = progress >= achievement.maxProgress;
        const wasUnlocked = achievement.unlocked;

        // Check if achievement was just unlocked
        if (unlocked && !wasUnlocked && onAchievementUnlocked) {
          onAchievementUnlocked({ ...achievement, unlocked: true, progress });
        }

        return {
          ...achievement,
          progress: Math.min(progress, achievement.maxProgress),
          unlocked
        };
      });

      setAchievements(updatedAchievements);

      // Calculate total points and level
      const unlockedAchievements = updatedAchievements.filter(
        (a) => a.unlocked
      );
      const points = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
      const newLevel = Math.floor(points / 100) + 1;

      setTotalPoints(points);
      setLevel(newLevel);
    }
  }, [userStats]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-400 border-gray-400';
      case 'rare':
        return 'text-blue-400 border-blue-400';
      case 'epic':
        return 'text-purple-400 border-purple-400';
      case 'legendary':
        return 'text-yellow-400 border-yellow-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500/20';
      case 'rare':
        return 'bg-blue-500/20';
      case 'epic':
        return 'bg-purple-500/20';
      case 'legendary':
        return 'bg-yellow-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Level and Points Summary */}
      <Card className='border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg'>
        <CardContent className='p-6 text-center'>
          <div className='mb-4 flex items-center justify-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500'>
              <Crown className='h-8 w-8 text-white' />
            </div>
          </div>
          <h3 className='mb-2 text-2xl font-bold text-white'>Level {level}</h3>
          <p className='mb-4 text-blue-200'>{totalPoints} points earned</p>

          {/* Progress bar to next level */}
          <div className='mb-2 h-3 w-full rounded-full bg-white/20'>
            <div
              className='h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500'
              style={{ width: `${((totalPoints % 100) / 100) * 100}%` }}
            />
          </div>
          <p className='text-sm text-blue-200'>
            {100 - (totalPoints % 100)} points to next level
          </p>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`${getRarityBg(
              achievement.rarity
            )} border ${getRarityColor(
              achievement.rarity
            )} backdrop-blur-lg transition-all duration-300 ${
              achievement.unlocked
                ? 'scale-100 opacity-100'
                : 'scale-95 opacity-60'
            }`}
          >
            <CardContent className='p-4'>
              <div className='flex items-start space-x-3'>
                <div
                  className={`rounded-lg p-2 ${getRarityBg(
                    achievement.rarity
                  )}`}
                >
                  {achievement.icon}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='mb-1 flex items-center justify-between'>
                    <h4
                      className={`text-sm font-bold ${getRarityColor(
                        achievement.rarity
                      )}`}
                    >
                      {achievement.title}
                    </h4>
                    <span className='text-xs text-blue-200'>
                      {achievement.points} pts
                    </span>
                  </div>
                  <p className='mb-2 text-xs text-blue-200'>
                    {achievement.description}
                  </p>

                  {/* Progress bar */}
                  <div className='h-2 w-full rounded-full bg-white/20'>
                    <div
                      className='h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500'
                      style={{
                        width: `${
                          (achievement.progress / achievement.maxProgress) * 100
                        }%`
                      }}
                    />
                  </div>
                  <p className='mt-1 text-xs text-blue-200'>
                    {achievement.progress}/{achievement.maxProgress}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className='flex justify-center space-x-4'>
        <Button
          onClick={() =>
            toast.success('Keep rating shows to unlock more achievements!')
          }
          size='sm'
          className='rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-white hover:from-purple-700 hover:to-pink-700'
        >
          <Star className='mr-2 h-4 w-4' />
          Rate Shows
        </Button>
        <Button
          onClick={() => toast.success('Share your achievements with friends!')}
          size='sm'
          variant='outline'
          className='rounded-full border-white/30 px-4 py-2 text-white hover:bg-white/10'
        >
          <Trophy className='mr-2 h-4 w-4' />
          Share Progress
        </Button>
      </div>
    </div>
  );
}
