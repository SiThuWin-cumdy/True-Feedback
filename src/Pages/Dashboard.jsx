import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink } from 'lucide-react';
import {
  activateLink,
  createFeedbackLink,
  deactivateLink,
  fetchLinks,
  selectActiveLinks,
  selectInactiveLinks,
  selectListError,
  selectListStatus,
} from '../features/feedbackLinks/feedbackLinksSlice';
import {
  cleanSlugInput,
  copyLink,
  isReservedSlug,
  publicUrl,
  PUBLIC_HOST,
  slugify,
} from '../lib/links';

const emptyLink = { title: '', description: '', slug: '' };

const LinkRow = ({ link, pending, onToggle }) => {
  const { isActive } = link;
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
          href={publicUrl(link.slug)}
          target="_blank"
          rel="noreferrer"
          className="mt-1 flex items-center gap-1.5 w-fit max-w-full text-sm text-muted hover:text-accent rounded-sm"
        >
          <span className="truncate">
            {PUBLIC_HOST}/{link.slug}
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
          <button type="button" onClick={() => copyLink(link.slug)} className="btn-secondary btn-sm">
            <Copy className="w-3.5 h-3.5" />
            Copy link
          </button>
        )}
        <button
          type="button"
          onClick={() => onToggle(link)}
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

const LinkSection = ({ title, description, links, pendingId, onToggle, empty }) => (
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
            pending={pendingId === link._id}
            onToggle={onToggle}
          />
        ))}
      </ul>
    )}
  </section>
);

const NewLinkForm = () => {
  const dispatch = useDispatch();
  const [newLink, setNewLink] = useState(emptyLink);
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    if (name === 'slug') {
      setSlugEdited(value !== '');
      setNewLink((prev) => ({ ...prev, slug: cleanSlugInput(value) }));
    } else if (name === 'title' && !slugEdited) {
      setNewLink((prev) => ({ ...prev, title: value, slug: slugify(value) }));
    } else {
      setNewLink((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const link = {
      title: newLink.title.trim(),
      description: newLink.description.trim(),
      slug: slugify(newLink.slug),
    };
    if (!link.title || !link.slug) {
      setError('Enter a title, and a link address with letters or numbers.');
      return;
    }
    if (isReservedSlug(link.slug)) {
      setError(`"${link.slug}" is used by TrueFeedback. Try a different address.`);
      return;
    }

    setCreating(true);
    setError('');
    try {
      await dispatch(createFeedbackLink(link)).unwrap();
      setNewLink(emptyLink);
      setSlugEdited(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="card mt-10" aria-labelledby="new-link-heading">
      <h2 id="new-link-heading" className="text-lg font-extrabold tracking-[-0.01em] text-ink">
        New link
      </h2>
      {error && (
        <div className="alert mt-5" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-5 grid gap-5 md:grid-cols-2">
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
              {PUBLIC_HOST}/
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
          <button type="submit" disabled={creating} className="btn-primary h-11 px-5 w-full sm:w-auto">
            {creating ? 'Creating link' : 'Create link'}
          </button>
        </div>
      </form>
    </section>
  );
};

export const Dashboard = () => {
  const [toggleError, setToggleError] = useState('');
  const [pendingId, setPendingId] = useState(null);

  const dispatch = useDispatch();
  const activeLinks = useSelector(selectActiveLinks);
  const inactiveLinks = useSelector(selectInactiveLinks);
  const loading = useSelector(selectListStatus) === 'loading';
  const listError = useSelector(selectListError);

  useEffect(() => {
    dispatch(fetchLinks());
  }, [dispatch]);

  const handleToggleLink = async (link) => {
    const toggle = link.isActive ? deactivateLink : activateLink;
    setPendingId(link._id);
    setToggleError('');
    try {
      await dispatch(toggle(link._id)).unwrap();
    } catch (err) {
      setToggleError(err.message);
    } finally {
      setPendingId(null);
    }
  };

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

      {(toggleError || listError) && (
        <div className="alert mt-8" role="alert">
          {toggleError || listError}
        </div>
      )}

      <NewLinkForm />

      <LinkSection
        title="Open"
        description="Accepting replies"
        links={activeLinks}
        pendingId={pendingId}
        onToggle={handleToggleLink}
        empty={loading ? 'Loading links' : 'No open links. Create one above, then share it.'}
      />

      <LinkSection
        title="Closed"
        description="Not accepting replies; past replies are kept"
        links={inactiveLinks}
        pendingId={pendingId}
        onToggle={handleToggleLink}
        empty={
          loading ? 'Loading links' : 'Links you close appear here. You can reopen them any time.'
        }
      />
    </main>
  );
};
