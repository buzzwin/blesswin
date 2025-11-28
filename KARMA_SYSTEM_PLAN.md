# User Profiles with Karma Points System - Implementation Plan

**Status:** Planning  
**Priority:** High  
**Estimated Effort:** Medium-Large

---

## Overview

Implement a comprehensive karma points system to track user progress and engagement. Users earn karma through various positive actions, creating a gamified experience that encourages participation and recognizes contributions to the community.

---

## Goals

1. **Track User Progress** - Visual representation of user engagement and positive actions
2. **Encourage Participation** - Gamification through karma points motivates users to engage
3. **Recognize Contributions** - Highlight users who create meaningful impact
4. **Build Community** - Karma system fosters positive competition and collaboration

---

## Karma Point System Design

### Point Values by Action

| Action | Karma Points | Notes |
|--------|--------------|-------|
| **Create Impact Moment** | +10 | Base points for sharing |
| **Impact Moment with Mood Check-in** | +15 | Bonus for reflection |
| **Impact Moment from Ritual** | +12 | Slightly higher for ritual completion |
| **Complete Daily Ritual (Quiet)** | +5 | Private completion |
| **Complete Daily Ritual (Shared)** | +10 | Shared as Impact Moment |
| **Comment on Impact Moment** | +3 | Engagement reward |
| **Receive "Inspired" Ripple** | +2 | Per ripple received |
| **Receive "Grateful" Ripple** | +2 | Per ripple received |
| **Receive "Sent Love" Ripple** | +2 | Per ripple received |
| **Someone "Joined You"** | +15 | Bonus for inspiring action |
| **Create "Joined You" Chain** | +10 | Bonus for joining someone's action |
| **7-Day Ritual Streak** | +25 | Milestone bonus |
| **30-Day Ritual Streak** | +100 | Major milestone bonus |
| **100 Impact Moments** | +50 | Milestone bonus |
| **500 Impact Moments** | +250 | Major milestone bonus |

### Karma Breakdown Categories

- **Impact Moments** - Points from creating and sharing moments
- **Daily Rituals** - Points from completing rituals
- **Community Engagement** - Points from comments and ripples received
- **Chain Creation** - Points from "Joined You" actions
- **Milestones** - Bonus points for achievements

---

## Implementation Phases

### Phase 1: Data Model & Types

**Files to Modify:**
- `src/lib/types/user.ts` - Add karma fields to User type
- `src/lib/types/karma.ts` - Create new Karma type (if needed)

**Changes:**
```typescript
// Add to User type
karmaPoints: number; // Total karma points
karmaBreakdown: {
  impactMoments: number;
  rituals: number;
  engagement: number; // Comments + ripples received
  chains: number; // Joined You actions
  milestones: number;
};
lastKarmaUpdate?: Timestamp | Date;
```

**Firestore Rules:**
- Allow read: Public (for leaderboards)
- Allow update: Only via API endpoints (server-side calculation)

---

### Phase 2: Karma Calculation System

**New Files:**
- `src/lib/utils/karma-calculator.ts` - Karma calculation utilities
- `src/pages/api/karma/calculate.ts` - API endpoint to calculate karma
- `src/pages/api/karma/update.ts` - API endpoint to update karma

**Functions Needed:**
- `calculateUserKarma(userId: string)` - Calculate total karma from all sources
- `awardKarma(userId: string, action: KarmaAction, points: number)` - Award karma for specific action
- `getKarmaBreakdown(userId: string)` - Get detailed breakdown by category

**Karma Actions:**
```typescript
type KarmaAction = 
  | 'impact_moment_created'
  | 'impact_moment_with_mood'
  | 'ritual_completed_quiet'
  | 'ritual_completed_shared'
  | 'comment_created'
  | 'ripple_received'
  | 'joined_you_received'
  | 'joined_you_created'
  | 'streak_milestone'
  | 'impact_milestone';
```

---

### Phase 3: Integrate Karma Tracking

**Files to Modify:**

1. **Impact Moments Creation**
   - `src/pages/api/impact-moments.ts`
   - Award karma when moment is created
   - Award bonus for mood check-in
   - Award bonus for ritual-based moments

2. **Ritual Completion**
   - `src/pages/api/rituals/complete.ts`
   - Award karma for quiet completion
   - Award karma for shared completion
   - Award milestone bonuses for streaks

3. **Comments**
   - `src/components/impact/comment-input.tsx` or API endpoint
   - Award karma when comment is created

4. **Ripple Reactions**
   - `src/pages/home.tsx` (handleRipple function)
   - Award karma to moment creator when ripple is received
   - Award karma to user who creates "Joined You" action

5. **Milestone Tracking**
   - `src/pages/api/rituals/stats.ts`
   - Check for milestone achievements
   - Award milestone karma bonuses

---

### Phase 4: User Profile Updates

**Files to Create/Modify:**

1. **Profile Page Redesign**
   - `src/pages/user/[id]/index.tsx` - Update to show Impact Moments instead of tweets
   - `src/pages/user/[id]/rituals.tsx` - New page for ritual stats
   - `src/pages/user/[id]/chains.tsx` - New page for joined chains

2. **Profile Components**
   - `src/components/user/user-karma-display.tsx` - Display karma prominently
   - `src/components/user/user-karma-breakdown.tsx` - Show breakdown by category
   - `src/components/user/user-impact-moments.tsx` - List user's impact moments
   - `src/components/user/user-ritual-stats.tsx` - Display ritual statistics

3. **Profile Layout**
   - `src/components/layout/user-home-layout.tsx` - Add karma display
   - `src/components/user/user-details.tsx` - Add karma to user details

**Profile Tabs:**
- **Impact Moments** - User's shared moments
- **Rituals** - Ritual completion stats and history
- **Joined Chains** - Moments where user joined someone else
- **Comments** - User's comments on others' moments

---

### Phase 5: Karma Display Components

**Components to Create:**

1. **KarmaBadge Component**
   - Display total karma points
   - Show rank/level if implementing levels
   - Animated when karma increases

2. **KarmaBreakdown Component**
   - Visual breakdown by category
   - Progress bars or charts
   - Show recent karma gains

3. **KarmaLeader Component** (Optional)
   - Leaderboard page
   - Top users by karma
   - Weekly/monthly/all-time rankings

---

### Phase 6: Migration & Backfill

**Migration Script:**
- `scripts/calculate-existing-karma.js`
- Calculate karma for all existing users
- Backfill karma based on historical data:
  - Count existing Impact Moments
  - Count Ritual Completions
  - Count Comments
  - Count Ripples received
  - Count Joined You actions

---

## Technical Implementation Details

### Database Structure

**User Document Updates:**
```typescript
{
  // ... existing user fields
  karmaPoints: 1250,
  karmaBreakdown: {
    impactMoments: 450,
    rituals: 300,
    engagement: 200,
    chains: 150,
    milestones: 150
  },
  lastKarmaUpdate: Timestamp
}
```

### API Endpoints

1. **GET /api/karma/[userId]**
   - Get user's karma points and breakdown
   - Public endpoint for profile display

2. **POST /api/karma/award**
   - Award karma for specific action
   - Server-side only (called from other APIs)
   - Validates action and calculates points

3. **POST /api/karma/recalculate**
   - Recalculate karma for a user
   - Useful for migrations or corrections
   - Admin or user-initiated

### Firestore Rules Updates

```javascript
match /users/{userId} {
  // Allow read of karma fields publicly
  allow read: if true;
  
  // Only allow karma updates via API (server-side)
  allow update: if isSignedIn() && request.auth.uid == userId
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['karmaPoints', 'karmaBreakdown', 'lastKarmaUpdate']);
}
```

---

## UI/UX Considerations

### Profile Page Layout

1. **Header Section**
   - User avatar and cover photo
   - Karma points prominently displayed (large, animated)
   - Karma breakdown widget (expandable)

2. **Stats Section**
   - Total Impact Moments
   - Ritual streak
   - Total karma points
   - Rank/level (if implementing)

3. **Content Tabs**
   - Impact Moments (default)
   - Rituals
   - Joined Chains
   - Comments

4. **Achievement Badges** (Future)
   - Visual badges for milestones
   - Display on profile

### Karma Display Guidelines

- **Prominent but not overwhelming** - Karma should be visible but not dominate
- **Celebrate increases** - Animate when karma increases
- **Show progress** - Visual indicators for next milestone
- **Breakdown transparency** - Users can see how they earned points

---

## Testing Plan

1. **Unit Tests**
   - Karma calculation functions
   - Point value assignments
   - Breakdown calculations

2. **Integration Tests**
   - Karma awarded on Impact Moment creation
   - Karma awarded on Ritual completion
   - Karma awarded on Comments
   - Karma awarded on Ripples

3. **E2E Tests**
   - Complete flow: Create moment → Check karma increase
   - Complete flow: Complete ritual → Check karma increase
   - Profile page displays karma correctly

---

## Migration Strategy

1. **Phase 1:** Deploy karma system with zero points for new actions
2. **Phase 2:** Run migration script to calculate existing user karma
3. **Phase 3:** Enable karma display on profiles
4. **Phase 4:** Add karma to Impact Moment cards and other locations

---

## Future Enhancements

- **Karma Levels/Tiers** - Bronze, Silver, Gold based on total karma
- **Karma Leaderboards** - Weekly, monthly, all-time rankings
- **Karma Badges** - Visual badges for achievements
- **Karma History** - Timeline of karma gains
- **Karma Gifts** - Ability to gift karma to others (optional)
- **Karma Challenges** - Community challenges with karma rewards

---

## Success Metrics

- User engagement increase (more Impact Moments, Rituals)
- Profile page views increase
- Time spent on platform increases
- Community participation increases

---

## Dependencies

- Existing Impact Moments system ✅
- Existing Daily Rituals system ✅
- Existing Comments system ✅
- Existing Ripple reactions system ✅
- User authentication system ✅

---

## Estimated Timeline

- **Phase 1-2:** 2-3 days (Data model + Calculation system)
- **Phase 3:** 2-3 days (Integration with existing features)
- **Phase 4:** 3-4 days (Profile page redesign)
- **Phase 5:** 1-2 days (Display components)
- **Phase 6:** 1 day (Migration script)

**Total:** ~10-13 days

---

## Notes

- Karma should be calculated server-side to prevent manipulation
- Consider rate limiting on karma updates
- Cache karma calculations for performance
- Consider implementing karma decay over time (optional)
- Ensure karma system aligns with platform values (wellness, positivity)

