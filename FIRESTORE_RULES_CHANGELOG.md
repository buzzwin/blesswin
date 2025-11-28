# Firestore Rules Changelog

This document tracks all changes to `firestore.rules` for version control and deployment tracking.

---

## Version 1.0.0 - 2024-11-28

### Added
- **Karma System Rules**
  - Added karma fields update permissions for `users/{userId}` collection
  - Fields: `karmaPoints`, `karmaBreakdown`, `lastKarmaUpdate`
  - Allows server-side API updates (when `request.auth == null`)
  - Allows user self-updates (when authenticated and matching userId)

### Modified
- **Users Collection Rules**
  - Updated `allow update` to include karma fields alongside disclaimer fields
  - Maintained backward compatibility with existing rules

### Notes
- Karma fields are optional and backward compatible
- Server-side API routes can update karma (validated in API layer)
- Public read allowed for karma points (for leaderboards)

---

## Version History Format

When updating rules, follow this format:

```markdown
## Version X.Y.Z - YYYY-MM-DD

### Added
- Description of new rules/collections

### Modified
- Description of rule changes

### Removed
- Description of removed rules

### Notes
- Any important notes or breaking changes
```

---

## Semantic Versioning

- **MAJOR** (X.0.0): Breaking changes, major security updates
- **MINOR** (0.Y.0): New collections, new permissions, non-breaking additions
- **PATCH** (0.0.Z): Bug fixes, clarifications, minor rule adjustments

---

## Deployment Checklist

Before deploying rules:
- [ ] Update version number in `firestore.rules`
- [ ] Update version number in this changelog
- [ ] Test rules locally if possible
- [ ] Review changes with team
- [ ] Deploy to staging first (if applicable)
- [ ] Deploy to production
- [ ] Verify rules are active in Firebase Console

---

**Current Version:** 1.0.0  
**Last Updated:** 2024-11-28

