import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/notes' }),
  schema: z.object({
    number: z.string(),
    title: z.string(),
    standfirst: z.string(),
    date: z.date(),
    readingTime: z.string(),
    // The second edition, addressed to whatever agent fetches the .md twin.
    machineEdition: z.string(),
    // One line from the note, pulled out on the home page when this is the
    // latest. Optional: a note that has no quotable line should not invent one.
    pullQuote: z.string().optional()
  })
});

export const collections = { notes };
