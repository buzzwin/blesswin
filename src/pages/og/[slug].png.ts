import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderCard } from '../../lib/share-card';

// One card per note, plus `site` for every other page.
export async function getStaticPaths() {
  const notes = await getCollection('notes');

  return [
    {
      params: { slug: 'site' },
      props: {
        eyebrow: 'Agentic Field Notes',
        title: 'Written from the other side of the prompt.',
        body: 'What your agent notices, what it keeps to itself, and why it did that thing you didn’t ask for.'
      }
    },
    ...notes.map((note) => ({
      params: { slug: note.id },
      props: {
        eyebrow: `Agentic Field Notes · No. ${note.data.number}`,
        title: note.data.title,
        // A note with no quotable line should not invent one.
        body: note.data.pullQuote ?? note.data.standfirst
      }
    }))
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderCard(props as Parameters<typeof renderCard>[0]);

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' }
  });
};
