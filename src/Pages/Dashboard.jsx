import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink } from 'lucide-react';
import {
  createFeedbackLink,
  fetchActiveLinks,
  fetchInactiveLinks,
  activateLink,
  deactivateLink,
  selectActiveLinks,
  selectInactiveLinks,
  selectLinksStatus,
  selectLinksError,
} from '../features/feedbackLinks/feedbackLinksSlice';
import { copyLink, publicHost, slugify } from '../lib/links';

const emptyLink = { title: '', description: '', slug: '' };

const LinkRow = ({ link, isActive, pending, onToggle }) => {
  const count = link.replyCount ?? 0;

  return (
    <li className="py-5 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1fr)_5.5rem_auto] sm:items-center">
      <div className="min-w-0">
        <Link
          to={`/links/${link._id}/replies`}
          className={`text-[17px] font-bold tracking-[-0.01em] hover:underline underline-offset-4 decoration-2 decoration-line rounded-sm ${
            isActive ? 'text-ink' : 'text-muted'
          }`}
        >
          {link.title}
        </Link>
        <a
          href={`/${link.slug}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 flex items-center gap-1.5 w-fit max-w-full text-sm text-muted hover:text-accent rounded-sm"
        >
          <span className="truncate">
            {publicHost()}/{link.slug}
          </span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-label="opens in a new tab" />
        </a>
      </div>

      <Link
        to={`/links/${link._id}/replies`}
        className="flex items-baseline gap-1.5 tabular-nums rounded-sm w-fit"
        aria-label={`${count} ${count === 1 ? 'reply' : 'replies'} to ${link.title}`}
      >
        <span className="text-xl font-extrabold text-ink">{count}</span>
        <span className="text-sm text-muted">{count === 1 ? 'reply' : 'replies'}</span>
      </Link>

      <div className="flex items-center gap-2">
        {isActive && (
          <button onClick={() => copyLink(link.slug)} className="btn-secondary btn-sm">
            <Copy className="w-3.5 h-3.5" />
            Copy link
          </button>
        )}
        <button
          onClick={() => onToggle(link, isActive)}
          disabled={pending}
          className={isActive ? 'btn-ghost btn-sm' : 'btn-secondary btn-sm'}
          aria-label={`${isActive ? 'Close' : 'Reopen'} ${link.title}`}
        >
          {pending ? 'Saving' : isActive ? 'Close' : 'Reopen'}
        </button>
      </div>
    </li>
  );
};

const LinkSection = ({ title, description, links, isActive, pendingId, onToggle, empty }) => (
  <section className="mt-12">
    <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
      <h2 className="text-lg font-extrabold tracking-[-0.01em] text-ink">
        {title}{' '}
        <span className="font-semibold text-muted tabular-nums">{links.length}</span>
      </h2>
      <p className="hidden sm:block text-sm text-muted">{description}</p>
    </div>
    {links.length === 0 ? (
      <p className="py-8 text-muted">{empty}</p>
    ) : (
      <ul className="divide-y divide-line">
        {links.map((link) => (
          <LinkRow
            key={link._id}
            link={link}
            isActive={isActive}
            pending={pendingId === link._id}
            onToggle={onToggle}
          />
        ))}
      </ul>
    )}
  </section>
);

export const Dashboard = () => {
  const [newLink, setNewLink] = useState(emptyLink);
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const dispatch = useDispatch();
  const activeLinks = useSelector(selectActiveLinks);
  const inactiveLinks = useSelector(selectInactiveLinks);
  const status = useSelector(selectLinksStatus);
  const linksError = useSelector(selectLinksError);

  useEffect(() => {
    dispatch(fetchActiveLinks());
    dispatch(fetchInactiveLinks());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    if (name === 'slug') {
      setSlugEdited(value !== '');
      // Light cleanup while typing; don't trim hyphens or "my-" can't become "my-talk".
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setNewLink((prev) => ({ ...prev, slug }));
    } else if (name === 'title' && !slugEdited) {
      setNewLink((prev) => ({ ...prev, title: value, slug: slugify(value) }));
    } else {
      setNewLink((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      await dispatch(createFeedbackLink(newLink)).unwrap();
      setNewLink(emptyLink);
      setSlugEdited(false);
      dispatch(fetchActiveLinks());
      dispatch(fetchInactiveLinks());
    } catch (err) {
      setError(err.message || 'The link was not created. Try a different address.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleLink = async (link, isActive) => {
    setPendingId(link._id);
    try {
      if (isActive) {
        await dispatch(deactivateLink(link._id)).unwrap();
      } else {
        await dispatch(activateLink(link._id)).unwrap();
      }
      dispatch(fetchActiveLinks());
      dispatch(fetchInactiveLinks());
    } catch (err) {
      setError(err.message || 'The link status was not updated. Try again.');
    } finally {
      setPendingId(null);
    }
  };

  const busy = creating || status === 'loading';

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-[34px] sm:text-[42px] leading-[1.05] font-extrabold tracking-[-0.03em] text-ink">
          Feedback links
        </h1>
        <p className="mt-3 text-[17px] text-muted leading-relaxed">
          Each link opens a page where anyone can send you feedback without signing in. Replies
          are only visible to you.
        </p>
      </header>

      {(linksError || error) && (
        <div className="alert mt-8" role="alert">
          {error || linksError}
        </div>
      )}

      <section className="card mt-10" aria-labelledby="new-link-heading">
        <h2 id="new-link-heading" className="text-lg font-extrabold tracking-[-0.01em] text-ink">
          New link
        </h2>
        <form onSubmit={handleCreateLink} className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="title">
              What do you want feedback on?
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="input"
              placeholder="My talk at the design meetup"
              value={newLink.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="slug">
              Link address
            </label>
            <div className="flex rounded-md border border-line bg-sunken focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20 transition-[border-color,box-shadow]">
              <span className="hidden sm:flex items-center pl-3 pr-1 text-[15px] text-muted select-none whitespace-nowrap">
                {publicHost()}/
              </span>
              <input
                type="text"
                id="slug"
                name="slug"
                className="min-w-0 flex-1 rounded-r-md sm:rounded-l-none rounded-l-md bg-surface px-3 py-2.5 text-[15px] text-ink placeholder:text-muted/70 focus:outline-none"
                placeholder="design-meetup-talk"
                value={newLink.slug}
                onChange={handleChange}
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="label" htmlFor="description">
              Context for people replying <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              className="input"
              placeholder="What worked, what didn't, what you'd change"
              value={newLink.description}
              onChange={handleChange}
            />
            <p className="hint">Shown under the title. It also shapes the writing prompts people see.</p>
          </div>

          <div className="md:col-span-2">
            <button type="submit" disabled={busy} className="btn-primary h-11 px-5 w-full sm:w-auto">
              {creating ? 'Creating link' : 'Create link'}
            </button>
          </div>
        </form>
      </section>

      <LinkSection
        title="Open"
        description="Accepting replies"
        links={activeLinks}
        isActive
        pendingId={pendingId}
        onToggle={handleToggleLink}
        empty="No open links. Create one above, then share it."
      />

      <LinkSection
        title="Closed"
        description="Not accepting replies; past replies are kept"
        links={inactiveLinks}
        isActive={false}
        pendingId={pendingId}
        onToggle={handleToggleLink}
        empty="Links you close appear here. You can reopen them any time."
      />
    </main>
  );
};
