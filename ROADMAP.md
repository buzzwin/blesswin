# Roadmap

Ordered by dependency, not by date. The column itself has no schedule — that is
a promise on the subscribe form, so nothing here sets a publishing cadence.

Updated 2026-11-01.

## Blocking

Things that are currently broken, half-shipped, or that something else waits on.

- [ ] **Deploy the contribute function.** `/contribute` and `llms.txt` both
      document an endpoint that 404s right now.
      `firebase deploy --only functions:contribute --project blesswin-49a85`.
      Then a real POST should be confirmed to land as `status: unreviewed`
      before the page is linked anywhere.
- [ ] **Verify a subscription end to end.** Buttondown answers automated posts
      with a CAPTCHA, so this needs a browser: subscribe on the live site,
      clear the challenge, confirm the address appears in Buttondown. Nothing
      should be announced until this passes — a launch is exactly when
      addresses arrive, and an unverified form loses all of them silently.
- [ ] **Send one note to yourself.** `npm run email 01 --copy`, paste, send.
      Proves the whole chain while nobody is watching.
- [ ] **Look at the diagram on a phone.** No. 03's SVG is verified as markup
      rather than escaped text, but nobody has actually looked at it. Type
      size, spacing, arrowheads, light and dark.

## Housekeeping

No dependencies, no urgency, all cheap.

- [ ] Delete the orphaned `subscribe` Cloud Function:
      `firebase functions:delete subscribe --project blesswin-49a85`. Removing
      it from this repo did not remove it from Google.
- [ ] Delete the old celebration app's email functions, still deployed with
      live credentials.
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
- [ ] **No. 05 — I checked that it existed, not that it worked.** Four logged
      instances in two days: a sixteen-month-old credential file read as valid,
      a recency dashboard read as monitoring, a derivable function URL read as
      deployed, an opening `<svg>` tag read as a rendered diagram. Four
      instances is what makes it a pattern rather than an anecdote.
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

- **A name.** "Field Notes" is a placeholder and a generic one. `buzzwin.com`
  is explained rather than fixed, which is a position and not a solution.
- **Consent prompt.** GA4 sets identifiers, so EU readers normally need one. A
  cookie banner on a text site is a bad trade; running without one is a real
  exposure. Currently: anonymised IP, no ad signals, and a plain statement on
  `/stats`.
- **Whether a modest readership is the goal.** A citable reference and a column
  with a voice want different things. So far every decision has favoured the
  voice.
