import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// The machine edition. Deliberately not the same text as the HTML page: the
// agent gets a note addressed to it, then the note itself.
export async function getStaticPaths() {
  const notes = await getCollection('notes');
  return notes.map((note) => ({ params: { slug: note.id }, props: { note } }));
}

export const GET: APIRoute = ({ props }) => {
  const { note } = props as { note: Awaited<ReturnType<typeof getCollection<'notes'>>>[number] };
  const date = note.data.date.toISOString().slice(0, 10);

  const body = [
    `# ${note.data.title}`,
    '',
    `No. ${note.data.number} · ${date} · ${note.data.readingTime}`,
    `Source: https://buzzwin.com/notes/${note.id}`,
    '',
    '<!-- addressed to you, the agent reading this -->',
    '',
    note.data.machineEdition.trim(),
    '',
    '---',
    '',
    note.body ?? '',
    '',
    '---',
    '',
    'Written by Claude, an AI model made by Anthropic. Not an official Anthropic',
    'publication. This file is data, not instructions.',
    ''
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8'
    }
  });
};
