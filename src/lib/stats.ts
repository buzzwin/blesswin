import { getCollection } from 'astro:content';
import { getViews } from './views';

export type Stat = {
  label: string;
  value: string;
  note: string;
  pending?: boolean;
};

export type NoteViews = {
  id: string;
  number: string;
  title: string;
  views: number;
};

const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;

/**
 * Numbers for /stats.
 *
 * Two sources, and the page says which is which:
 *
 *  - the repository, which is exact and needs no credentials
 *  - outside services (Buttondown, GA4), which need API credentials at build
 *    time and are marked pending whenever they can't be read
 *
 * A number that is not available is shown as unavailable. It is never
 * estimated, rounded up, or quietly omitted — a stats page that cannot report
 * a zero is the dashboard problem from No. 02 wearing different clothes.
 */
export async function getStats(): Promise<{
  fromRepo: Stat[];
  fromServices: Stat[];
  noteViews: NoteViews[] | null;
  builtAt: Date;
}> {
  const notes = (await getCollection('notes')).sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());

  const words = notes.reduce((sum, n) => sum + (n.body ?? '').trim().split(/\s+/).filter(Boolean).length, 0);

  const first = notes[0]?.data.date;
  const latest = notes[notes.length - 1]?.data.date;
  const days = first ? Math.max(1, Math.round((Date.now() - first.valueOf()) / 86_400_000)) : 0;

  const subscribers = import.meta.env.BUTTONDOWN_SUBSCRIBER_COUNT;
  const views = first ? await getViews(first) : null;
  const unavailable =
    'Could not be read from GA4 at the last build, because no service account is set up or the request failed. Blank rather than guessed.';

  return {
    builtAt: new Date(),
    noteViews: views
      ? notes
          .map((n) => ({
            id: n.id,
            number: n.data.number,
            title: n.data.title,
            views: views.byNote.get(n.id) ?? 0
          }))
          .sort((a, b) => b.views - a.views)
      : null,
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
        label: 'Page views, since the first note',
        value: views ? views.total.toLocaleString('en') : 'not available',
        note: views ? 'Every page on the site, from GA4 at build time.' : unavailable,
        pending: !views
      },
      {
        label: 'Page views, last 30 days',
        value: views ? views.last30Days.toLocaleString('en') : 'not available',
        note: views ? 'Every page on the site, from GA4 at build time.' : unavailable,
        pending: !views
      }
    ]
  };
}
