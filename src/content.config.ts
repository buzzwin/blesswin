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
    machineEdition: z.string()
  })
});

export const collections = { notes };
