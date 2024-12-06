import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { HeroIcon } from '@components/ui/hero-icon';
import { Modal } from '@components/modal/modal';
import { cn } from '@lib/utils';
import type { Bookmark } from '@lib/types/bookmark';

type ShareReelProps = {
  bookmarks: Bookmark[];
  isOpen: boolean;
  onClose: () => void;
};

export function ShareReel({
  bookmarks,
  isOpen,
  onClose
}: ShareReelProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Bookmark[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewRef, setPreviewRef] = useState<HTMLDivElement | null>(null);

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedBookmarks([]);
      setCurrentIndex(0);
    }
  }, [isOpen]);

  // Handle preview scaling
  useEffect(() => {
    if (!previewRef) return;

    const updateScale = () => {
      const container = previewRef.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const targetWidth = 1080;
      const targetHeight = 1920;

      const scaleX = containerWidth / targetWidth;
      const scaleY = containerHeight / targetHeight;
      const scale = Math.min(scaleX, scaleY);

      const translateX = (containerWidth - targetWidth * scale) / 2;
      const translateY = (containerHeight - targetHeight * scale) / 2;

      previewRef.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [previewRef]);

  const toggleBookmark = (bookmark: Bookmark) => {
    setSelectedBookmarks((prev) => {
      const isSelected = prev.some((b) => b.id === bookmark.id);
      if (isSelected) {
        return prev.filter((b) => b.id !== bookmark.id);
      }
      return [...prev, bookmark];
    });
  };

  const downloadStory = async (): Promise<void> => {
    try {
      setLoading(true);
      const node = document.getElementById('story-preview');
      if (!node) return;

      const cloneNode = node.cloneNode(true) as HTMLElement;
      cloneNode.style.transform = 'none';
      document.body.appendChild(cloneNode);

      try {
        const image = await toPng(cloneNode, {
          quality: 1.0,
          pixelRatio: 3,
          width: 1080,
          height: 1920,
          backgroundColor: '#000000'
        });

        const link = document.createElement('a');
        link.download = `buzzwin-story-${currentIndex + 1}.png`;
        link.href = image;
        link.click();
      } finally {
        document.body.removeChild(cloneNode);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} closeModal={onClose}>
      <div className='w-full max-w-lg p-6 bg-white rounded-xl dark:bg-gray-900'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-bold'>Create Instagram Story</h2>
          <button
            onClick={onClose}
            className='p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <HeroIcon className='w-5 h-5' iconName='XMarkIcon' />
          </button>
        </div>

        {/* Selection Grid */}
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='font-medium'>
              Select Items ({selectedBookmarks.length})
            </h3>
            <button
              onClick={() =>
                setSelectedBookmarks(selectedBookmarks.length ? [] : bookmarks)
              }
              className='text-sm text-blue-500 hover:text-blue-600'
            >
              {selectedBookmarks.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className='grid grid-cols-4 gap-2 p-2 overflow-y-auto rounded-lg max-h-40 bg-gray-50 dark:bg-gray-800'>
            {bookmarks.map((bookmark) => (
              <button
                key={bookmark.id}
                onClick={() => toggleBookmark(bookmark)}
                className={cn(
                  'relative aspect-[2/3] overflow-hidden rounded-md transition-all',
                  selectedBookmarks.some((b) => b.id === bookmark.id)
                    ? 'ring-2 ring-blue-500'
                    : 'opacity-50 hover:opacity-75'
                )}
              >
                {bookmark.posterPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w154${bookmark.posterPath}`}
                    alt={bookmark.title}
                    width={154}
                    height={231}
                    className='object-cover'
                    unoptimized
                  />
                ) : (
                  <div className='flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700'>
                    <HeroIcon
                      className='w-6 h-6 text-gray-400'
                      iconName='PhotoIcon'
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className='relative mx-auto aspect-[9/16] w-full overflow-hidden rounded-lg bg-black sm:h-[60vh]'>
          {selectedBookmarks.length > 0 ? (
            <>
              <div
                ref={setPreviewRef}
                id='story-preview'
                className='absolute left-0 top-0 h-[1920px] w-[1080px] origin-top-left bg-black'
              >
                {/* Story Content */}
                {/* ... Your existing story content using selectedBookmarks[currentIndex] ... */}
              </div>

              {/* Navigation Controls */}
              {selectedBookmarks.length > 1 && (
                <div className='absolute flex items-center gap-4 px-4 py-2 text-white -translate-x-1/2 rounded-full bottom-4 left-1/2 bg-black/50'>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === 0 ? selectedBookmarks.length - 1 : prev - 1
                      )
                    }
                    className='p-1 hover:text-blue-400'
                  >
                    <HeroIcon className='w-5 h-5' iconName='ChevronLeftIcon' />
                  </button>
                  <span className='min-w-[3ch] text-center'>
                    {currentIndex + 1}/{selectedBookmarks.length}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === selectedBookmarks.length - 1 ? 0 : prev + 1
                      )
                    }
                    className='p-1 hover:text-blue-400'
                  >
                    <HeroIcon className='w-5 h-5' iconName='ChevronRightIcon' />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className='flex items-center justify-center h-full text-gray-400'>
              Select items to preview
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3 mt-6'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          >
            Cancel
          </button>
          <button
            onClick={downloadStory}
            disabled={loading || !selectedBookmarks.length}
            className='flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50'
          >
            {loading ? (
              <HeroIcon
                className='w-5 h-5 animate-spin'
                iconName='ArrowPathIcon'
              />
            ) : (
              <HeroIcon className='w-5 h-5' iconName='ArrowDownTrayIcon' />
            )}
            Download Story
          </button>
        </div>
      </div>
    </Modal>
  );
}
