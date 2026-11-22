import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  fetchLinkBySlug,
  selectCurrentLink,
  selectLinksStatus,
  selectLinksError,
} from '../features/feedbackLinks/feedbackLinksSlice';
import axiosInstance from '../api/axiosInstance';
import { selectUser } from '../features/auth/authSlice';
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
import { PageLoader, PageMessage, Spinner } from '../components/PageState';

// Shown after sending: the note drops into the box's slot.
const SentNote = ({ message, name, onWriteAnother }) => (
  <section className="mt-10 max-w-xl" aria-live="polite">
    <div className="relative h-40 overflow-hidden" aria-hidden="true">
      <div className="slip-drop absolute inset-x-6 sm:inset-x-10 top-3 bottom-0 rounded-sm bg-note px-5 py-4 text-note-ink">
        <p className="font-voice text-[16px] leading-relaxed line-clamp-4 whitespace-pre-line break-words">
          {message}
        </p>
      </div>
    </div>
    <div className="h-3 rounded-full bg-ink" aria-hidden="true" />

    <div className="fade-in-late mt-8">
      <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink">Feedback sent</h2>
      <p className="mt-2 text-[17px] text-muted leading-relaxed">
        {name
          ? `Sent with your name, ${name}. Only the owner of this page can read it.`
          : "Sent anonymously. The owner can read it, but they can't see who wrote it."}
      </p>
      <button onClick={onWriteAnother} className="btn-secondary mt-6">
        Write another
      </button>
    </div>
  </section>
);

export const PublicLink = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const [replyError, setReplyError] = useState('');
  const [sent, setSent] = useState(null);

  // AI Suggestions state - shown BEFORE submit
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isSuggestingMore, setIsSuggestingMore] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    reset,
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
  const { totalCount, hasMore } = useSelector(selectRepliesPagination);

  // Link loaded in the store actually belongs to the current URL
  const isCurrentLinkLoaded = currentLink?.slug === slug;

  // Fetch link details when slug changes
  useEffect(() => {
    if (!isCurrentLinkLoaded) {
      dispatch(fetchLinkBySlug(slug))
        .unwrap()
        .catch((err) => console.error('Fetch link error:', err));
    }
  }, [dispatch, slug, isCurrentLinkLoaded]);

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

  const linkId = isCurrentLinkLoaded ? currentLink._id : null;
  const linkTitle = isCurrentLinkLoaded ? currentLink.title || '' : '';
  const linkDescription = isCurrentLinkLoaded ? currentLink.description || '' : '';

  // Tracks the latest suggestion request so stale responses are discarded
  const suggestionRequestRef = useRef(0);

  const fetchAiSuggestions = useCallback(
    async ({ append }) => {
      if (!linkTitle && !linkDescription) return;

      const requestId = ++suggestionRequestRef.current;
      setIsSuggestingMore(true);
      try {
        const response = await axiosInstance.post('/feedback-suggestions', {
          topicTitle: linkTitle,
          topicDescription: linkDescription,
        });
        if (requestId !== suggestionRequestRef.current) return;

        const suggestions = Array.isArray(response) ? response : [];
        setAiSuggestions((prev) =>
          append ? [...new Set([...prev, ...suggestions])] : suggestions
        );
      } catch (error) {
        // Keep existing suggestions so the user can retry
        console.error('AI suggestions error:', error);
      } finally {
        if (requestId === suggestionRequestRef.current) {
          setIsSuggestingMore(false);
        }
      }
    },
    [linkTitle, linkDescription]
  );

  // Reset and refetch suggestions whenever the link (or its topic) changes
  useEffect(() => {
    suggestionRequestRef.current += 1; // invalidate in-flight requests
    setAiSuggestions([]);
    setIsSuggestingMore(false);
    setSent(null);
    if (linkId) {
      fetchAiSuggestions({ append: false });
    }
  }, [linkId, fetchAiSuggestions]);

  const isActive = currentLink?.is_active !== false;

  const onSubmit = async (data) => {
    setReplyError('');

    if (!isActive) {
      setReplyError('This link is closed and is not accepting feedback.');
      return;
    }

    const message = data.message;

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

      setSent({ message, name: data.user.trim() });
      reset();
      // Reset AI suggestions after submit
      setAiSuggestions([]);
    } catch (err) {
      setReplyError(err.message || 'Your feedback was not sent. Check your connection and try again.');
    }
  };

  const writeAnother = () => {
    setSent(null);
    fetchAiSuggestions({ append: false });
  };

  const applySuggestion = (suggestion) => {
    setValue('message', suggestion, { shouldValidate: true, shouldDirty: true });
    setFocus('message');
  };

  const loadMore = () => {
    dispatch(incrementSkip());
    dispatch(fetchReplies({ linkId: currentLink?._id }));
  };

  if (!isCurrentLinkLoaded && linksStatus === 'loading') {
    return <PageLoader />;
  }

  if (!isCurrentLinkLoaded || linksError) {
    return (
      <PageMessage title="This link doesn't exist">
        Check the address for typos. If it came from someone else, they may have removed it.
      </PageMessage>
    );
  }

  const showSuggestions = aiSuggestions.length > 0 || isSuggestingMore;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <header className="max-w-3xl">
        <h1 className="text-[36px] sm:text-[52px] leading-[1.04] font-extrabold tracking-[-0.035em] text-ink text-balance">
          {currentLink.title}
        </h1>
        {currentLink.description && (
          <p className="mt-4 text-lg sm:text-xl text-muted leading-relaxed max-w-[60ch]">
            {currentLink.description}
          </p>
        )}
      </header>

      {isOwner && (
        <p className="mt-6 inline-block rounded-md bg-accent-soft px-3.5 py-2 text-sm font-medium text-accent">
          This is your link. Replies people send appear at the bottom of this page.
        </p>
      )}

      {!isActive ? (
        <p className="mt-10 max-w-xl rounded-lg bg-sunken px-5 py-4 text-muted">
          This link is closed, so it isn't accepting feedback right now.
        </p>
      ) : sent ? (
        <SentNote message={sent.message} name={sent.name} onWriteAnother={writeAnother} />
      ) : (
        <div
          className={`mt-10 grid gap-10 ${
            showSuggestions ? 'lg:grid-cols-[minmax(0,1fr)_19rem]' : 'max-w-3xl'
          }`}
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {replyError && (
              <div className="alert mb-5" role="alert">
                {replyError}
              </div>
            )}

            <label className="label" htmlFor="message">
              Your feedback
            </label>
            <textarea
              id="message"
              rows={8}
              className="block w-full resize-y rounded-lg border border-line bg-surface px-5 py-4 font-voice text-[18px] leading-[1.7] text-ink placeholder:text-muted/60 transition-[border-color,box-shadow] focus:outline-none focus:border-accent focus:ring-3 focus:ring-accent/20 aria-[invalid=true]:border-danger"
              placeholder="Be specific: what happened, how it landed, what you'd change."
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
              {...register('message', {
                validate: (v) => v.trim() !== '' || 'Write something before sending.',
              })}
            />
            {errors.message && (
              <p id="message-error" className="field-error">
                {errors.message.message}
              </p>
            )}

            <div className="mt-6 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <label className="label" htmlFor="user">
                  Name <span className="font-normal text-muted">(optional)</span>
                </label>
                <input
                  id="user"
                  className="input"
                  autoComplete="off"
                  aria-describedby="user-hint"
                  {...register('user')}
                />
                <p id="user-hint" className="hint">
                  Leave this blank to stay anonymous.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary h-11 px-6 sm:mt-[26px]"
              >
                {isSubmitting && <Spinner className="w-4 h-4 border-on-accent/30 border-t-on-accent" />}
                {isSubmitting ? 'Sending' : 'Send feedback'}
              </button>
            </div>
          </form>

          {showSuggestions && (
            <aside aria-labelledby="prompts-heading">
              <h2 id="prompts-heading" className="text-[15px] font-bold text-ink">
                Need a starting point?
              </h2>
              <p className="mt-1 text-sm text-muted">
                Pick a prompt to start from, then make it your own.
              </p>

              <ul className="mt-4 space-y-2.5">
                {aiSuggestions.map((suggestion, index) => (
                  <li key={`${index}-${suggestion}`}>
                    <button
                      type="button"
                      onClick={() => applySuggestion(suggestion)}
                      className="w-full rounded-sm bg-note px-4 py-3 text-left font-voice text-[15px] leading-snug text-note-ink transition-colors hover:bg-note-hover cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
                {isSuggestingMore &&
                  [0, 1, 2].slice(aiSuggestions.length ? 2 : 0).map((i) => (
                    <li
                      key={`placeholder-${i}`}
                      className="h-[60px] rounded-sm bg-note/35 animate-pulse"
                      aria-hidden="true"
                    />
                  ))}
              </ul>

              {aiSuggestions.length > 0 && (
                <button
                  type="button"
                  disabled={isSuggestingMore}
                  onClick={() => fetchAiSuggestions({ append: true })}
                  className="btn-ghost btn-sm mt-3 -ml-3"
                >
                  {isSuggestingMore ? 'Finding more prompts' : 'More prompts'}
                </button>
              )}
            </aside>
          )}
        </div>
      )}

      {isOwner && (
        <section className="mt-20 max-w-3xl" aria-labelledby="owner-replies-heading">
          <h2
            id="owner-replies-heading"
            className="border-b border-ink pb-3 text-lg font-extrabold tracking-[-0.01em] text-ink"
          >
            Replies{' '}
            <span className="font-semibold text-muted tabular-nums">{totalCount ?? replies.length}</span>
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
      )}
    </main>
  );
};
