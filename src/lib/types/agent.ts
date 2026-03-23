import type { Timestamp } from 'firebase/firestore';

/**
 * Lightweight memory for the Ask Buzzwin / agent chat (opt-in, user-editable).
 */
export type AgentPreferences = {
  dietary?: string;
  typicalOutingDay?: string;
  venueStyles?: string[];
  notes?: string;
};

/**
 * A saved plan from an assistant reply (user-triggered save).
 */
export type SavedPlan = {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Timestamp | Date;
};
