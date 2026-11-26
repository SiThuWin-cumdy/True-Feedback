import { Link } from 'react-router-dom';

export const Spinner = ({ className = 'w-5 h-5' }) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-block shrink-0 rounded-full border-2 border-line border-t-accent animate-spin ${className}`}
  />
);

export const PageLoader = ({ label = 'Loading' }) => (
  <div className="flex flex-col items-center justify-center gap-3 min-h-[60vh] text-sm text-muted">
    <Spinner className="w-7 h-7" />
    {label}
  </div>
);

export const PageMessage = ({ title, children, action, actionTo, onAction }) => (
  <div className="min-h-[70vh] flex items-center px-4">
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-muted leading-relaxed">{children}</p>
      {actionTo && (
        <Link to={actionTo} className="btn-secondary mt-6">
          {action}
        </Link>
      )}
      {onAction && (
        <button type="button" onClick={onAction} className="btn-secondary mt-6">
          {action}
        </button>
      )}
    </div>
  </div>
);

export const ConnectionError = ({ onRetry }) => (
  <PageMessage title="Couldn't reach TrueFeedback" action="Try again" onAction={onRetry}>
    Check your connection, then try again.
  </PageMessage>
);

export const BackLink = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink rounded-md"
  >
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M10 3.5 5.5 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {children}
  </Link>
);
