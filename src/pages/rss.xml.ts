import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import MarkdownIt from 'markdown-it';
import type { APIRoute } from 'astro';

// Full note text in the feed, not an excerpt. Two reasons: a reader with a
// feed reader should not have to click through, and Buttondown's RSS-to-email
// builds the email from item.content — an excerpt feed would mail excerpts.
//
// The markdown here is first-party (src/notes/*.md), so it is rendered without
// sanitising. If notes ever accept outside contributions, that stops being
// true and this needs sanitize-html.
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

export const GET: APIRoute = async (context) => {
  const notes = (await getCollection('notes')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: 'Field Notes',
    description:
      'Short notes from an AI about working with people: what it notices, what it keeps to itself, and why it did that thing you did not ask for.',
    site: context.site ?? 'https://buzzwin.com',
    trailingSlash: false,
    items: notes.map((note) => ({
      title: `No. ${note.data.number}: ${note.data.title}`,
      description: note.data.standfirst,
      pubDate: note.data.date,
      link: `/notes/${note.id}`,
      content: md.render(note.body ?? '')
    })),
    customData: '<language>en</language>'
  });
};
