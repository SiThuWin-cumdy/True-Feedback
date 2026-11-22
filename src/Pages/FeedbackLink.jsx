import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  fetchLinkById,
  selectCurrentLink,
  selectLinksStatus,
  selectLinksError,
} from '../features/feedbackLinks/feedbackLinksSlice';
import {
  createReply,
  selectReplies,
  selectRepliesStatus,
  selectRepliesPagination,
  incrementSkip,
  setSkip,
  clearReplies,
  fetchReplies,
} from '../features/replies/repliesSlice';
import { ReplyList } from '../components/Replies';
import { LinkHeader } from '../components/LinkHeader';
import { PageLoader, PageMessage, BackLink } from '../components/PageState';

export const FeedbackLink = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [replyMessage, setReplyMessage] = useState('');
  const [replyUser, setReplyUser] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentLink = useSelector(selectCurrentLink);
  const linksStatus = useSelector(selectLinksStatus);
  const linksError = useSelector(selectLinksError);
  const replies = useSelector(selectReplies);
  const repliesStatus = useSelector(selectRepliesStatus);
  const { totalCount, hasMore } = useSelector(selectRepliesPagination);

  useEffect(() => {
    // Reset replies state when navigating to this page
    dispatch(clearReplies());
    dispatch(setSkip(0));

    if (!currentLink || currentLink._id !== id) {
      dispatch(fetchLinkById(id));
    }
    dispatch(fetchReplies({ linkId: id }));
  }, [dispatch, id, currentLink]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await dispatch(
        createReply({ linkId: id, replyData: { user: replyUser || null, message: replyMessage } })
      ).unwrap();
      setReplyMessage('');
      setReplyUser('');
      dispatch(clearReplies());
      dispatch(setSkip(0));
      dispatch(fetchReplies({ linkId: id }));
    } catch (err) {
      setError(err.message || 'Your reply was not sent. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadMore = () => {
    dispatch(incrementSkip());
    dispatch(fetchReplies({ linkId: id }));
  };

  if (linksStatus === 'loading' && !currentLink) {
    return <PageLoader label="Loading link" />;
  }

  if (!currentLink) {
    return (
      <PageMessage title="Link not found" action="Back to your links" actionTo="/dashboard">
        This feedback link doesn't exist, or it belongs to another account.
      </PageMessage>
    );
  }

  const isActive = currentLink.is_active !== false;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <BackLink to="/dashboard">All links</BackLink>
      <LinkHeader link={currentLink} />

      {linksError && (
        <div className="alert mt-8" role="alert">
          {linksError}
        </div>
      )}

      {isActive ? (
        <form onSubmit={handleSubmitReply} className="card mt-10 space-y-5">
          <h2 className="text-lg font-extrabold tracking-[-0.01em] text-ink">Add a reply</h2>
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          <div>
            <label className="label" htmlFor="reply-message">
              Feedback
            </label>
            <textarea
              id="reply-message"
              rows={4}
              className="input font-voice text-[17px] leading-relaxed"
              value={replyMessage}
              onChange={(e) => {
                setReplyMessage(e.target.value);
                setError('');
              }}
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="label" htmlFor="reply-user">
                Name <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                type="text"
                id="reply-user"
                className="input"
                placeholder="Anonymous"
                value={replyUser}
                onChange={(e) => setReplyUser(e.target.value)}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary h-11 px-5">
              {submitting ? 'Sending' : 'Send feedback'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-10 rounded-lg bg-sunken px-5 py-4 text-muted">
          This link is closed, so it isn't accepting replies. Reopen it from your links page to
          collect more.
        </p>
      )}

      <section className="mt-14" aria-labelledby="replies-heading">
        <h2
          id="replies-heading"
          className="border-b border-ink pb-3 text-lg font-extrabold tracking-[-0.01em] text-ink"
        >
          Replies <span className="font-semibold text-muted tabular-nums">{totalCount ?? replies.length}</span>
        </h2>
        <div className="mt-4">
          <ReplyList
            replies={replies}
            status={repliesStatus}
            hasMore={hasMore}
            totalCount={totalCount}
            onLoadMore={loadMore}
          />
        </div>
      </section>
    </main>
  );
};
