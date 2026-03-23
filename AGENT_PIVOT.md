# Buzzwin: soft pivot to “decide and act”

Buzzwin is **not** being shut down or rewritten. We are adding a thin **agent layer** on top of the same login, data, and screens users already know.

## One-line strategy

> Don’t rebuild Buzzwin — wrap it with an agent that turns discovery into decisions and decisions into action.

## Product narrative (public / LinkedIn-ready)

Users don’t want endless discovery — they want **clear decisions** and **follow-through**. Buzzwin already had rituals, community, and AI-assisted flows; we’re evolving the story so the product **helps you decide and act**, not only browse. Same app, same account — with **Ask Buzzwin** as the bridge: natural language in, plans and next steps out, plus optional saves and lightweight memory.

## How existing features map to the agent model

| Existing surface | Agent interpretation |
|------------------|----------------------|
| Home feed / impact moments | Context for “what’s happening” and social signal |
| Categories / tags | Intent and routing for suggestions |
| Bookmarks / saved items | Preference seeds (future: richer memory) |
| Search and navigation | Natural-language entry points (Ask Buzzwin) |
| Rituals & automations | **Execute and adapt** — pacing, reminders, structured habits |

## What shipped in code (MVP)

- **Ask Buzzwin** (`/ask`): Chat powered by the existing automations chat API, with suggested prompts, optional **saved plans**, and optional **agent preferences** (dietary, typical outing day, venue styles, notes) injected into the model when provided.
- **Save plan**: Stores assistant replies the user chooses to keep under `users/{uid}/saved_plans`.
- **APIs**: `POST /api/agent/save-plan`, `GET /api/agent/saved-plans`, extended `POST /api/automations/chat` with `agentPreferences`.
- **Messaging**: README positioning, landing strip for logged-in users, dismissible home banner, SEO copy tuned toward “decide and act.”

## Out of scope (later)

Booking APIs, full MCP/tooling, push notifications as a product pillar, and automated ingestion of bookmarks into memory without explicit consent.

## Honest note

The pivot **sticks** when the product **removes steps**: deep links, saved plans, and clear “next steps” in every reply are the minimum bar before heavier integrations.
