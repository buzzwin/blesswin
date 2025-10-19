import { useState, useEffect } from 'react';

interface UseImageWithFallbackOptions {
  src: string;
  fallback?: string;
  width?: number;
  height?: number;
}

export function useImageWithFallback({
  src,
  fallback,
  width = 300,
  height = 450
}: UseImageWithFallbackOptions) {
  const [imageUrl, setImageUrl] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageUrl(fallback || `/api/placeholder/${width}/${height}`);
      setIsLoading(false);
      return;
    }

    // For TMDB URLs, try them directly first
    if (src.includes('image.tmdb.org')) {
      setImageUrl(src);
      setIsLoading(false);
    } else {
      // For non-TMDB URLs, try them directly
      setImageUrl(src);
      setIsLoading(false);
    }
  }, [src, fallback, width, height]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageUrl(fallback || `/api/placeholder/${width}/${height}`);
    }
  };

  return {
    imageUrl,
    isLoading,
    hasError,
    handleError
  };
}
