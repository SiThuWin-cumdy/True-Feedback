import toast from 'react-hot-toast';

// Host plus base path, without a trailing slash; callers append `/${slug}`.
export const publicHost = () =>
  `${window.location.host}${import.meta.env.BASE_URL.replace(/\/$/, '')}`;
// BASE_URL always ends in '/' ('/' locally, '/<repo>/' on GitHub Pages).
export const publicUrl = (slug) =>
  `${window.location.origin}${import.meta.env.BASE_URL}${slug}`;

export const copyLink = async (slug) => {
  try {
    await navigator.clipboard.writeText(publicUrl(slug));
    toast.success('Link copied');
  } catch {
    toast.error('Copy failed. Select the address and copy it manually.');
  }
};

export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
