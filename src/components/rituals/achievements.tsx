import { useState } from 'react';
import { Lock, Trophy, Flame, Users, Sparkles } from 'lucide-react';
import { cn } from '@lib/utils';
import type { Achievement, AchievementCategory } from '@lib/types/ritual';

interface AchievementsProps {
  achievements: Achievement[];
  unlockedAchievementIds: string[];
  userKarma: number;
  userStreak: number;
  userCompletions: number;
  className?: string;
}

// Predefined achievements based on karma milestones
const PREDEFINED_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  // Karma milestones
  { id: 'karma_50', name: 'Getting Started', description: 'Reach 50 karma points', icon: '🌱', category: 'karma', karmaThreshold: 50 },
  { id: 'karma_100', name: 'Rising Star', description: 'Reach 100 karma points', icon: '⭐', category: 'karma', karmaThreshold: 100 },
  { id: 'karma_250', name: 'Making Impact', description: 'Reach 250 karma points', icon: '✨', category: 'karma', karmaThreshold: 250 },
  { id: 'karma_500', name: 'Karma Champion', description: 'Reach 500 karma points', icon: '🏆', category: 'karma', karmaThreshold: 500 },
  { id: 'karma_1000', name: 'Karma Master', description: 'Reach 1,000 karma points', icon: '👑', category: 'karma', karmaThreshold: 1000 },
  { id: 'karma_2500', name: 'Karma Legend', description: 'Reach 2,500 karma points', icon: '🌟', category: 'karma', karmaThreshold: 2500 },
  { id: 'karma_5000', name: 'Karma Deity', description: 'Reach 5,000 karma points', icon: '💫', category: 'karma', karmaThreshold: 5000 },
  
  // Streak achievements
  { id: 'streak_3', name: 'Three Day Streak', description: 'Complete rituals for 3 days in a row', icon: '🔥', category: 'streak', streakThreshold: 3 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Complete rituals for 7 days in a row', icon: '💪', category: 'streak', streakThreshold: 7 },
  { id: 'streak_14', name: 'Two Week Champion', description: 'Complete rituals for 14 days in a row', icon: '🏅', category: 'streak', streakThreshold: 14 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Complete rituals for 30 days in a row', icon: '🎯', category: 'streak', streakThreshold: 30 },
  { id: 'streak_60', name: 'Two Month Hero', description: 'Complete rituals for 60 days in a row', icon: '🦸', category: 'streak', streakThreshold: 60 },
  { id: 'streak_100', name: 'Century Streak', description: 'Complete rituals for 100 days in a row', icon: '💯', category: 'streak', streakThreshold: 100 },
  
  // Completion achievements
  { id: 'completion_10', name: 'Getting Into It', description: 'Complete 10 rituals', icon: '📝', category: 'completion', completionThreshold: 10 },
  { id: 'completion_25', name: 'Regular Ritualist', description: 'Complete 25 rituals', icon: '📋', category: 'completion', completionThreshold: 25 },
  { id: 'completion_50', name: 'Dedicated Practitioner', description: 'Complete 50 rituals', icon: '📚', category: 'completion', completionThreshold: 50 },
  { id: 'completion_100', name: 'Century Club', description: 'Complete 100 rituals', icon: '💯', category: 'completion', completionThreshold: 100 },
  { id: 'completion_250', name: 'Ritual Master', description: 'Complete 250 rituals', icon: '🎖️', category: 'completion', completionThreshold: 250 },
  { id: 'completion_500', name: 'Ritual Legend', description: 'Complete 500 rituals', icon: '🏅', category: 'completion', completionThreshold: 500 },
  
  // Social achievements
  { id: 'social_5', name: 'Community Builder', description: 'Have 5 people join your rituals', icon: '👥', category: 'social' },
  { id: 'social_10', name: 'Influencer', description: 'Have 10 people join your rituals', icon: '📢', category: 'social' },
  { id: 'social_25', name: 'Community Leader', description: 'Have 25 people join your rituals', icon: '👑', category: 'social' }
];

const categoryIcons: Record<AchievementCategory, typeof Trophy> = {
  streak: Flame,
  completion: Trophy,
  social: Users,
  karma: Sparkles
};

const categoryColors: Record<AchievementCategory, string> = {
  streak: 'from-orange-500 to-red-500',
  completion: 'from-blue-500 to-cyan-500',
  social: 'from-purple-500 to-pink-500',
  karma: 'from-yellow-500 to-orange-500'
};

export function Achievements({
  achievements = [],
  unlockedAchievementIds = [],
  userKarma,
  userStreak,
  userCompletions,
  className
}: AchievementsProps): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  
  // Merge predefined achievements with user's achievements
  const allAchievements: Achievement[] = PREDEFINED_ACHIEVEMENTS.map(ach => {
    const userAch = achievements.find(a => a.id === ach.id);
    const isUnlocked = unlockedAchievementIds.includes(ach.id) || 
      (ach.karmaThreshold && userKarma >= ach.karmaThreshold) ||
      (ach.streakThreshold && userStreak >= ach.streakThreshold) ||
      (ach.completionThreshold && userCompletions >= ach.completionThreshold);
    
    return {
      ...ach,
      unlockedAt: userAch?.unlockedAt || (isUnlocked ? new Date() : undefined)
    } as Achievement;
  });

  const filteredAchievements = selectedCategory === 'all'
    ? allAchievements
    : allAchievements.filter(a => a.category === selectedCategory);

  const unlockedCount = allAchievements.filter(a => 
    unlockedAchievementIds.includes(a.id) ||
    (a.karmaThreshold && userKarma >= a.karmaThreshold) ||
    (a.streakThreshold && userStreak >= a.streakThreshold) ||
    (a.completionThreshold && userCompletions >= a.completionThreshold)
  ).length;

  return (
    <div className={cn('space-y-3 md:space-y-4', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-base font-semibold text-gray-900 dark:text-white md:text-lg'>
            Achievements
          </h3>
          <p className='text-xs text-gray-600 dark:text-gray-400 md:text-sm'>
            {unlockedCount} of {allAchievements.length} unlocked
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className='flex flex-wrap gap-1.5 md:gap-2'>
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-medium transition-colors md:px-3 md:py-1.5',
            selectedCategory === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          )}
        >
          All
        </button>
        {(['karma', 'streak', 'completion', 'social'] as AchievementCategory[]).map(category => {
          const Icon = categoryIcons[category];
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors md:gap-1.5 md:px-3 md:py-1.5',
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              )}
            >
              <Icon className='h-3 w-3' />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 md:grid-cols-4 lg:grid-cols-5'>
        {filteredAchievements.map(achievement => {
          const isUnlocked = unlockedAchievementIds.includes(achievement.id) ||
            (achievement.karmaThreshold && userKarma >= achievement.karmaThreshold) ||
            (achievement.streakThreshold && userStreak >= achievement.streakThreshold) ||
            (achievement.completionThreshold && userCompletions >= achievement.completionThreshold);
          
          const Icon = categoryIcons[achievement.category];
          const colorClass = categoryColors[achievement.category];

          return (
            <div
              key={achievement.id}
              className={cn(
                'group relative flex flex-col items-center rounded-lg border-2 p-2 transition-all md:rounded-xl md:p-3 lg:p-4',
                isUnlocked
                  ? `border-transparent bg-gradient-to-br ${colorClass} bg-opacity-10`
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              )}
              title={achievement.description}
            >
              {isUnlocked ? (
                <>
                  <div className='mb-1 text-2xl md:mb-2 md:text-3xl lg:text-4xl'>{achievement.icon}</div>
                  <h4 className='mb-0.5 text-center text-xs font-semibold text-gray-900 dark:text-white md:mb-1'>
                    {achievement.name}
                  </h4>
                  <p className='hidden text-center text-xs text-gray-600 dark:text-gray-400 md:block'>
                    {achievement.description}
                  </p>
                </>
              ) : (
                <>
                  <div className='mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 md:mb-2 md:h-10 md:w-10 lg:h-12 lg:w-12'>
                    <Lock className='h-4 w-4 text-gray-400 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                  </div>
                  <h4 className='mb-0.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 md:mb-1'>
                    Locked
                  </h4>
                  <p className='hidden text-center text-xs text-gray-400 dark:text-gray-500 md:block'>
                    {achievement.description}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

