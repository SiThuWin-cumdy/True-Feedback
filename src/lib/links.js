import toast from 'react-hot-toast';

// BASE_URL always ends in '/' ('/' locally, '/<repo>/' on GitHub Pages).
const BASE_URL = import.meta.env.BASE_URL;

// For the router's `basename`: no trailing slash.
export const BASE_PATH = BASE_URL.replace(/\/$/, '');

// Host plus base path, without a trailing slash; append `/${slug}` to display.
export const PUBLIC_HOST = `${window.location.host}${BASE_PATH}`;

export const publicUrl = (slug) =>
  `${window.location.origin}${BASE_URL}${encodeURIComponent(slug)}`;

export const copyLink = async (slug) => {
  try {
    await navigator.clipboard.writeText(publicUrl(slug));
    toast.success('Link copied');
  } catch {
    toast.error('Copy failed. Select the address and copy it manually.');
  }
};

const MAX_SLUG_LENGTH = 60;

// Top-level routes in App.jsx. A link with one of these slugs could never open.
const RESERVED_SLUGS = new Set(['login', 'signup', 'dashboard', 'links']);

export const isReservedSlug = (slug) => RESERVED_SLUGS.has(slug);

// Light cleanup while typing; hyphens stay so "my-" can become "my-talk".
export const cleanSlugInput = (text) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, MAX_SLUG_LENGTH);

export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-/, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-$/, '');
