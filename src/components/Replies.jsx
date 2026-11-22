import { LoadMore } from './Pagination';
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

const replyAuthor = (reply) => {
  if (reply.user?.username) return reply.user.username;
  if (typeof reply.user === 'string' && reply.user) return reply.user;
  return '';
};

// Feedback is set in the serif "voice" face: it's what a person wrote.
export const ReplyItem = ({ reply }) => {
  const author = replyAuthor(reply);
  const date = formatDate(reply.created_at || reply.createdAt);

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
        {date && <time dateTime={reply.created_at || reply.createdAt}>{date}</time>}
      </p>
    </li>
  );
};

export const ReplyList = ({
  replies,
  status,
  hasMore,
  totalCount,
  onLoadMore,
  emptyText = 'No replies yet. Share the link to start collecting feedback.',
}) => {
  if (status === 'loading' && replies.length === 0) {
    return (
      <div className="flex items-center gap-3 py-10 text-sm text-muted">
        <Spinner /> Loading replies
      </div>
    );
  }

  if (replies.length === 0) {
    return <p className="py-10 text-muted">{emptyText}</p>;
  }

  return (
    <>
      <ul className="divide-y divide-line">
        {replies.map((reply) => (
          <ReplyItem key={reply._id} reply={reply} />
        ))}
      </ul>
      <LoadMore
        hasMore={hasMore}
        isLoading={status === 'loading'}
        onLoadMore={onLoadMore}
        shownCount={replies.length}
        totalCount={totalCount}
      />
    </>
  );
};
