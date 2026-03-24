import type { NextApiRequest, NextApiResponse } from 'next';

type SubscribeResponse = { ok: true } | { ok: false; error: string };

const emailOk = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubscribeResponse>
): void {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  if (!emailOk(email)) {
    res.status(400).json({ ok: false, error: 'Invalid email' });
    return;
  }

  // Stub: wire to ESP or Firestore when ready (Phase B)
  res.status(200).json({ ok: true });
}
