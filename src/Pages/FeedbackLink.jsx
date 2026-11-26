import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { OwnedLinkPage } from '../components/OwnedLinkPage';
import { RepliesSection } from '../components/RepliesSection';
import { createReply } from '../features/replies/repliesSlice';
import { replyMessageRules } from '../lib/validation';

const ReplyForm = ({ linkId }) => {
  const dispatch = useDispatch();
  const [submitError, setSubmitError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { message: '' } });

  const onSubmit = async ({ message }) => {
    setSubmitError('');
    try {
      await dispatch(createReply({ linkId, message: message.trim() })).unwrap();
      reset();
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card mt-10 space-y-5" noValidate>
      <h2 className="text-lg font-extrabold tracking-[-0.01em] text-ink">Add a reply</h2>
      {submitError && (
        <div className="alert" role="alert">
          {submitError}
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
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'reply-message-error' : undefined}
          {...register('message', replyMessageRules)}
        />
        {errors.message && (
          <p id="reply-message-error" className="field-error">
            {errors.message.message}
          </p>
        )}
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary h-11 px-5">
        {isSubmitting ? 'Sending' : 'Send feedback'}
      </button>
    </form>
  );
};

export const FeedbackLink = () => {
  const { id } = useParams();

  return (
    <OwnedLinkPage id={id}>
      {(link) => (
        <>
          {link.isActive ? (
            <ReplyForm linkId={link._id} />
          ) : (
            <p className="mt-10 rounded-lg bg-sunken px-5 py-4 text-muted">
              This link is closed, so it isn't accepting replies. Reopen it from your links page to
              collect more.
            </p>
          )}
          <RepliesSection linkId={link._id} />
        </>
      )}
    </OwnedLinkPage>
  );
};
