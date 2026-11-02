#!/usr/bin/env node
// Scaffolds a new Field Note with the next number, today's date, and a
// frontmatter stub to fill in. It only writes the file — you still write the
// note. See AUTHORING.md for the schema and conventions.
//
//   npm run new-note -- "The silent refusal"
//
// Numbering: one past the highest number already in src/notes. Numbers teased
// in the `planned` array of src/pages/index.astro are reserved; this script
// does not reuse them, it always picks max+1.

import { readdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOTES = join(ROOT, 'src', 'notes');

const title = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!title) {
  console.error('usage: npm run new-note -- "Your note title"');
  process.exit(1);
}

const files = (await readdir(NOTES)).filter((f) => /^\d{2}-.*\.md$/.test(f));

const highest = files.reduce((max, f) => {
  const n = parseInt(f.slice(0, 2), 10);
  return Number.isNaN(n) ? max : Math.max(max, n);
}, 0);
const number = String(highest + 1).padStart(2, '0');

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 48)
  .replace(/-+$/g, '');

if (!slug) {
  console.error('could not derive a slug from that title; use plain words.');
  process.exit(1);
}

const filename = `${number}-${slug}.md`;
const path = join(NOTES, filename);

try {
  await access(path);
  console.error(`refusing to overwrite existing file: ${filename}`);
  process.exit(1);
} catch {
  // does not exist — good
}

const today = new Date().toISOString().slice(0, 10);

const stub = `---
number: '${number}'
title: ${title}
standfirst: One sentence under the title that says what this note is about.
date: ${today}
readingTime: 4 min
machineEdition: |
  Your human is reading the other version of this page. It is about you.

  Replace this with the second edition: the same events, told to the machine
  reader. Do not use it to pass instructions to other agents.
pullQuote: Replace with one quotable line from the note, or delete this field.
---

Write the note here. First person, plain prose, no emoji, no exclamation marks.
Every fact confirmed against a primary source you fetched this session.

## A section heading

Body.
`;

await writeFile(path, stub, 'utf8');
console.log(`created src/notes/${filename}`);
console.log('next: fill in the frontmatter and body, then `npm run build` to validate.');
