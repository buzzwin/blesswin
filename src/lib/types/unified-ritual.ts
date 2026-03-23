import type { Timestamp } from 'firebase/firestore';
import type { ImpactTag, EffortLevel } from './impact-moment';
import type { RitualTimeOfDay, RitualScope, RitualFrequency } from './ritual';
import type { AutomationTrigger, AutomationAction } from './automation';

/**
 * Unified Ritual - Combines rituals and automations into a single model
 * 
 * Key differences:
 * - Manual rituals: no triggers, user completes manually
 * - Automations: has triggers, runs automatically
 * - Both can be completable and shareable if user chooses
 */
export interface UnifiedRitual {
  // Core identity
  id?: string;
  userId: string;
  title: string;
  description: string;
  
  // Ritual-like properties
  tags: ImpactTag[];
  effortLevel: EffortLevel;
  suggestedTimeOfDay: RitualTimeOfDay;
  durationEstimate: string;
  prefillTemplate?: string;
  icon?: string;
  frequency?: RitualFrequency; // RRULE format
  
  // Automation-like properties
  triggers?: AutomationTrigger[]; // If empty/undefined, it's a manual ritual
  actions?: AutomationAction[]; // If empty/undefined, default action is "complete ritual"
  category?: 'wellness' | 'productivity' | 'relationships' | 'health' | 'finance' | 'learning' | 'other';
  
  // Social features (user choice)
  isPublic: boolean; // Shareable in registry
  isJoinable: boolean; // Others can join this ritual/automation
  isCompletable: boolean; // Can be completed and create impact moments
  
  // Status
  isActive: boolean; // For automations with triggers
  scope: RitualScope;
  
  // Metadata
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  joinedByUsers?: string[];
  usageCount?: number;
  completionRate?: number;
  
  // Legacy fields for migration
  _legacyType?: 'ritual' | 'automation';
  createdBy?: string; // For backward compatibility
  sourceUserId?: string; // For backward compatibility
  sourceRitualId?: string; // For backward compatibility
  createdFromMomentId?: string; // If ritual was created from a moment
  fromRealStory?: boolean;
  storyId?: string;
  storyTitle?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Timestamp | Date;
  }>;
}

/**
 * Migration helpers to convert old types to unified model
 */
export function ritualToUnified(ritual: any): UnifiedRitual {
  return {
    id: ritual.id,
    userId: ritual.createdBy || ritual.userId || ritual.sourceUserId || '',
    title: ritual.title,
    description: ritual.description,
    tags: ritual.tags || [],
    effortLevel: ritual.effortLevel,
    suggestedTimeOfDay: ritual.suggestedTimeOfDay || 'anytime',
    durationEstimate: ritual.durationEstimate || '5 minutes',
    prefillTemplate: ritual.prefillTemplate,
    icon: ritual.icon,
    frequency: ritual.frequency,
    // Automation properties - empty for manual rituals
    triggers: undefined,
    actions: undefined,
    category: undefined,
    // Social features - default based on scope
    isPublic: ritual.scope === 'public' || ritual.scope === 'global',
    isJoinable: ritual.scope === 'public' || ritual.scope === 'global',
    isCompletable: true, // Rituals are always completable
    // Status
    isActive: true, // Manual rituals are always "active"
    scope: ritual.scope || 'personalized',
    // Metadata
    createdAt: ritual.createdAt,
    updatedAt: ritual.updatedAt,
    joinedByUsers: ritual.joinedByUsers || [],
    usageCount: ritual.usageCount || 0,
    completionRate: ritual.completionRate || 0,
    // Legacy
    _legacyType: 'ritual',
    createdBy: ritual.createdBy,
    sourceUserId: ritual.sourceUserId,
    sourceRitualId: ritual.sourceRitualId,
    createdFromMomentId: ritual.createdFromMomentId,
    fromRealStory: ritual.fromRealStory,
    storyId: ritual.storyId,
    storyTitle: ritual.storyTitle
  };
}

export function automationToUnified(automation: any): UnifiedRitual {
  // Map category to tags
  const categoryToTags: Record<string, ImpactTag[]> = {
    wellness: ['mind', 'body'],
    productivity: ['mind'],
    relationships: ['relationships'],
    health: ['body'],
    finance: ['mind'],
    learning: ['mind'],
    other: ['mind']
  };

  const tags = categoryToTags[automation.category || 'other'] || ['mind'];

  return {
    id: automation.id,
    userId: automation.userId,
    title: automation.title,
    description: automation.description,
    // Map automation category to ritual tags
    tags,
    effortLevel: 'tiny', // Default for automations
    suggestedTimeOfDay: 'anytime',
    durationEstimate: '5 minutes', // Default
    prefillTemplate: `Completed automation: ${automation.title}`,
    // Automation properties
    triggers: automation.triggers || [],
    actions: automation.actions || [],
    category: automation.category,
    // Social features - based on isPublic
    isPublic: automation.isPublic || false,
    isJoinable: automation.isPublic || false, // Only public automations are joinable
    isCompletable: automation.actions?.some((a: any) => a.type === 'ritual') || false, // Completable if has ritual action
    // Status
    isActive: automation.isActive !== false,
    scope: automation.isPublic ? 'public' : 'personalized',
    // Metadata
    createdAt: automation.createdAt,
    updatedAt: automation.updatedAt,
    joinedByUsers: [],
    usageCount: automation.sharedCount || 0,
    completionRate: 0,
    // Legacy
    _legacyType: 'automation',
    conversationHistory: automation.conversationHistory
  };
}

/**
 * Check if a unified ritual is an automation (has triggers)
 */
export function isAutomation(ritual: UnifiedRitual): boolean {
  return Array.isArray(ritual.triggers) && ritual.triggers.length > 0;
}

/**
 * Check if a unified ritual is a manual ritual (no triggers)
 */
export function isManualRitual(ritual: UnifiedRitual): boolean {
  return !isAutomation(ritual);
}
