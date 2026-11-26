import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { selectUser } from '../features/auth/authSlice';
import { createReply } from '../features/replies/repliesSlice';
import { useFeedbackSuggestions } from '../hooks/useFeedbackSuggestions';
import { usePublicLink } from '../hooks/useLink';
import { replyMessageRules } from '../lib/validation';
import { RepliesSection } from '../components/RepliesSection';
import { ConnectionError, PageLoader, PageMessage, Spinner } from '../components/PageState';

// Shown after sending: the note drops into the box's slot.
const SentNote = ({ message, onWriteAnother }) => (
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
        Sent anonymously. The owner can read it, but they can't see who wrote it.
      </p>
      <button type="button" onClick={onWriteAnother} className="btn-secondary mt-6">
        Write another
      </button>
    </div>
  </section>
);

const FeedbackPage = ({ link }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isOwner = Boolean(user) && link.owner === user.id;

  const [submitError, setSubmitError] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const { suggestions, loading, loadMore, restart } = useFeedbackSuggestions(link);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { message: '' } });

  const onSubmit = async (data) => {
    const message = data.message.trim();
    setSubmitError('');
    try {
      await dispatch(createReply({ linkId: link._id, message })).unwrap();
      setSentMessage(message);
      reset();
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const writeAnother = () => {
    setSentMessage('');
    restart();
  };

  const applySuggestion = (suggestion) => {
    setValue('message', suggestion, { shouldValidate: true, shouldDirty: true });
    setFocus('message');
  };

  const showSuggestions = suggestions.length > 0 || loading;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <header className="max-w-3xl">
        <h1 className="text-[36px] sm:text-[52px] leading-[1.04] font-extrabold tracking-[-0.035em] text-ink text-balance">
          {link.title}
        </h1>
        {link.description && (
          <p className="mt-4 text-lg sm:text-xl text-muted leading-relaxed max-w-[60ch]">
            {link.description}
          </p>
        )}
      </header>

      {isOwner && (
        <p className="mt-6 inline-block rounded-md bg-accent-soft px-3.5 py-2 text-sm font-medium text-accent">
          This is your link. Replies people send appear at the bottom of this page.
        </p>
      )}

      {!link.isActive ? (
        <p className="mt-10 max-w-xl rounded-lg bg-sunken px-5 py-4 text-muted">
          This link is closed, so it isn't accepting feedback right now.
        </p>
      ) : sentMessage ? (
        <SentNote message={sentMessage} onWriteAnother={writeAnother} />
      ) : (
        <div
          className={`mt-10 grid gap-10 ${
            showSuggestions ? 'lg:grid-cols-[minmax(0,1fr)_19rem]' : 'max-w-3xl'
          }`}
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {submitError && (
              <div className="alert mb-5" role="alert">
                {submitError}
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
              {...register('message', replyMessageRules)}
            />
            {errors.message && (
              <p id="message-error" className="field-error">
                {errors.message.message}
              </p>
            )}

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <button type="submit" disabled={isSubmitting} className="btn-primary h-11 px-6">
                {isSubmitting && <Spinner className="w-4 h-4 border-on-accent/30 border-t-on-accent" />}
                {isSubmitting ? 'Sending' : 'Send feedback'}
              </button>
              <p className="text-[13px] text-muted">Sent anonymously.</p>
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
                {suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => applySuggestion(suggestion)}
                      className="w-full rounded-sm bg-note px-4 py-3 text-left font-voice text-[15px] leading-snug text-note-ink transition-colors hover:bg-note-hover cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
                {loading &&
                  [0, 1, 2].slice(suggestions.length ? 2 : 0).map((i) => (
                    <li
                      key={`placeholder-${i}`}
                      className="h-[60px] rounded-sm bg-note/35 animate-pulse"
                      aria-hidden="true"
                    />
                  ))}
              </ul>

              {suggestions.length > 0 && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={loadMore}
                  className="btn-ghost btn-sm mt-3 -ml-3"
                >
                  {loading ? 'Finding more prompts' : 'More prompts'}
                </button>
              )}
            </aside>
          )}
        </div>
      )}

      {isOwner && <RepliesSection linkId={link._id} className="mt-20 max-w-3xl" />}
    </main>
  );
};

export const PublicLink = () => {
  const { slug } = useParams();
  const { link, loading, error, retry } = usePublicLink(slug);

  if (loading) return <PageLoader />;
  if (error && !error.status) return <ConnectionError onRetry={retry} />;
  if (!link) {
    return (
      <PageMessage title="This link doesn't exist">
        Check the address for typos. If it came from someone else, they may have removed it.
      </PageMessage>
    );
  }

  return <FeedbackPage key={link._id} link={link} />;
};
