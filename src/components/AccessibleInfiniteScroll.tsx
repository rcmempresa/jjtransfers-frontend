import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface AccessibleInfiniteScrollProps<T> {
  items: T[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  error?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemsPerPage?: number;
  loadMoreText?: string;
  loadingText?: string;
  endMessage?: string;
  className?: string;
}

function AccessibleInfiniteScroll<T extends { id: string | number }>({
  items,
  loadMore,
  hasMore,
  loading,
  error,
  renderItem,
  itemsPerPage = 10,
  loadMoreText = 'Load more items',
  loadingText = 'Loading more items...',
  endMessage = 'No more items to load',
  className = ''
}: AccessibleInfiniteScrollProps<T>) {
  const [manualMode, setManualMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [announceText, setAnnounceText] = useState('');
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Respect user preferences
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dataQuery = window.matchMedia('(prefers-reduced-data: reduce)');
    
    setReducedMotion(motionQuery.matches);
    setManualMode(motionQuery.matches || dataQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) setManualMode(true);
    };

    const handleDataChange = (e: MediaQueryListEvent) => {
      if (e.matches) setManualMode(true);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    dataQuery.addEventListener('change', handleDataChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      dataQuery.removeEventListener('change', handleDataChange);
    };
  }, []);

  // Intersection Observer for automatic loading
  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (loading || manualMode) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore().then(() => {
            setAnnounceText(`Loaded ${itemsPerPage} more items. ${items.length + itemsPerPage} items total.`);
          });
        }
      },
      { threshold: 0.1 }
    );
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMore, manualMode, itemsPerPage, items.length]);

  // Manual load more handler
  const handleManualLoadMore = async () => {
    try {
      await loadMore();
      setAnnounceText(`Loaded ${itemsPerPage} more items. ${items.length + itemsPerPage} items total.`);
      
      // Focus management - move focus to first new item
      setTimeout(() => {
        const newItemIndex = items.length - itemsPerPage;
        const newItem = containerRef.current?.children[newItemIndex] as HTMLElement;
        newItem?.focus();
      }, 100);
    } catch (err) {
      setAnnounceText('Failed to load more items. Please try again.');
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (hasMore && !loading) {
        handleManualLoadMore();
      }
    }
  };

  return (
    <div className={className}>
      {/* Items container */}
      <div
        ref={containerRef}
        className="space-y-4"
        role="feed"
        aria-label="Content feed"
        aria-busy={loading}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={index === items.length - 1 ? lastItemRef : null}
            className="focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 rounded-lg"
            tabIndex={-1}
            role="article"
            aria-posinset={index + 1}
            aria-setsize={hasMore ? -1 : items.length}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
          <Loader2 className="w-6 h-6 animate-spin text-gold mr-2" />
          <span className="text-gray-300">{loadingText}</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center py-8 text-red-500" role="alert">
          <AlertCircle className="w-6 h-6 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Manual load more button */}
      {(manualMode || !hasMore) && !loading && (
        <div className="flex justify-center py-8">
          {hasMore ? (
            <button
              ref={loadMoreRef}
              onClick={handleManualLoadMore}
              onKeyDown={handleKeyDown}
              className="bg-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 transition-colors"
              aria-describedby="load-more-help"
            >
              {loadMoreText}
            </button>
          ) : (
            <p className="text-gray-400 text-center" role="status">
              {endMessage}
            </p>
          )}
        </div>
      )}

      {/* Help text */}
      <div id="load-more-help" className="sr-only">
        Press Enter or Space to load more items. Use Tab to navigate through items.
      </div>

      {/* Settings toggle */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setManualMode(!manualMode)}
          className="text-sm text-gray-400 hover:text-gray-300 underline focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 rounded"
          aria-pressed={manualMode}
        >
          {manualMode ? 'Enable automatic loading' : 'Switch to manual loading'}
        </button>
      </div>

      {/* Live region for announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announceText}
      </div>
    </div>
  );
}

export default AccessibleInfiniteScroll;