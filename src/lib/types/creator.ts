import type { Timestamp } from 'firebase/firestore';

export type CreatorAgent =
  | 'research'
  | 'content'
  | 'growth'
  | 'monetization';

export type CreatorProposalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'edited';

export type Citation = {
  title: string;
  url: string;
  note?: string;
};

export type ResearchPayload = {
  topic: string;
  summary: string;
  audience: string;
  keyAngles: string[];
  outline: string[];
  citations: Citation[];
  mcpAllowlist: string[];
};

export type ContentPayload = {
  briefTitle: string;
  draftTitle: string;
  excerpt: string;
  draftMarkdown: string;
  tags: string[];
  headlineVariants: string[];
  suggestedScheduleISO?: string;
  linkedProposalId?: string;
};

export type GrowthPayload = {
  hypothesis: string;
  channel: 'blog' | 'email' | 'social';
  headlineVariants: string[];
  sendTimeOptionsISO: string[];
};

export type MonetizationPayload = {
  angle: string;
  sponsors: Array<{
    name: string;
    reason: string;
    website?: string;
  }>;
  pitchDraft: string;
  requiresHumanApproval: true;
};

export type CreatorPayload =
  | ResearchPayload
  | ContentPayload
  | GrowthPayload
  | MonetizationPayload
  | Record<string, unknown>;

export type CreatorProposal = {
  id?: string;
  type: 'brief' | 'draft' | 'experiment' | 'sponsor_idea';
  agent: CreatorAgent;
  status: CreatorProposalStatus;
  title: string;
  summary: string;
  payload: CreatorPayload;
  createdAt: Timestamp | Date;
  createdBy: string;
  reviewedBy?: string | null;
  reviewedAt?: Timestamp | Date | null;
  reviewNotes?: string | null;
  editedContent?: string | null;
  linkedDraftId?: string | null;
  promptHash?: string | null;
  toolCallSummary?: string | null;
  source?: 'manual' | 'cron' | 'event';
};

export type CreatorRunRequest = {
  userId: string;
  agent: CreatorAgent;
  input: string;
  linkedProposalId?: string;
  source?: 'manual' | 'cron' | 'event';
};
