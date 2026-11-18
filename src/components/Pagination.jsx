import { useState } from 'react';

export const LoadMore = ({
  hasMore,
  isLoading,
  onLoadMore,
  totalCount,
}) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={onLoadMore}
        disabled={!hasMore || isLoading}
        className="btn-secondary px-8 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          <>
            <span>Load More</span>
            <span className="text-xs opacity-75">({totalCount} total)</span>
          </>
        )}
      </button>
    </div>
  );
};