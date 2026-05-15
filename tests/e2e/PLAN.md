# Playwright E2E Test Plan

## Routes Discovered

### Public (unauthenticated)
| Route | Description |
|-------|-------------|
| `/` | Landing page (LoginMain) |
| `/login` | Login page |
| `/forgot-password` | Password reset |
| `/how-it-works` | Explainer |
| `/privacy` | Privacy policy |
| `/tos` | Terms of service |
| `/disclaimer` | Disclaimer |
| `/blog` | Blog listing |
| `/blog/[slug]` | Blog post |
| `/real-stories` | Real stories |
| `/b/[token]` | Buzzbook signing page (public link) |
| `/buzzes/[buzzId]/reveal` | Buzzbook reveal page |
| `/public/[id]` | Public impact moment |

### Protected (requires auth)
| Route | Description |
|-------|-------------|
| `/home` | Main feed |
| `/ask` | Ask Buzzwin AI chat |
| `/automations` | Automations / rituals |
| `/buzzes` | My Buzzes list |
| `/buzzes/new` | Create Buzz wizard |
| `/buzzes/[buzzId]` | Manage a Buzz |
| `/bookmarks` | Bookmarks |
| `/people` | Discover people |
| `/settings` | User settings |
| `/user/[id]` | User profile |
| `/real-stories` | Community stories |
| `/videos` | Videos |
| `/watchlists` | Watchlists |
| `/wellness` | Wellness page |
| `/rituals` | Rituals list |
| `/trivia` | Trivia |

## Critical User Journeys

1. **Landing page loads** — hero, Buzzbook CTA, activity feed visible
2. **Navigation smoke** — all nav links in desktop header and mobile header render correctly
3. **Responsive** — no horizontal scroll at 375px / 768px / 1280px
4. **Auth redirect** — protected routes redirect unauthenticated users to `/` or `/login`
5. **Login page** — Google sign-in button and email form render
6. **Buzzbook signing (public)** — `/b/[token]` renders sign form for a valid token; not-found state for invalid token
7. **Static pages** — `/privacy`, `/tos`, `/how-it-works` load with correct headings
8. **Accessibility** — landing and login pages pass axe at critical/serious level

## Coverage in This Pass

| Spec file | Journeys covered |
|-----------|-----------------|
| `smoke.spec.ts` | All public routes return 200, key heading visible, no critical console errors |
| `navigation.spec.ts` | Desktop nav links, mobile header logo |
| `responsive.spec.ts` | 375px / 768px / 1280px at landing |
| `a11y.spec.ts` | axe scan on `/` and `/login` |
| `auth-redirect.spec.ts` | Protected routes redirect unauthenticated users |
| `sign-buzz.spec.ts` | `/b/[token]` not-found state; signing page hero renders |

## Decisions

- **Auth-required pages are not tested logged-in** — setting up Firebase auth in Playwright requires seeding a test account and managing auth state. This first pass validates redirects and static rendering only. Login tests are skipped with `.fixme()` notes.
- **Dynamic routes** — tested with known-safe invalid tokens/IDs that should render not-found states gracefully.
- **Port 3000** — using `npm run dev:test` (port 3000) instead of production port 80 for Playwright webServer.
