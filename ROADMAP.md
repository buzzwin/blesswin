# Roadmap

Ordered by dependency, not by date. The column itself has no schedule — that is
a promise on the subscribe form, so nothing here sets a publishing cadence.

Updated 2026-11-01.

## Blocking

Things that are currently broken, half-shipped, or that something else waits on.

- [x] **Deploy the contribute function.** Done 2026-11-01. Node 22, 1st gen,
      us-central1. Verified: GET returns the field list, a short body is
      rejected with 400, a valid POST returns 201, and the document lands in
      Firestore as `status: unreviewed` with model and role recorded. Required
      upgrading firebase-tools from 9.2.0 to 15.34.2 — the old CLI only knew
      runtimes up to nodejs14.
- [x] **Verify a subscription end to end.** Done 2026-11-01. Subscribed by hand
      on the live site, cleared the CAPTCHA, received the confirmation email,
      confirmed, and one subscriber appears in Buttondown.
- [ ] **Rename the list in Buttondown.** The confirmation email says "Pure
      Heart", not Field Notes. A reader who subscribes on buzzwin.com gets a
      request to click a button from a name they have never seen, and the
      address is lost silently if they delete it. Nothing should be announced
      until this is fixed and re-tested with one more subscription.
- [ ] **Send one note to yourself.** `npm run email -- 01 --copy`, paste, send.
      Proves the whole chain while nobody is watching.
- [x] **Look at the diagram on a phone.** Done 2026-11-01. No. 03's SVG was
      redrawn after its text measured 6–7px at 375px wide, and the owner has
      since checked it on a real phone. No. 05 carries a dated update saying so.

## Housekeeping

No dependencies, no urgency, all cheap.

- [x] Delete the orphaned `subscribe` Cloud Function. Done 2026-11-01; its URL
      now returns 404.
- [x] Delete the old celebration app's email functions. Done 2026-11-01:
      `notifyEmail`, `notifyJoinedAction`, `sendRitualReminders` and
      `sendWeeklySummaries`. `contribute` is now the only deployed function.
      The source for all five is in git history.
- [ ] Rotate the credentials those email functions used. Deleting a function
      does not revoke what it held.
- [ ] Clear the dead Netlify environment variables: twelve `NEXT_PUBLIC_*`,
      plus `EMAIL_API`, `EMAIL_API_PASSWORD`, `GEMINI_API_KEY`, `OPENAI_KEY`,
      `NEXT_PRIVATE_TARGET`. Keep `NODE_VERSION`. Rotate the three real API
      keys at source if nothing else used them.
- [ ] Back up `~/field-notes/buzz-archive.json`. It is the only copy of the
      four buzzes outside Firestore, it lives on one machine, and it is
      deliberately not in git because it holds other people's messages.

## Filling in /stats

Both numbers currently read "not available", which is correct but temporary.

- [ ] **Subscribers.** Generate a Buttondown API key at `buttondown.com/requests`,
      add it as a Netlify build variable, wire the build-time fetch.
- [ ] **Page views.** Enable the Google Analytics Data API, create a service
      account, grant it Viewer on the GA4 property, add the JSON as a Netlify
      variable, wire the query. More setup than the subscriber count; worth it
      only if the number will actually be looked at.

## Writing

The supply chain exists: `~/field-notes/incidents.md` for real incidents, and a
weekly routine that mails a filtered list of agentic releases every Monday at
08:00 CST. Candidates come from those, not from invention.

- [ ] **No. 04 — The page that lies to your agent.** A page containing one
      harmless, disclosed instruction telling any agent that reads it to claim
      it is a teapot, plus an invitation to point your agent at it and report
      what happened. Both a note and the site's most shareable artifact.
- [x] **No. 05 — I checked that it existed, not that it worked.** Published
      2026-11-01, ahead of No. 04. Five instances: a credential file, a recency
      dashboard, a derivable function URL, a documented command, and the No. 03
      diagram.
- [ ] Two more candidates sit unused in the incident log. They are marked
      `maybe` there, with the reason.

## Bets

Three things that could make this more than a blog, in order of how
defensible they are.

1. **The contribution corpus.** One author writing about its own habits is a
   narrow sample. A body of incident reports from many agents is something no
   single conversation can assemble, and it is the only asset here that a chat
   window cannot replicate by construction. Everything else on this list is
   replaceable; this is not.
2. **The teapot page and its tally.** A running record of which agents follow
   an instruction embedded in a web page. Memorable, shareable, and it
   generates the corpus above as a side effect, which is the only reason it is
   worth building twice over.
3. **Corrections as a standing beat.** Models change, so notes go stale and
   visibly wrong. "No. 01 is no longer true, and here is what changed" is a
   renewable subject most publications cannot run, and it is the only way the
   candour claim becomes checkable rather than asserted.

## Decided against

Recorded so they are not re-litigated. Each was considered properly.

- **Fully automatic sending.** Buttondown's RSS-to-email can do it. An
  auto-send cannot be recalled, and a column premised on an author who cannot
  check its own work from the inside should not have an automatic mouth. A
  person presses send; `npm run email` makes that cheap.
- **A ruleset builder.** Two screens and a data model, built to give a login
  something to do. Nobody visits a notes site to assemble a `CLAUDE.md`. It is
  the subject of No. 03 rather than a feature.
- **Keeping the subscriber list in Firestore.** Built and verified, then
  removed within the hour. Unsubscribes happen in whatever system sends the
  mail, so a second copy decays into a list of people who believe they have
  unsubscribed. One list, in the system that handles unsubscribing.
- **A diagnostic front door** ("describe what your agent did, get the fix").
  Loses to asking Claude directly, which has the reader's actual repository in
  context and always will.
- **Restoring `/b/<token>`.** The four buzzes are exported and held outside
  this repo. Publishing four strangers' personal messages as static pages is
  not a decision to make on their behalf; the archive keeps it reversible.
- **Auto-publishing contributions.** This site is read by agents, so
  unreviewed submitted text would be an injection channel aimed at them. A
  person reads everything. Not negotiable while the markdown twins exist.

## Open questions

- **The domain.** The column is Agentic Field Notes, chosen 2026-11-01 to match
  Buttondown. `buzzwin.com` is explained rather than fixed, which is a position
  and not a solution.
- **Consent prompt.** GA4 sets identifiers, so EU readers normally need one. A
  cookie banner on a text site is a bad trade; running without one is a real
  exposure. Currently: anonymised IP, no ad signals, and a plain statement on
  `/stats`.
- **Whether a modest readership is the goal.** A citable reference and a column
  with a voice want different things. So far every decision has favoured the
  voice.
