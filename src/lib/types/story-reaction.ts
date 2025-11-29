export type StoryReactionType = 'inspired' | 'want_to_try' | 'sharing' | 'matters_to_me';

export interface StoryReaction {
  storyId: string; // Story identifier (title or hash)
  userId: string;
  reactionType: StoryReactionType;
  createdAt: Date | FirebaseFirestore.Timestamp;
}

export interface StoryReactions {
  inspired: string[]; // user IDs
  want_to_try: string[];
  sharing: string[];
  matters_to_me: string[];
  reactionCount: number;
}

export const storyReactionLabels: Record<StoryReactionType, string> = {
  inspired: 'Inspired by this story',
  want_to_try: 'Want to try this',
  sharing: 'Sharing with my community',
  matters_to_me: 'This matters to me'
};

export const storyReactionIcons: Record<StoryReactionType, string> = {
  inspired: '✨',
  want_to_try: '🎯',
  sharing: '📢',
  matters_to_me: '💚'
};

export const storyReactionColors: Record<StoryReactionType, string> = {
  inspired: 'text-purple-600 dark:text-purple-400',
  want_to_try: 'text-blue-600 dark:text-blue-400',
  sharing: 'text-green-600 dark:text-green-400',
  matters_to_me: 'text-pink-600 dark:text-pink-400'
};

