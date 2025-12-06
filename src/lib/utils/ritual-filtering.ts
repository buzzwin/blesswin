import type { RitualDefinition } from '@lib/types/ritual';
import type { SortOption } from '@components/rituals/rituals-sort';

/**
 * Filter rituals by search query
 */
export function filterRitualsBySearch(
  rituals: RitualDefinition[],
  searchQuery: string
): RitualDefinition[] {
  if (!searchQuery.trim()) {
    return rituals;
  }

  const query = searchQuery.toLowerCase().trim();

  return rituals.filter((ritual) => {
    const titleMatch = ritual.title?.toLowerCase().includes(query);
    const descriptionMatch = ritual.description?.toLowerCase().includes(query);
    const tagsMatch = ritual.tags?.some((tag) =>
      tag.toLowerCase().includes(query)
    );

    return titleMatch || descriptionMatch || tagsMatch;
  });
}

/**
 * Sort rituals by the specified option
 */
export function sortRituals(
  rituals: RitualDefinition[],
  sortBy: SortOption
): RitualDefinition[] {
  const sorted = [...rituals];

  let compareFn: (a: RitualDefinition, b: RitualDefinition) => number;

  switch (sortBy) {
    case 'popularity': {
      // Sort by participant count (joinedByUsers length) descending
      compareFn = (a, b) => {
        const aCount = a.joinedByUsers?.length || 0;
        const bCount = b.joinedByUsers?.length || 0;
        if (bCount !== aCount) {
          return bCount - aCount;
        }
        // Secondary sort by usage count if available
        const aUsage = a.usageCount || 0;
        const bUsage = b.usageCount || 0;
        return bUsage - aUsage;
      };
      break;
    }

    case 'newest': {
      // Sort by createdAt descending (newest first)
      compareFn = (a, b) => {
        const aDate = a.createdAt
          ? a.createdAt instanceof Date
            ? a.createdAt.getTime()
            : (a.createdAt as any).toMillis?.() || 0
          : 0;
        const bDate = b.createdAt
          ? b.createdAt instanceof Date
            ? b.createdAt.getTime()
            : (b.createdAt as any).toMillis?.() || 0
          : 0;
        return bDate - aDate;
      };
      break;
    }

    case 'karma': {
      // Sort by completion rate or usage count (proxy for karma earned)
      compareFn = (a, b) => {
        const aScore = a.completionRate || a.usageCount || 0;
        const bScore = b.completionRate || b.usageCount || 0;
        return bScore - aScore;
      };
      break;
    }

    case 'alphabetical': {
      // Sort by title alphabetically
      compareFn = (a, b) => {
        const aTitle = a.title?.toLowerCase() || '';
        const bTitle = b.title?.toLowerCase() || '';
        return aTitle.localeCompare(bTitle);
      };
      break;
    }

    default:
      // No sorting needed - return original array
      return sorted;
  }

  return sorted.sort(compareFn);
}

/**
 * Apply both search and sort to rituals
 */
export function filterAndSortRituals(
  rituals: RitualDefinition[],
  searchQuery: string,
  sortBy: SortOption
): RitualDefinition[] {
  const filtered = filterRitualsBySearch(rituals, searchQuery);
  return sortRituals(filtered, sortBy);
}

