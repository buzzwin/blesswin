import type { Timestamp } from 'firebase/firestore';
import type { RitualDefinition } from './ritual';

/**
 * Ritual Card - A special type of ritual that's like a greeting card
 * People are invited to sign the card with comments and images
 */
export interface RitualCard extends RitualDefinition {
  type: 'card'; // Distinguishes from regular rituals
  cardType: 'birthday' | 'anniversary' | 'holiday' | 'celebration' | 'custom';
  recipientName?: string; // e.g., "Paul"
  eventDate?: string; // YYYY-MM-DD format
  isInviteOnly: true; // Always true for cards
  invitedEmails: string[]; // List of invited email addresses
  cardSignatures: CardSignature[]; // All signatures/comments on the card
  cardDesign?: {
    backgroundColor?: string;
    borderColor?: string;
    pattern?: 'solid' | 'dots' | 'stripes' | 'hearts' | 'stars';
  };
}

/**
 * A signature/comment on a ritual card
 */
export interface CardSignature {
  id?: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  message: string; // The comment/message
  imageURL?: string; // Optional image attached to signature
  signedAt: Timestamp | Date;
  position?: {
    x: number; // Position on card (0-100 percentage)
    y: number;
  };
}

/**
 * Request to create a ritual card
 */
export interface CreateRitualCardRequest {
  userId: string;
  title: string; // e.g., "Join me in wishing Paul a very happy birthday"
  description: string;
  cardType: 'birthday' | 'anniversary' | 'holiday' | 'celebration' | 'custom';
  recipientName?: string;
  eventDate?: string;
  invitedEmails: string[]; // Email addresses to invite
  cardDesign?: {
    backgroundColor?: string;
    borderColor?: string;
    pattern?: 'solid' | 'dots' | 'stripes' | 'hearts' | 'stars';
  };
}

/**
 * Request to sign a ritual card
 */
export interface SignRitualCardRequest {
  userId: string;
  cardId: string;
  message: string;
  imageFile?: File | string; // File object or base64 string
}

/**
 * Response from signing a card
 */
export interface SignRitualCardResponse {
  success: boolean;
  signatureId?: string;
  error?: string;
}
