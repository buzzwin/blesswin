# Phase 2: Karma Calculation System - Test Results

**Date:** November 2024  
**Status:** ✅ COMPLETE

---

## Implementation Summary

Phase 2 implements the core karma calculation system with utilities and API endpoints for awarding and retrieving karma points.

---

## Files Created

### 1. `src/lib/utils/karma-calculator.ts`
**Purpose:** Core karma calculation utilities

**Functions Implemented:**
- ✅ `awardKarma(userId, action)` - Award karma to a single user
- ✅ `awardKarmaToMultiple(userIds, action)` - Award karma to multiple users
- ✅ `getUserKarma(userId)` - Get user's current karma values
- ✅ `recalculateUserKarma(userId)` - Placeholder for Phase 6 migration

**Features:**
- Updates both `karmaPoints` and `karmaBreakdown` in Firestore
- Automatically calculates category from action type
- Handles missing karma fields (defaults to 0)
- Updates `lastKarmaUpdate` timestamp
- Error handling for invalid users

### 2. `src/pages/api/karma/award.ts`
**Purpose:** API endpoint to award karma

**Endpoint:** `POST /api/karma/award`

**Request Body:**
```typescript
{
  userId: string;
  action: KarmaAction;
}
```

**Response:**
```typescript
{
  success: boolean;
  karmaPoints?: number;
  karmaBreakdown?: KarmaBreakdown;
  error?: string;
}
```

**Features:**
- Validates userId and action
- Validates action is a valid KarmaAction
- Returns updated karma values
- Error handling with appropriate status codes

### 3. `src/pages/api/karma/[userId].ts`
**Purpose:** API endpoint to get user karma (public)

**Endpoint:** `GET /api/karma/[userId]`

**Response:**
```typescript
{
  success: boolean;
  karmaPoints?: number;
  karmaBreakdown?: KarmaBreakdown;
  error?: string;
}
```

**Features:**
- Public endpoint (no authentication required)
- Returns user's karma points and breakdown
- Handles user not found (404)
- Error handling with appropriate status codes

---

## Testing

### Build Status
✅ **TypeScript Compilation:** Success  
✅ **Linting:** No errors  
✅ **Type Safety:** All types validated

### Manual Testing Checklist
- [ ] Test awarding karma via API
- [ ] Test getting user karma via API
- [ ] Test error handling (invalid userId, invalid action)
- [ ] Test karma breakdown calculation
- [ ] Test multiple user karma awards

---

## Integration Points

These utilities and APIs are ready to be integrated into:

1. **Impact Moments Creation** (`src/pages/api/impact-moments.ts`)
   - Award karma when moment is created
   - Award bonus for mood check-in
   - Award bonus for ritual-based moments

2. **Ritual Completion** (`src/pages/api/rituals/complete.ts`)
   - Award karma for quiet completion
   - Award karma for shared completion
   - Award milestone bonuses for streaks

3. **Comments** (`src/pages/api/comments.ts` - if exists)
   - Award karma when comment is created

4. **Ripples** (`src/pages/home.tsx` or ripple handler)
   - Award karma to moment creator when ripple is received

5. **Joined You Actions** (`src/pages/home.tsx` or join handler)
   - Award karma to original creator
   - Award karma to user who joined

---

## Example Usage

### Award Karma via API
```typescript
const response = await fetch('/api/karma/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    action: 'impact_moment_created'
  })
});

const result = await response.json();
// result.karmaPoints = 10
// result.karmaBreakdown.impactMoments = 10
```

### Get User Karma
```typescript
const response = await fetch('/api/karma/user123');
const karma = await response.json();
// karma.karmaPoints = 150
// karma.karmaBreakdown = { impactMoments: 50, rituals: 30, ... }
```

### Award Karma Directly (Server-side)
```typescript
import { awardKarma } from '@lib/utils/karma-calculator';

const result = await awardKarma('user123', 'ritual_completed_shared');
// result.karmaPoints = 10
// result.karmaBreakdown.rituals = 10
```

---

## Next Steps

**Phase 3: Integrate Karma Tracking**
- Integrate karma awards into existing API endpoints
- Add milestone detection logic
- Test end-to-end karma flow

---

**Phase 2 Status:** ✅ COMPLETE

