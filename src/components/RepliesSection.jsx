import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearReplies,
  fetchReplies,
  selectRepliesState,
} from '../features/replies/repliesSlice';
import { ReplyList } from './ReplyList';

// The replies to a link, for its owner.
export const RepliesSection = ({ linkId, emptyText, className = 'mt-14' }) => {
  const dispatch = useDispatch();
  const { replies, totalCount, status, error } = useSelector(selectRepliesState);

  useEffect(() => {
    dispatch(fetchReplies({ linkId }));
    return () => dispatch(clearReplies());
  }, [dispatch, linkId]);

  return (
    <section className={className} aria-labelledby="replies-heading">
      <h2
        id="replies-heading"
        className="border-b border-ink pb-3 text-lg font-extrabold tracking-[-0.01em] text-ink"
      >
        Replies <span className="font-semibold text-muted tabular-nums">{totalCount}</span>
      </h2>

      {error && (
        <div className="alert mt-6" role="alert">
          {error}
        </div>
      )}

      <div className="mt-4">
        <ReplyList
          replies={replies}
          status={status}
          totalCount={totalCount}
          onLoadMore={() => dispatch(fetchReplies({ linkId, append: true }))}
          emptyText={emptyText}
        />
      </div>
    </section>
  );
};
