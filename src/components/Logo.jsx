import { Link } from 'react-router-dom';

// A note going into a suggestion box.
export const LogoMark = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <rect x="7" y="2" width="10" height="11" rx="1.25" fill="var(--note)" />
    <path d="M9.5 5.5h5M9.5 8h3.5" stroke="var(--note-ink)" strokeWidth="1.2" strokeLinecap="round" opacity=".55" />
    <rect x="2.5" y="10" width="19" height="12" rx="2.5" fill="currentColor" />
    <rect x="5.5" y="12.25" width="13" height="1.75" rx=".875" fill="var(--paper)" />
  </svg>
);

export const Logo = ({ to = '/' }) => (
  <Link to={to} className="flex items-center gap-2 text-ink rounded-md">
    <LogoMark />
    <span className="text-[17px] font-extrabold tracking-[-0.02em]">TrueFeedback</span>
  </Link>
);
