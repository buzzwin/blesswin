/**
 * Level calculation utilities
 * Calculates user level from karma points (similar to Duolingo's XP system)
 */

/**
 * Calculate level from karma points
 * Uses exponential scaling: level = floor(karma / 100) for levels 1-10,
 * then exponential scaling for higher levels
 * 
 * @param karmaPoints - Total karma points
 * @returns User level
 */
export function calculateLevel(karmaPoints: number): number {
  if (karmaPoints < 0) return 1;
  
  // Levels 1-10: 100 karma per level
  if (karmaPoints < 1000) {
    return Math.floor(karmaPoints / 100) + 1;
  }
  
  // Levels 11+: Exponential scaling
  // Level 11 = 1000 karma
  // Level 12 = 1200 karma
  // Level 13 = 1440 karma
  // etc. (20% increase per level)
  let level = 10;
  let requiredKarma = 1000;
  const multiplier = 1.2;
  
  while (karmaPoints >= requiredKarma) {
    level++;
    requiredKarma = Math.floor(requiredKarma * multiplier);
  }
  
  return level;
}

/**
 * Calculate karma needed for a specific level
 * 
 * @param level - Target level
 * @returns Karma points needed for that level
 */
export function getKarmaForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level <= 10) {
    return (level - 1) * 100;
  }
  
  // Exponential scaling for levels 11+
  let requiredKarma = 1000;
  const multiplier = 1.2;
  
  for (let i = 11; i <= level; i++) {
    requiredKarma = Math.floor(requiredKarma * multiplier);
  }
  
  return requiredKarma;
}

/**
 * Calculate karma needed for next level
 * 
 * @param currentKarma - Current karma points
 * @returns Karma points needed for next level
 */
export function getKarmaForNextLevel(currentKarma: number): number {
  const currentLevel = calculateLevel(currentKarma);
  const nextLevel = currentLevel + 1;
  return getKarmaForLevel(nextLevel);
}

/**
 * Calculate progress percentage to next level
 * 
 * @param currentKarma - Current karma points
 * @returns Progress percentage (0-100)
 */
export function getProgressToNextLevel(currentKarma: number): number {
  const currentLevel = calculateLevel(currentKarma);
  const currentLevelKarma = getKarmaForLevel(currentLevel);
  const nextLevelKarma = getKarmaForLevel(currentLevel + 1);
  const karmaInCurrentLevel = currentKarma - currentLevelKarma;
  const karmaNeededForNextLevel = nextLevelKarma - currentLevelKarma;
  
  if (karmaNeededForNextLevel === 0) return 100;
  
  return Math.min(100, Math.max(0, (karmaInCurrentLevel / karmaNeededForNextLevel) * 100));
}

/**
 * Calculate karma remaining until next level
 * 
 * @param currentKarma - Current karma points
 * @returns Karma points remaining
 */
export function getKarmaRemainingForNextLevel(currentKarma: number): number {
  const nextLevelKarma = getKarmaForNextLevel(currentKarma);
  return Math.max(0, nextLevelKarma - currentKarma);
}

