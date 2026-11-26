import { LoadMore } from './LoadMore';
import { Spinner } from './PageState';

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Feedback is set in the serif "voice" face: it's what a person wrote.
const ReplyItem = ({ reply }) => {
  const author = reply.user?.username;
  const date = formatDate(reply.createdAt);

  return (
    <li className="py-6 first:pt-1">
      <p className="font-voice text-[17px] leading-[1.7] text-ink whitespace-pre-line break-words max-w-[65ch]">
        {reply.message}
      </p>
      <p className="mt-2.5 flex flex-wrap gap-x-3 text-[13px] text-muted">
        {author ? (
          <span className="font-semibold text-ink">{author}</span>
        ) : (
          <span>Anonymous</span>
        )}
        {date && <time dateTime={reply.createdAt}>{date}</time>}
      </p>
    </li>
  );
};

export const ReplyList = ({
  replies,
  status,
  totalCount,
  onLoadMore,
  emptyText = 'No replies yet. Share the link to start collecting feedback.',
}) => {
  if (replies.length === 0) {
    if (status === 'failed') return null; // the section shows the error
    if (status !== 'succeeded') {
      return (
        <div className="flex items-center gap-3 py-10 text-sm text-muted">
          <Spinner /> Loading replies
        </div>
      );
    }
    return <p className="py-10 text-muted">{emptyText}</p>;
  }

  return (
    <>
      <ul className="divide-y divide-line">
        {replies.map((reply) => (
          <ReplyItem key={reply._id} reply={reply} />
        ))}
      </ul>
      {replies.length < totalCount && (
        <LoadMore
          isLoading={status === 'loading'}
          onLoadMore={onLoadMore}
          shownCount={replies.length}
          totalCount={totalCount}
        />
      )}
    </>
  );
};
