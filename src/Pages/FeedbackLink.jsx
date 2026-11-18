import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchLinkById,
  selectCurrentLink,
  selectLinksStatus,
  selectLinksError,
  clearCurrentLink,
} from '../features/feedbackLinks/feedbackLinksSlice';
import {
  createReply,
  selectReplies,
  selectRepliesStatus,
  selectRepliesError,
  selectRepliesPagination,
  setPage,
  fetchReplies,
} from '../features/replies/repliesSlice';
import { Pagination } from '../components/Pagination';

export const FeedbackLink = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const repliesError = useSelector(selectRepliesError);
  const { currentPage, totalPages, totalCount } = useSelector(selectRepliesPagination);

  useEffect(() => {
    if (!currentLink || currentLink.id !== id) {
      dispatch(fetchLinkById(id));
    }
    dispatch(fetchReplies({ linkId: id, page: 1, limit: 10 }));
  }, [dispatch, id, currentLink]);

  const handleReplyChange = (e) => {
    setReplyMessage(e.target.value);
    setError('');
  };

  const handleUserChange = (e) => {
    setReplyUser(e.target.value);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await dispatch(createReply({ linkId: id, replyData: { user: replyUser || null, message: replyMessage } })).unwrap();
      setReplyMessage('');
      setReplyUser('');
      dispatch(fetchReplies({ linkId: id, page: 1, limit: 10 }));
    } catch (err) {
      setError(err.message || 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
    dispatch(fetchReplies({ linkId: id, page, limit: 10 }));
  };

  if (linksStatus === 'loading' && !currentLink) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading link...</p>
      </div>
    );
  }

  if (!currentLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="card text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Link not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The feedback link you're looking for doesn't exist.</p>
          <Link to="/dashboard" className="mt-4 inline-block btn-primary px-6 py-2">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const isActive = currentLink.is_active !== false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-6">
          <Link
            to="/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </nav>

        <div className="card mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {currentLink.title}
              </h1>
              {currentLink.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {currentLink.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
                  {isActive ? 'Active - Accepting Replies' : 'Inactive - Not Accepting Replies'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Slug: {currentLink.slug}
                </span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Link
                to={`/links/${currentLink.id}/replies`}
                className="btn-secondary px-4 py-2 text-sm"
              >
                View All Replies
              </Link>
            </div>
          </div>
        </div>

        {linksError && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
            {linksError}
          </div>
        )}

        {isActive ? (
          <>
            <div className="card mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Leave Your Feedback
              </h2>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <div>
                  <label className="label" htmlFor="reply-user">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    id="reply-user"
                    className="input"
                    placeholder="Anonymous"
                    value={replyUser}
                    onChange={handleUserChange}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="reply-message">
                    Your Message
                  </label>
                  <textarea
                    id="reply-message"
                    rows={4}
                    className="input"
                    placeholder="Share your feedback..."
                    value={replyMessage}
                    onChange={handleReplyChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3"
                >
                  {submitting ? 'Submitting...' : 'Send Feedback'}
                </button>
              </form>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  R
                </span>
                Replies ({replies.length})
              </h2>
              {repliesStatus === 'loading' ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading replies...</p>
                </div>
              ) : replies.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No replies yet. Be the first to share your feedback!
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {replies.map((reply) => (
                    <div key={reply.id} className="py-5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-medium">
                          {(reply.user?.username || reply.user || 'Anonymous')[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">{reply.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {reply.user?.username || reply.user || 'Anonymous'} • {new Date(reply.created_at || reply.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalCount={totalCount}
              />
            </div>
          </>
        ) : (
          <div className="card border-amber-100 dark:border-amber-900/30">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
                ⏸️
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Feedback Link is Inactive
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This feedback link is currently not accepting replies. Activate it from your dashboard to collect feedback.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
