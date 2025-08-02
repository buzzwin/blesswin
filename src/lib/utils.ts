import type { SyntheticEvent } from 'react';
import type { MotionProps } from 'framer-motion';
import { IncomingMessage } from 'http';
import { UrlWithParsedQuery } from 'url';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function preventBubbling(
  callback?: ((...args: never[]) => unknown) | null,
  noPreventDefault?: boolean
) {
  return (e: SyntheticEvent): void => {
    e.stopPropagation();

    if (!noPreventDefault) e.preventDefault();
    if (callback) callback();
  };
}

export function delayScroll(ms: number) {
  return (): NodeJS.Timeout => setTimeout(() => window.scrollTo(0, 0), ms);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getStatsMove(movePixels: number): MotionProps {
  return {
    initial: {
      opacity: 0,
      y: -movePixels
    },
    animate: {
      opacity: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      y: movePixels
    },
    transition: {
      type: 'tween',
      duration: 0.15
    }
  };
}

export function isPlural(count: number): string {
  return count > 1 ? 's' : '';
}

// TMDB Image URL utilities
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBImageSize {
  poster: {
    w92: string;
    w154: string;
    w185: string;
    w342: string;
    w500: string;
    w780: string;
    original: string;
  };
  backdrop: {
    w300: string;
    w780: string;
    w1280: string;
    original: string;
  };
  profile: {
    w45: string;
    w185: string;
    h632: string;
    original: string;
  };
}

export const TMDB_IMAGE_SIZES: TMDBImageSize = {
  poster: {
    w92: 'w92',
    w154: 'w154',
    w185: 'w185',
    w342: 'w342',
    w500: 'w500',
    w780: 'w780',
    original: 'original'
  },
  backdrop: {
    w300: 'w300',
    w780: 'w780',
    w1280: 'w1280',
    original: 'original'
  },
  profile: {
    w45: 'w45',
    w185: 'w185',
    h632: 'h632',
    original: 'original'
  }
};

/**
 * Generates a valid TMDB image URL with error handling
 * @param posterPath - The poster path from TMDB API
 * @param size - The image size to use (default: w92 for thumbnails)
 * @returns Valid image URL or null if invalid
 */
export function getTMDBImageUrl(
  posterPath: string | null | undefined,
  size: keyof TMDBImageSize['poster'] = 'w92'
): string | null {
  if (!posterPath || posterPath === 'null' || posterPath === 'undefined') {
    return null;
  }

  // Remove leading slash if present
  const cleanPath = posterPath.startsWith('/') ? posterPath.slice(1) : posterPath;
  
  // Validate the path contains valid characters
  if (!/^[a-zA-Z0-9/\-_.]+$/.test(cleanPath)) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}/${TMDB_IMAGE_SIZES.poster[size]}/${cleanPath}`;
}

/**
 * Generates a backdrop image URL
 * @param backdropPath - The backdrop path from TMDB API
 * @param size - The image size to use (default: w780)
 * @returns Valid backdrop URL or null if invalid
 */
export function getTMDBBackdropUrl(
  backdropPath: string | null | undefined,
  size: keyof TMDBImageSize['backdrop'] = 'w780'
): string | null {
  if (!backdropPath || backdropPath === 'null' || backdropPath === 'undefined') {
    return null;
  }

  const cleanPath = backdropPath.startsWith('/') ? backdropPath.slice(1) : backdropPath;
  
  if (!/^[a-zA-Z0-9/\-_.]+$/.test(cleanPath)) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}/${TMDB_IMAGE_SIZES.backdrop[size]}/${cleanPath}`;
}

/**
 * Checks if an image URL is likely to be valid
 * @param url - The image URL to validate
 * @returns Promise<boolean> - Whether the image is likely to load successfully
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
