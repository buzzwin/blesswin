# Buzzwin Product Roadmap

**Last Updated:** November 2024

This roadmap tracks the progress of Buzzwin's features, from completed implementations to future enhancements. Our mission is to empower people through small actions that create positive impact.

---

## 🎯 Mission Statement

**"Empowering people. One small action at a time."**

Buzzwin is a storytelling studio that amplifies good causes. We create and share stories that inspire positive change, wellness, and harmony in the world.

---

## ✅ Completed Features

### Core Platform

- [x] **Authentication System**

  - Google OAuth integration
  - Email/password authentication
  - Email verification
  - Secure session management

- [x] **Responsive Design**

  - Mobile-first approach
  - Dark/Light mode support
  - Responsive layouts across all pages
  - Touch-friendly interactions

- [x] **SEO & Social Sharing**
  - Comprehensive meta tags
  - Open Graph support
  - Twitter Cards
  - JSON-LD structured data
  - Public shareable links

### Impact Moments System

- [x] **Impact Moments Core**

  - Create and share impact moments
  - Tags: Mind, Body, Relationships, Nature, Community
  - Effort levels: Tiny, Medium, Deep
  - Optional mood check-in (Before/After)
  - Image/video support (structure ready)

- [x] **Ripple Reactions**

  - Inspired ✨
  - Grateful 🙏
  - Sent Love 💚
  - Joined You 🌱 (creates linked impact moment)

- [x] **"Joined You" Chain System**

  - Visual chain visualization on homepage
  - Chain view page (`/impact/[id]/chain`)
  - Track joined moments with `joinedFromMomentId`
  - Display "See who joined this action" links
  - Real-time chain updates

- [x] **Comments System**

  - Real-time comments on impact moments
  - User attribution
  - Delete own comments
  - Public read access

- [x] **Public Impact Moment Pages**

  - Public routes (`/public/moment/[id]`)
  - No authentication required to view
  - Social sharing with buzzwin.com links
  - Sign-in prompts for interaction

- [x] **AI Writing Assistance**
  - AI-powered text improvement
  - Auto-parsing of impact moments (tags, effort level, mood)
  - Gemini API integration

### Daily Rituals System

- [x] **Ritual Definitions**

  - Predefined ritual library
  - Tags, effort levels, time of day
  - Daily global ritual
  - Ritual seeding system

- [x] **User Ritual State**

  - Onboarding flow
  - Notification preferences (morning/evening, quiet hours)
  - Preferred categories/tags
  - Enable/disable toggle

- [x] **Ritual Completion**

  - Mark rituals as complete
  - Quiet completion option
  - Share as Impact Moment option
  - Duplicate prevention

- [x] **Streak & Statistics**

  - Current streak tracking
  - Longest streak calculation
  - Total completions
  - Weekly/monthly completion counts
  - Enhanced stats:
    - Average completions per day
    - Completion rate percentage
    - Best day of week
    - Completion trends (increasing/decreasing/stable)
    - Streak milestones
    - Completion milestones
    - Recent streak history
    - Tag-based statistics

- [x] **AI Personalization**

  - Analyze user patterns from Impact Moments
  - Analyze completion history
  - Generate personalized ritual suggestions (1-2 per day)
  - Filter recently completed rituals
  - Fallback to rule-based selection

- [x] **Ritual Settings**

  - Notification preferences (morning/evening times)
  - Quiet hours configuration
  - Preferred categories selection
  - Enable/disable rituals

- [x] **Ritual Integration**
  - Rituals banner on home feed
  - Ritual stats widget
  - Link to rituals page in navigation
  - Homepage section for Daily Rituals

### AI Wellness Guides

- [x] **Yoga AI Pal** (`/yoga`)

  - Personalized yoga guidance
  - Pose recommendations
  - Breathing techniques
  - Sequence suggestions

- [x] **Meditation & Mindfulness AI Pal** (`/meditation`)

  - Meditation guidance
  - Mindfulness practices
  - Breathing exercises
  - Stress relief techniques

- [x] **Harmony AI Pal** (`/harmony`)
  - Holistic life balance guidance
  - Relationship advice
  - Work-life harmony
  - Overall well-being support

### Content & Stories

- [x] **Blog System**

  - Blog post pages
  - SEO optimization
  - Clean, readable layout
  - Navigation integration

- [x] **Real Stories** (`/real-stories`)

  - Current events related to meditation, yoga, world peace
  - Gemini API integration for story generation
  - Date validation and prioritization
  - Clean, readable formatting

- [x] **Current Events**
  - Homepage integration
  - Real-time event updates
  - Link support for external sources

### Social Features

- [x] **Social Feed** (`/home`)

  - Impact Moments feed
  - Real-time updates
  - Infinite scroll
  - Filter by tags

- [x] **Social Sharing**
  - Web Share API support
  - Copy to clipboard fallback
  - Public shareable links
  - Buzzwin.com branding in shares

---

## 🚧 In Progress

### Homepage Redesign

- [ ] **Hero Section Update**
  - Update headline and subheadline per design spec
  - Add feature highlights section
  - Implement "What You Can Do Here" cards
  - Add Daily Rituals CTA section
  - Update "How It Works" flow
  - Add social proof section (optional)

**Status:** Design specification complete, implementation pending

---

## 📋 Planned Features

### Daily Rituals Enhancements

#### Priority 1: Push Notifications

- [ ] **Browser Push Notifications**
  - Web Push API integration
  - Service worker setup
  - Notification permission request
  - Scheduled notifications (morning/evening)
  - Milestone celebration notifications
  - Quiet hours respect
  - Background notification handling

**Dependencies:** Notification preferences already exist in settings

#### Priority 2: Pause/Resume Rituals

- [ ] **Pause Functionality**
  - Pause button in settings
  - Date picker for pause duration
  - Visual indicator when paused
  - Auto-resume after pause period
  - Update `pausedUntil` field in user state

**Dependencies:** `pausedUntil` field exists in data model

#### Priority 3: Ritual History & Analytics

- [ ] **Enhanced Visualization**
  - Calendar view of completions
  - Weekly/monthly completion charts
  - Ritual performance analytics
  - Most/least completed rituals
  - Completion patterns over time
  - Export completion data

**Dependencies:** Completion data already tracked

#### Priority 4: Email Notifications

- [ ] **Email Reminders**
  - Daily ritual reminder emails
  - Weekly progress summary emails
  - Milestone celebration emails
  - Email preferences in settings
  - Firebase Cloud Functions integration
  - Nodemailer or SendGrid integration

**Dependencies:** Firebase Functions setup exists

#### Priority 5: Ritual Reminders Widget

- [ ] **Persistent Reminder**
  - Widget on home feed
  - Quick complete action
  - Progress indicator
  - Time-based reminders
  - "You haven't completed today's ritual yet" prompts

### Impact Moments Enhancements

- [ ] **Image/Video Upload**

  - Firebase Storage integration
  - Image upload UI
  - Video upload support
  - Media preview
  - Storage optimization

- [ ] **Advanced Filtering**

  - Filter by tags
  - Filter by effort level
  - Filter by date range
  - Search functionality
  - Sort options

- [ ] **Impact Moment Analytics**
  - View counts
  - Engagement metrics
  - Chain growth tracking
  - Most impactful moments

### Social Features

- [ ] **User Profiles with Karma Points** ⭐ **HIGH PRIORITY**

  - Public profile pages
  - Impact Moments showcase
  - Ritual stats display
  - **Karma points system** - Track progress through positive actions
  - Karma breakdown by category (Impact Moments, Rituals, Engagement, Chains)
  - Profile tabs: Impact Moments, Rituals, Joined Chains, Comments
  - Karma display components
  - Migration script for existing users

  **See:** [KARMA_SYSTEM_PLAN.md](./KARMA_SYSTEM_PLAN.md) for detailed implementation plan

- [ ] **Follow/unfollow** (optional)

- [ ] **Notifications**

  - Ripple notifications
  - Comment notifications
  - "Joined You" notifications
  - Ritual reminders
  - In-app notification center

- [ ] **Social Discovery**
  - Discover similar users
  - Trending impact moments
  - Featured stories
  - Community highlights

### AI Enhancements

- [ ] **Enhanced AI Personalization**

  - Better ritual suggestions based on time/context
  - Weather-aware suggestions
  - Location-based suggestions
  - Activity-based suggestions

- [ ] **AI Content Generation**
  - Auto-generate blog posts
  - Story suggestions
  - Content recommendations

### Platform Improvements

- [ ] **Performance Optimization**

  - Image optimization
  - Code splitting
  - Lazy loading
  - Caching strategies

- [ ] **Accessibility**

  - Screen reader improvements
  - Keyboard navigation
  - ARIA labels
  - Color contrast improvements

- [ ] **Internationalization**

  - Multi-language support
  - Localized content
  - RTL support

- [ ] **Analytics Integration**
  - User behavior tracking
  - Feature usage analytics
  - Conversion tracking
  - A/B testing framework

---

## 🔮 Future Vision

### Long-term Features

- [ ] **Mobile Apps**

  - iOS app
  - Android app
  - Native push notifications
  - Offline support

- [ ] **Community Features**

  - Groups/communities
  - Challenges
  - Events
  - Local meetups

- [ ] **Integration Features**

  - Calendar integration
  - Health app integration
  - Social media integration
  - Third-party wellness apps

- [ ] **Monetization (Optional)**
  - Premium features
  - Sponsored content
  - Donation system
  - Partnership opportunities

---

## 📊 Feature Status Legend

- ✅ **Completed** - Feature is fully implemented and tested
- 🚧 **In Progress** - Currently being developed
- 📋 **Planned** - Planned for future implementation
- 🔮 **Future Vision** - Long-term ideas and possibilities

---

## 🎯 Current Focus Areas

1. **Homepage Redesign** - Update hero section and feature highlights per design specification
2. **User Profiles with Karma Points** - Implement comprehensive karma system to track user progress ⭐
3. **Push Notifications** - Complete the notification system for Daily Rituals
4. **User Experience** - Improve overall UX based on user feedback

---

## 📝 Notes

- All features prioritize user privacy and data security
- Features are designed to be inclusive and accessible
- The platform remains free and accessible to all users
- Community feedback drives feature prioritization

---

## 🔗 Related Documentation

- [README.md](./README.md) - Project overview and setup
- [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md) - Information architecture
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing documentation
- [SEEDING_RITUALS.md](./SEEDING_RITUALS.md) - Ritual seeding guide
- [KARMA_SYSTEM_PLAN.md](./KARMA_SYSTEM_PLAN.md) - Detailed plan for User Profiles with Karma Points

---

**Last Review Date:** November 2024
