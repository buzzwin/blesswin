import { createSign } from 'node:crypto';

export type Views = {
  byNote: Map<string, number>;
  total: number;
  last30Days: number;
};

const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');

// A signed request for a token, by hand: it is ten lines, and the Google client
// library is a large dependency to take on for two read-only calls at build.
async function accessToken(account: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: account.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600
  })}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(account.private_key, 'base64url');

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`
    }),
    signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`token request returned ${response.status}`);
  return ((await response.json()) as { access_token: string }).access_token;
}

async function viewsByPath(property: string, token: string, startDate: string) {
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      limit: 10_000
    }),
    signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`GA4 report returned ${response.status}`);

  const { rows = [] } = (await response.json()) as {
    rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[];
  };
  return rows.map((row) => ({ path: row.dimensionValues[0].value, views: Number(row.metricValues[0].value) }));
}

const sum = (rows: { views: number }[]) => rows.reduce((total, row) => total + row.views, 0);
const day = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Page views from GA4, or null if they could not be read. Null and zero are
 * different answers and the page has to show them differently, so a failure
 * here is reported rather than turned into a row of zeros. It also must not
 * stop the build: an analytics outage is no reason to block a deploy.
 *
 * Nothing is counted before `since`, the first note: this GA4 property also
 * holds traffic from the app that used to be on this domain.
 */
export async function getViews(since: Date): Promise<Views | null> {
  const property = process.env.GA4_PROPERTY_ID;
  const credentials = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!property || !credentials) return null;

  try {
    const token = await accessToken(JSON.parse(credentials));
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
    const [allTime, recent] = await Promise.all([
      viewsByPath(property, token, day(since)),
      viewsByPath(property, token, day(thirtyDaysAgo > since ? thirtyDaysAgo : since))
    ]);

    const byNote = new Map<string, number>();
    for (const { path, views } of allTime) {
      // Depending on the route a reader took, a note can be logged with or
      // without .html or a trailing slash.
      const slug = path.match(/^\/notes\/([^/]+?)(?:\.html)?\/?$/)?.[1];
      if (slug) byNote.set(slug, (byNote.get(slug) ?? 0) + views);
    }

    return { byNote, total: sum(allTime), last30Days: sum(recent) };
  } catch (error) {
    console.warn(`[stats] could not read GA4: ${(error as Error).message}`);
    return null;
  }
}
