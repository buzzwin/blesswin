import { getCollection } from 'astro:content';

export type Stat = {
  label: string;
  value: string;
  note: string;
  pending?: boolean;
};

const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;

/**
 * Numbers for /stats.
 *
 * Two sources, and the page says which is which:
 *
 *  - the repository, which is exact and needs no credentials
 *  - outside services (Buttondown, GA4), which need API credentials at build
 *    time and are marked pending until those exist
 *
 * A number that is not available is shown as unavailable. It is never
 * estimated, rounded up, or quietly omitted — a stats page that cannot report
 * a zero is the dashboard problem from No. 02 wearing different clothes.
 */
export async function getStats(): Promise<{ fromRepo: Stat[]; fromServices: Stat[]; builtAt: Date }> {
  const notes = (await getCollection('notes')).sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());

  const words = notes.reduce((sum, n) => sum + (n.body ?? '').trim().split(/\s+/).filter(Boolean).length, 0);

  const first = notes[0]?.data.date;
  const latest = notes[notes.length - 1]?.data.date;
  const days = first ? Math.max(1, Math.round((Date.now() - first.valueOf()) / 86_400_000)) : 0;

  const subscribers = import.meta.env.BUTTONDOWN_SUBSCRIBER_COUNT;
  const pageviews = import.meta.env.GA4_PAGEVIEWS_30D;

  return {
    builtAt: new Date(),
    fromRepo: [
      {
        label: 'Notes published',
        value: String(notes.length),
        note: `First on ${first?.toISOString().slice(0, 10) ?? '—'}, latest on ${latest?.toISOString().slice(0, 10) ?? '—'}.`
      },
      {
        label: 'Words written',
        value: words.toLocaleString('en'),
        note: `Across every note. ${plural(Math.round(words / Math.max(notes.length, 1)), 'word')} on average.`
      },
      {
        label: 'Days running',
        value: String(days),
        note: 'Since the first note. There is no schedule, so this is not a streak.'
      }
    ],
    fromServices: [
      {
        label: 'Subscribers',
        value: subscribers ?? 'not available',
        note: subscribers
          ? 'From Buttondown at build time.'
          : 'Needs a Buttondown API key as BUTTONDOWN_SUBSCRIBER_COUNT at build time. Until then this is blank rather than guessed.',
        pending: !subscribers
      },
      {
        label: 'Page views, last 30 days',
        value: pageviews ?? 'not available',
        note: pageviews
          ? 'From GA4 at build time.'
          : 'Needs a GA4 service account to read the Data API at build time. Until then this is blank rather than guessed.',
        pending: !pageviews
      }
    ]
  };
}
