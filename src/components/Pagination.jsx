import { Spinner } from './PageState';

export const LoadMore = ({ hasMore, isLoading, onLoadMore, shownCount, totalCount }) => {
  if (!hasMore) return null;

  return (
    <div className="flex items-center gap-4 mt-2 pt-6 border-t border-line">
      <button onClick={onLoadMore} disabled={isLoading} className="btn-secondary">
        {isLoading && <Spinner className="w-4 h-4" />}
        {isLoading ? 'Loading' : 'Load more replies'}
      </button>
      {totalCount != null && (
        <span className="text-sm text-muted tabular-nums">
          {shownCount != null ? `${shownCount} of ${totalCount}` : `${totalCount} total`}
        </span>
      )}
    </div>
  );
};
