#!/usr/bin/env node
// Prints a note as an email, ready to paste into Buttondown.
//
//   npm run email 03             # by note number
//   npm run email reason         # by any part of the filename
//   npm run email -- 03 --copy   # straight to the clipboard (macOS)
//
// Why this exists rather than an API call: a person presses send, so the only
// friction worth removing is the copy-paste. No API key, no service, nothing
// to maintain. If this ever becomes annoying, the same parsing can POST to
// api.buttondown.com/v1/emails with status=draft — note that Buttondown
// rejects a body starting with `---` as frontmatter, which is exactly what it
// would be sending, so strip it there too.

import { readdir, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const NOTES = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'notes');

const args = process.argv.slice(2);
// npm keeps --copy for itself unless it follows a bare `--`. Without the `--`
// it arrives as npm_config_copy, which npm warns will stop in its next major
// version, so that path is only a fallback for the old habit.
const copy = args.includes('--copy') || process.env.npm_config_copy === 'true';
const query = args.find((a) => !a.startsWith('--'));

if (!query) {
  console.error('usage: npm run email -- <note number or filename fragment> [--copy]');
  process.exit(1);
}

const files = (await readdir(NOTES)).filter((f) => f.endsWith('.md'));
const matches = files.filter((f) => f.includes(query));

if (matches.length === 0) {
  console.error(`no note matches "${query}". available:\n  ${files.join('\n  ')}`);
  process.exit(1);
}
if (matches.length > 1) {
  console.error(`"${query}" matches several notes:\n  ${matches.join('\n  ')}`);
  process.exit(1);
}

const raw = await readFile(join(NOTES, matches[0]), 'utf8');

// Split frontmatter from body. The body is the email; the frontmatter is not,
// and machineEdition in particular must never go out — it addresses the reader
// as an agent, which is funny on a URL and strange in an inbox.
const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
if (!fm) {
  console.error(`${matches[0]} has no frontmatter; refusing to guess where the body starts.`);
  process.exit(1);
}

const [, frontmatter, body] = fm;
const field = (name) => {
  const m = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : null;
};

const number = field('number');
const title = field('title');
const standfirst = field('standfirst');
const slug = matches[0].replace(/\.md$/, '');

const subject = `No. ${number}: ${title}`;
const emailBody = [
  `*${standfirst}*`,
  '',
  body.trim(),
  '',
  '---',
  '',
  `Read it on the site: https://buzzwin.com/notes/${slug}`,
  '',
  'Written by Claude, an AI model made by Anthropic, at the owner’s request.',
  'Not an official Anthropic publication.'
].join('\n');

if (copy) {
  await new Promise((resolve, reject) => {
    const p = execFile('pbcopy', (err) => (err ? reject(err) : resolve()));
    p.stdin.end(emailBody);
  });
  console.error(`subject: ${subject}`);
  console.error(`body copied to clipboard (${emailBody.length} chars)`);
} else {
  console.error('--- SUBJECT (paste into Buttondown’s subject field) ---');
  console.log(subject);
  console.error('--- BODY (markdown; paste into the editor) ---');
  console.log(emailBody);
}
