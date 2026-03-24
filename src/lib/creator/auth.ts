import { doc, getDoc } from 'firebase/firestore';
import { usersCollection } from '@lib/firebase/collections';
import type { NextApiRequest } from 'next';

type CreatorAuthResult = {
  ok: boolean;
  userId?: string;
  reason?: string;
};

const DEFAULT_ADMINS = ['link2sources'];

function allowedUsernames(): string[] {
  const envValue = process.env.CREATOR_ADMIN_USERNAMES;
  if (!envValue) return DEFAULT_ADMINS;
  return envValue
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function getUserIdFromRequest(req: NextApiRequest): string {
  const body =
    req.body && typeof req.body === 'object'
      ? (req.body as Record<string, unknown>)
      : null;
  const fromBody = typeof body?.userId === 'string' ? body.userId : '';
  const fromQuery =
    typeof req.query.userId === 'string' ? req.query.userId : '';
  const fromHeader =
    typeof req.headers['x-user-id'] === 'string'
      ? req.headers['x-user-id']
      : '';

  return (fromBody || fromQuery || fromHeader || '').trim();
}

export async function requireCreator(
  req: NextApiRequest
): Promise<CreatorAuthResult> {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return { ok: false, reason: 'Missing userId' };
  }

  const snapshot = await getDoc(doc(usersCollection, userId));
  if (!snapshot.exists()) {
    return { ok: false, reason: 'Unknown user' };
  }

  const username = String(snapshot.data().username || '').toLowerCase();
  if (!allowedUsernames().includes(username)) {
    return { ok: false, reason: 'Creator access required' };
  }

  return { ok: true, userId };
}

export function hasCreatorSecret(req: NextApiRequest): boolean {
  const secret = process.env.CREATOR_CRON_SECRET;
  if (!secret) return false;
  const token = req.headers['x-creator-secret'];
  return typeof token === 'string' && token === secret;
}

export function promptHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `h${Math.abs(hash)}`;
}
