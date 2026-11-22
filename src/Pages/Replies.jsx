import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  selectCurrentLink,
  selectLinksStatus,
  fetchLinkById,
} from '../features/feedbackLinks/feedbackLinksSlice';
import {
  selectReplies,
  selectRepliesStatus,
  selectRepliesError,
  selectRepliesPagination,
  incrementSkip,
  setSkip,
  clearReplies,
  fetchReplies,
} from '../features/replies/repliesSlice';
import { ReplyList } from '../components/Replies';
import { LinkHeader } from '../components/LinkHeader';
import { PageLoader, PageMessage, BackLink } from '../components/PageState';

export const Replies = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const currentLink = useSelector(selectCurrentLink);
  const linksStatus = useSelector(selectLinksStatus);
  const replies = useSelector(selectReplies);
  const repliesStatus = useSelector(selectRepliesStatus);
  const repliesError = useSelector(selectRepliesError);
  const { totalCount, hasMore } = useSelector(selectRepliesPagination);

  useEffect(() => {
    // Reset replies state when navigating to this page
    dispatch(clearReplies());
    dispatch(setSkip(0));

    if (!currentLink || currentLink._id !== id) {
      dispatch(fetchLinkById(id));
      return;
    }
    dispatch(fetchReplies({ linkId: id }));
  }, [dispatch, id, currentLink]);

  const loadMore = () => {
    dispatch(incrementSkip());
    dispatch(fetchReplies({ linkId: id }));
  };

  if (linksStatus === 'loading' && !currentLink) {
    return <PageLoader />;
  }

  if (!currentLink) {
    return (
      <PageMessage title="Link not found" action="Back to your links" actionTo="/dashboard">
        This feedback link doesn't exist, or it belongs to another account.
      </PageMessage>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <BackLink to="/dashboard">All links</BackLink>
      <LinkHeader link={currentLink} />

      <section className="mt-14" aria-labelledby="replies-heading">
        <h2
          id="replies-heading"
          className="border-b border-ink pb-3 text-lg font-extrabold tracking-[-0.01em] text-ink"
        >
          Replies <span className="font-semibold text-muted tabular-nums">{totalCount ?? replies.length}</span>
        </h2>

        {repliesError && (
          <div className="alert mt-6" role="alert">
            {repliesError}
          </div>
        )}

        <div className="mt-4">
          <ReplyList
            replies={replies}
            status={repliesStatus}
            hasMore={hasMore}
            totalCount={totalCount}
            onLoadMore={loadMore}
            emptyText="No replies yet. Copy the link above and share it wherever your audience is."
          />
        </div>
      </section>
    </main>
  );
};
