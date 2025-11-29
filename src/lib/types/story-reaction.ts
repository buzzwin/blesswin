export type StoryReactionType = 'inspired' | 'matters_to_me';

export interface StoryReaction {
  storyId: string; // Story identifier (title or hash)
  userId: string;
  reactionType: StoryReactionType;
  createdAt: Date | FirebaseFirestore.Timestamp;
}

export interface StoryReactions {
  storyId: string; // Identifier for the story (e.g., title)
  inspired: string[]; // Array of user IDs who reacted 'inspired'
  matters_to_me: string[]; // Array of user IDs who reacted 'matters_to_me'
  reactionCount: number; // Total count of unique reactions
  createdAt?: Date | FirebaseFirestore.Timestamp;
  updatedAt?: Date | FirebaseFirestore.Timestamp;
}

export const storyReactionLabels: Record<StoryReactionType, string> = {
  inspired: 'Inspired by this story',
  matters_to_me: 'This matters to me'
};

export const storyReactionIcons: Record<StoryReactionType, string> = {
  inspired: '✨',
  matters_to_me: '💚'
};

export const storyReactionColors: Record<StoryReactionType, string> = {
  inspired: 'text-purple-600 dark:text-purple-400',
  matters_to_me: 'text-pink-600 dark:text-pink-400'
};

