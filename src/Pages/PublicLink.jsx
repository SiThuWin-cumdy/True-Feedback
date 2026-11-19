import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  fetchLinkBySlug,
  selectCurrentLink,
  selectLinksStatus,
  selectLinksError,
} from '../features/feedbackLinks/feedbackLinksSlice';
import axiosInstance from '../api/axiosInstance';
import { selectUser } from '../features/auth/authSlice';
import { LoadMore } from '../components/Pagination';
import {
  createReply,
  selectReplies,
  selectRepliesStatus,
  selectRepliesError,
  selectRepliesPagination,
  incrementSkip,
  setSkip,
  clearReplies,
  fetchReplies,
} from '../features/replies/repliesSlice';

export const PublicLink = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const [replyError, setReplyError] = useState('');

  // AI Suggestions state - shown BEFORE submit
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Fetch link details when slug changes
  useEffect(() => {
    if (!currentLink || currentLink.slug !== slug) {
      dispatch(fetchLinkBySlug(slug)).then((linkData) => {
        const title = linkData?.payload?.title || '';
        const description = linkData?.payload?.description || '';
        debugger;
        if (title || description) {
          axiosInstance.post('/feedback-suggestions', {
            topicTitle: title,
            topicDescription: description,
          })
            .then((response) => {
              const suggestions = response || [];
              setAiSuggestions(suggestions);
            })
            .catch((error) => {
              console.error('AI suggestions error:', error);
              setAiSuggestions([]);
            });
        }
      }).catch((error) => {
        console.error('Fetch link error:', error);
      });
    }
  }, [dispatch, slug]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      user: '',
      message: '',
    },
  });

  const currentLink = useSelector(selectCurrentLink);
  const linksStatus = useSelector(selectLinksStatus);
  const linksError = useSelector(selectLinksError);
  const user = useSelector(selectUser);
  const replies = useSelector(selectReplies);
  const repliesStatus = useSelector(selectRepliesStatus);
  const repliesError = useSelector(selectRepliesError);
  const { totalCount, hasMore } = useSelector(
    selectRepliesPagination
  );



  // Only fetch replies if the logged-in user is the owner of the link
  const isOwner = user && currentLink && currentLink.user === user._id;

  useEffect(() => { 
    // Reset replies state when link changes
    dispatch(clearReplies());
    dispatch(setSkip(0));

    if (isOwner && currentLink?._id) {
      dispatch(fetchReplies({ linkId: currentLink._id }));
    }
  }, [dispatch, isOwner, currentLink?._id]);

  const isActive = currentLink?.is_active !== false;

  const onSubmit = async (data) => {
    setReplyError('');

    if (!isActive) {
      setReplyError('This feedback link is not accepting replies.');
      return;
    }

    // Use selected suggestion if any, otherwise use the textarea value
    const message = selectedSuggestion || data.message;

    try {
      await dispatch(
        createReply({
          linkId: currentLink._id,
          replyData: {
            user: data.user || null,
            message,
          },
        })
      ).unwrap();

      if (isOwner) {
        dispatch(fetchReplies({ linkId: currentLink._id, skip: 0, limit: 10 }));
      }

      // Reset AI suggestions after submit
      setAiSuggestions([]);
    } catch (err) {
      setReplyError(err.message || 'Failed to send feedback');
    }
  };

  const loadMore = () => {
    dispatch(incrementSkip());
    dispatch(fetchReplies({ linkId: currentLink?._id }));
  };

  if (linksStatus === 'loading' && !currentLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentLink || linksError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Link Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The feedback link you're looking for doesn't exist or is not active.
          </p>
          <Link to="/" className="mt-6 inline-block btn-primary px-6 py-2">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold dark:bg-indigo-500">
                TF
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                TrueFeedback
              </span>
            </Link>
            <a
              href={`/${currentLink.slug}`}
              className="text-sm text-gray-600 dark:text-gray-400 font-mono"
            >
              /{currentLink.slug}
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Slug: {currentLink.slug}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-balance">
                {currentLink.title}
              </h1>
              {currentLink.description && (
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {currentLink.description}
                </p>
              )}
              {isOwner && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                  You are the owner of this link
                </p>
              )}
            </div>
          </div>
        </div>

        {isActive ? (
          <>
            {/* Reply Form */}
            <div className="card mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Leave Your Feedback
              </h2>
              {replyError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
                  {replyError}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label" htmlFor="user">
                    Your Name (optional)
                  </label>
                  <input
                    id="user"
                    className={`input ${errors.user ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500' : ''}`}
                    placeholder="Anonymous"
                    {...register('user')}
                  />
                  {errors.user && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Invalid name
                    </p>
                  )}
                </div>
                <div>
                  <label className="label" htmlFor="message">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className={`input ${errors.message ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500' : ''}`}
                    placeholder="Share your feedback..."
                    {...register('message', { required: 'Message is required' })}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3"
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>

                {/* AI Suggestions - shown BEFORE submit */}
                {aiSuggestions.length > 0 && (
                  <div className="card border-indigo-100 dark-border-indigo-900/30 mb-8">
                    <div className="p-4">
                      <h4 className="text-indigo-600 dark:text-indigo-300 font-semibold mb-3">
                        💡 Get AI Suggestions for Your Feedback
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        Click on any suggestion below to auto-fill your message:
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        {aiSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              const textArea = document.getElementById('message');
                              if (textArea) {
                                textArea.value = suggestion;
                              }
                            }}
                            className="w-full p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer transition-all text-sm text-indigo-700 dark:text-indigo-300"
                          >
                            <span className="font-medium">{index + 1}.</span> {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reply Form - displays after AI suggestions section */}

              </form>
            </div> 
            {/* Replies List - only visible to owner */}
            {isOwner ? (
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
                      <div key={reply._id} className="py-5">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-medium">
                            {(reply.user?.username || reply.user || 'Anonymous')[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {reply.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {reply.user?.username || reply.user || 'Anonymous'} •{' '}
                              {new Date(reply.created_at || reply.createdAt).toLocaleDateString()}
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
            ) : (
              <div className="card border-blue-100 dark-border-blue-900/30">
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                    👁️
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Replies are private
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Only the link owner can view reply messages. Sign in as the owner to see replies.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card border-amber-100 dark-border-amber-900/30">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
                ⏸️
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Feedback Link is Inactive
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This feedback link is currently not accepting replies.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
