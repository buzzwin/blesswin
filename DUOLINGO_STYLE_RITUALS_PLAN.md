# Duolingo-Style Rituals UI Implementation Plan

## Overview
Transform the rituals system into a gamified Duolingo-style experience that encourages users to join rituals, complete them daily/weekly, and invite others. This includes redesigning the rituals page, adding gamification elements, implementing in-app notifications, and enhancing social features.

**Important:** This plan uses the existing **karma points system** instead of creating a new XP system. Karma points are already awarded for ritual completions and other actions.

## Key Files to Modify/Create

### Type Definitions
- **`src/lib/types/ritual.ts`** - Add level calculation, achievement types
- **`src/lib/types/karma.ts`** - Already exists, no changes needed

### Core Components (New)
- **`src/components/rituals/karma-level-system.tsx`** - Karma bar, level display, level-up animations (uses existing karma)
- **`src/components/rituals/progress-bars.tsx`** - Daily/weekly progress visualization
- **`src/components/rituals/achievements.tsx`** - Badges and achievement display (integrates with karma milestones)
- **`src/components/rituals/leaderboard.tsx`** - Top participants leaderboard (sorted by karma)
- **`src/components/rituals/invite-modal.tsx`** - Invite friends to join rituals
- **`src/components/rituals/notification-center.tsx`** - In-app notification center
- **`src/lib/hooks/useBrowserNotifications.ts`** - Browser notification hook
- **`src/lib/utils/level-calculation.ts`** - Level calculation from karma points

### Enhanced Components
- **`src/components/rituals/ritual-card.tsx`** - Add gamification elements, karma rewards display, social encouragement
- **`src/components/rituals/ritual-stats-widget.tsx`** - Add level display (uses karma)
- **`src/components/user/user-karma-display.tsx`** - Enhance with level display
- **`src/pages/rituals/index.tsx`** - Redesign layout with Duolingo-style sections

### API Endpoints (New)
- **`src/pages/api/rituals/level.ts`** - Calculate level from karma
- **`src/pages/api/rituals/achievements.ts`** - Check and award achievements (uses karma milestones)
- **`src/pages/api/rituals/leaderboard.ts`** - Get leaderboard data (sorted by karma)
- **`src/pages/api/rituals/notifications.ts`** - Manage in-app notifications
- **`src/pages/api/rituals/invite.ts`** - Send ritual invites

### Backend Functions (New)
- **`functions/src/functions/ritual-achievements.ts`** - Award achievements (karma already handled)
- **`functions/src/functions/ritual-notifications.ts`** - Send browser push notifications

### Service Worker
- **`public/sw.js`** - Service worker for push notifications
- **`public/manifest.json`** - Web app manifest (update if needed)

## Implementation Steps

### Phase 1: Gamification Foundation
1. **Extend Type Definitions**
   - Add level calculation to `UserRitualState` (calculated from karma, not stored)
   - Create `Achievement` type with id, name, description, icon, unlockedAt
   - Create `LeaderboardEntry` type (uses karma points)

2. **Level Calculation System**
   - Create `level-calculation.ts` utility:
     - Calculate level from karma: `level = Math.floor(karma / 100)` (or exponential scaling)
     - Calculate karma needed for next level
     - Calculate progress percentage to next level
   - Karma is already awarded via existing system:
     - Ritual completed quietly: 5 karma
     - Ritual completed shared: 10 karma
     - Streak milestones: 25 karma (7-day), 100 karma (30-day)
     - Impact moments: 10-15 karma (depending on type)

3. **Update Ritual Completion Flow**
   - Karma is already awarded in `src/pages/api/rituals/complete.ts`
   - Add level calculation and display after karma update
   - Trigger achievement checks after karma milestones

### Phase 2: UI Components
4. **Karma/Level System Component**
   - Create `karma-level-system.tsx`:
     - Circular or horizontal karma progress bar (to next level)
     - Current level display with level-up animation
     - Karma gained notifications (uses existing karma system)
     - "X karma until next level" indicator
     - Integrate with existing `UserKarmaDisplay` component

5. **Progress Bars Component**
   - Create `progress-bars.tsx`:
     - Daily goal progress (e.g., complete 1 ritual = 100%)
     - Weekly goal progress (e.g., complete 5 rituals = 100%)
     - Visual progress bars with Duolingo-style design
     - Celebration animations on goal completion

6. **Achievements Component**
   - Create `achievements.tsx`:
     - Grid of achievement badges
     - Locked/unlocked states (based on karma milestones)
     - Achievement popup on unlock
     - Achievement categories (streaks, completions, social)
     - Integrate with existing karma milestone system

7. **Enhanced Ritual Card**
   - Update `ritual-card.tsx`:
     - Show karma reward on completion (5 for quiet, 10 for shared)
     - Display participant count prominently
     - Add "Invite Friends" button
     - Show completion progress indicator
     - Add encouraging messages ("Keep your streak going!", "X people joined!")

### Phase 3: Social Features
8. **Leaderboard Component**
   - Create `leaderboard.tsx`:
     - Top 10 participants by karma points
     - User's rank display
     - Filter by time period (daily, weekly, all-time)
     - Show participant avatars
     - Uses existing karma points from user profiles

9. **Invite Modal**
   - Create `invite-modal.tsx`:
     - Share ritual link
     - Copy link button
     - Social media share buttons
     - Email invite option
     - Show "X people joined from your invite" counter

10. **Enhanced Participant Display**
    - Update participant list to show:
      - User avatars
      - Join dates
      - Completion counts
      - "Friend joined!" notifications

### Phase 4: Notifications
11. **Browser Notification Hook**
    - Create `useBrowserNotifications.ts`:
      - Request notification permission
      - Schedule daily/weekly reminders
      - Show milestone celebrations
      - Handle notification clicks

12. **Notification Center**
    - Create `notification-center.tsx`:
      - In-app notification list
      - "Friend joined your ritual" notifications
      - Achievement unlocked notifications
      - Streak reminders
      - Mark as read functionality

13. **Backend Notification Service**
    - Create `functions/src/functions/ritual-notifications.ts`:
      - Send browser push notifications
      - Respect quiet hours
      - Handle notification preferences
      - Schedule reminders

### Phase 5: Page Redesign
14. **Redesign Rituals Page**
    - Update `src/pages/rituals/index.tsx`:
      - Hero section with karma/level display
      - Daily/weekly progress bars at top
      - Today's rituals in prominent cards
      - Achievements section
      - Leaderboard sidebar or section
      - Encouraging messages throughout
      - "Start a Ritual" CTA prominently displayed

15. **Update Ritual Stats Widget**
    - Enhance `ritual-stats-widget.tsx`:
      - Add level display (calculated from karma)
      - Show progress to next level
      - Add achievement preview
      - Link to full achievements page

### Phase 6: API Integration
16. **Level API Endpoint**
    - Create `src/pages/api/rituals/level.ts`:
      - Get user level (calculated from karma)
      - Calculate karma needed for next level
      - Get level progress percentage
      - Note: Karma is already managed by existing `/api/karma/award.ts`

17. **Achievements API**
    - Create `src/pages/api/rituals/achievements.ts`:
      - Get user achievements
      - Check achievement eligibility (based on karma milestones)
      - Award achievements (karma already awarded via existing system)

18. **Leaderboard API**
    - Create `src/pages/api/rituals/leaderboard.ts`:
      - Get top participants (sorted by karma points)
      - Get user rank (by karma)
      - Filter by time period
      - Uses existing karma points from user profiles

19. **Notifications API**
    - Create `src/pages/api/rituals/notifications.ts`:
      - Get user notifications
      - Mark notifications as read
      - Create notification

20. **Invite API**
    - Create `src/pages/api/rituals/invite.ts`:
      - Generate invite link
      - Track invite conversions
      - Send invite emails

## Design Principles

### Duolingo-Style Elements
- **Colorful, friendly UI** - Use purple/pink gradients, green for completions
- **Progress visualization** - Circular progress bars, karma bars, streak flames
- **Encouraging messages** - "Great job!", "Keep it up!", "You're on fire!"
- **Celebration animations** - Confetti on achievements, level-ups, goal completions
- **Social proof** - Show participant counts, friend activity
- **Clear CTAs** - Prominent "Join Ritual", "Complete Now", "Invite Friends" buttons

### Gamification Mechanics (Using Existing Karma System)
- **Karma Points**: Already awarded via existing system
  - Ritual completed quietly: 5 karma
  - Ritual completed shared: 10 karma
  - Streak milestones: 25 karma (7-day), 100 karma (30-day)
  - Impact moments: 10-15 karma (depending on type)
- **Levels**: Calculate from karma - `level = Math.floor(karma / 100)` (or exponential scaling)
- **Achievements**: Unlock badges for karma milestones (50, 100, 250, 500, 1000, etc.)
- **Daily Goals**: Complete 1 ritual = daily goal met
- **Weekly Goals**: Complete 5 rituals = weekly goal met
- **Social Rewards**: Karma already awarded for "joined you" actions (15 karma received, 10 karma created)

## Database Schema Updates

### Firestore Collections
- **`users`** - Already has `karmaPoints` and `karmaBreakdown` fields (no changes needed)
- **`user_ritual_states`** - Level calculated from karma (not stored, computed on demand)
- **`ritual_achievements`** (new) - Store user achievements (unlocked badges)
- **`ritual_notifications`** (new) - Store in-app notifications
- **`ritual_invites`** (new) - Track ritual invites and conversions

## Testing Considerations
- Test level calculation from karma points
- Test achievement unlocking logic (based on karma milestones)
- Test notification scheduling and delivery
- Test leaderboard queries and performance (sorted by karma)
- Test invite link generation and tracking
- Test browser notification permissions and fallbacks
- Verify karma is already being awarded correctly (existing system)

## Migration Notes
- Existing users already have karma points - calculate levels from existing karma
- No migration needed for karma system (already implemented)
- Calculate initial levels for all users: `level = Math.floor(karmaPoints / 100)`
- Existing karma milestones can be used for achievements

## Existing Karma System Integration

### Already Implemented
- ✅ Karma points awarded for ritual completions
- ✅ Karma breakdown by category (rituals, impact moments, engagement, chains, milestones)
- ✅ Karma display components (`UserKarmaDisplay`, `UserKarmaBadge`)
- ✅ Karma API endpoints (`/api/karma/award.ts`, `/api/karma/[userId].ts`)
- ✅ Karma calculation utilities (`src/lib/utils/karma-calculator.ts`)

### What We're Adding
- Level calculation from karma
- Level display components
- Achievement system based on karma milestones
- Leaderboard using karma points
- Duolingo-style UI enhancements
- In-app notifications
- Social invitation features

## Implementation Todos

1. **extend-types** - Extend ritual and user types to include level calculation, achievements, and leaderboard data
2. **level-calculation** - Create level calculation utility that calculates level from existing karma points
3. **update-completion-flow** - Enhance ritual completion flow to show level-up animations and karma rewards (karma already awarded)
4. **karma-level-component** - Create karma/level system component with progress bar and level-up animations (uses existing karma)
5. **progress-bars** - Create daily/weekly progress bars component with Duolingo-style design
6. **achievements-component** - Create achievements component with badge grid and unlock animations
7. **enhance-ritual-card** - Enhance ritual card with karma rewards display, participant count, and invite button
8. **leaderboard-component** - Create leaderboard component showing top participants with filtering
9. **invite-modal** - Create invite modal with share links and social media options
10. **browser-notifications** - Create browser notification hook and service worker for push notifications
11. **notification-center** - Create in-app notification center component
12. **redesign-rituals-page** - Redesign rituals page with Duolingo-style layout, hero section, and gamification elements
13. **level-api** - Create level API endpoint for calculating level from karma (karma already managed)
14. **achievements-api** - Create achievements API endpoint for checking and awarding achievements (uses karma milestones)
15. **leaderboard-api** - Create leaderboard API endpoint for fetching top participants (sorted by karma)
16. **notifications-api** - Create notifications API endpoint for managing in-app notifications
17. **invite-api** - Create invite API endpoint for generating links and tracking conversions
18. **backend-achievements-function** - Create Firebase function for awarding achievements
19. **backend-notifications-function** - Create Firebase function for sending browser push notifications

