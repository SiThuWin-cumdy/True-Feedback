import { Copy, ExternalLink } from 'lucide-react';
import { copyLink, publicHost } from '../lib/links';

// Owner-facing header for a single feedback link.
export const LinkHeader = ({ link }) => {
  const isActive = link.is_active !== false;

  return (
    <header className="mt-6">
      <span className={isActive ? 'badge-active' : 'badge-inactive'}>
        <span
          className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-accent' : 'bg-muted'}`}
          aria-hidden="true"
        />
        {isActive ? 'Open for replies' : 'Closed'}
      </span>
      <h1 className="mt-3 text-[32px] sm:text-[40px] leading-[1.08] font-extrabold tracking-[-0.03em] text-ink text-balance">
        {link.title}
      </h1>
      {link.description && (
        <p className="mt-3 text-[17px] text-muted leading-relaxed max-w-[60ch]">{link.description}</p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <a
          href={`/${link.slug}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary max-w-full"
        >
          <span className="truncate font-medium">
            {publicHost()}/{link.slug}
          </span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0 text-muted" aria-label="opens in a new tab" />
        </a>
        <button onClick={() => copyLink(link.slug)} className="btn-ghost">
          <Copy className="w-4 h-4" />
          Copy link
        </button>
      </div>
    </header>
  );
};
