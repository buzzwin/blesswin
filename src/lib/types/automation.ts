import type { Timestamp } from 'firebase/firestore';

/**
 * @deprecated Use UnifiedRitual from './unified-ritual' instead.
 * This type is kept for backward compatibility during migration.
 */



/**
 * Automation - A user-defined automation that helps manage their life
 * Created through chat interface, stored in registry, shareable
 */
export interface Automation {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category: 'wellness' | 'productivity' | 'relationships' | 'health' | 'finance' | 'learning' | 'other';
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  isPublic: boolean; // Whether it's shared in the registry
  isActive: boolean; // Whether it's currently running
  sharedCount?: number; // How many times it's been shared/used by others
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  conversationHistory?: ConversationMessage[]; // The chat conversation that created it
}

/**
 * Trigger that starts an automation
 */
export interface AutomationTrigger {
  type: 'time' | 'location' | 'event' | 'condition' | 'manual';
  config: {
    // Time trigger
    time?: string; // e.g., "09:00", "every Monday at 9am"
    frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
    daysOfWeek?: number[]; // 0-6, Sunday-Saturday
    
    // Location trigger
    location?: {
      name: string;
      latitude?: number;
      longitude?: number;
      radius?: number; // meters
    };
    
    // Event trigger
    event?: string; // e.g., "calendar event", "app notification"
    
    // Condition trigger
    condition?: {
      field: string; // e.g., "weather", "mood", "energy_level"
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
      value: string | number;
    };
  };
}

/**
 * Action that the automation performs
 */
export interface AutomationAction {
  type: 'ritual' | 'reminder' | 'notification' | 'message' | 'api_call' | 'custom';
  config: {
    // Ritual action
    ritualId?: string;
    ritualTitle?: string;
    
    // Reminder/Notification
    message?: string;
    channel?: 'app' | 'email' | 'sms';
    
    // Message action
    recipient?: string;
    template?: string;
    
    // API call
    endpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    payload?: Record<string, unknown>;
    
    // Custom action
    customScript?: string;
  };
}

/**
 * Conversation message in the chat interface
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp | Date;
  metadata?: {
    suggestedAutomation?: Partial<Automation>;
    extractedData?: Record<string, unknown>;
  };
}

/**
 * Request to create an automation
 */
export interface CreateAutomationRequest {
  userId: string;
  title: string;
  description: string;
  category: Automation['category'];
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  isPublic?: boolean;
  conversationHistory?: ConversationMessage[];
}

/**
 * Automation registry entry (public automations)
 */
export interface AutomationRegistryEntry {
  id: string;
  automation: Automation;
  creator: {
    userId: string;
    name: string;
    username: string;
    photoURL?: string;
  };
  stats: {
    sharedCount: number;
    activeUsers: number; // How many users have this active
    rating?: number; // Average rating if implemented
  };
  tags: string[];
}
