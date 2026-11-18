import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { LoadMore } from '../components/Pagination';

export const Replies = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!currentLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="card text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Link not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The feedback link doesn't exist.</p>
          <Link to="/dashboard" className="mt-4 inline-block btn-primary px-6 py-2">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-6">
          <Link
            to={`/dashboard`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Link
          </Link>
        </nav>

        <div className="card mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {currentLink.title}
              </h1>
              {currentLink.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {currentLink.description}
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                All replies for this feedback link
              </p>
            </div>
          </div>
        </div>

        {repliesError && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
            {repliesError}
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              R
            </span>
            All Replies ({totalCount})
          </h2>

          {repliesStatus === 'loading' ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading replies...</p>
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No replies yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {replies.map((reply) => (
                <div key={reply._id} className="py-5">
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

          <LoadMore
            hasMore={hasMore}
            isLoading={repliesStatus === 'loading'}
            onLoadMore={loadMore}
            totalCount={totalCount}
          />
        </div>
      </div>
    </div>
  );
};
