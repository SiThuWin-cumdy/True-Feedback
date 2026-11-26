import { Spinner } from './PageState';

export const LoadMore = ({ isLoading, onLoadMore, shownCount, totalCount }) => (
  <div className="flex items-center gap-4 mt-2 pt-6 border-t border-line">
    <button type="button" onClick={onLoadMore} disabled={isLoading} className="btn-secondary">
      {isLoading && <Spinner className="w-4 h-4" />}
      {isLoading ? 'Loading' : 'Load more replies'}
    </button>
    <span className="text-sm text-muted tabular-nums">
      {shownCount} of {totalCount}
    </span>
  </div>
);
