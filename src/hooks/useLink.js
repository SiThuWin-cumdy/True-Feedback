import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearOwnedLink,
  clearPublicLink,
  fetchLinkById,
  fetchLinkBySlug,
  selectOwnedLink,
  selectPublicLink,
} from '../features/feedbackLinks/feedbackLinksSlice';

// Loads a link and returns `{ link, loading, error, retry }`, never a link for
// a different key. `error.status` is undefined when the server is unreachable.
const useLink = (key, { fetchLink, clearLink, selectEntry }) => {
  const dispatch = useDispatch();
  const entry = useSelector(selectEntry);
  const isCurrent = entry.key === key;

  useEffect(() => {
    if (!isCurrent) dispatch(fetchLink(key));
  }, [dispatch, fetchLink, key, isCurrent]);

  // Reload on the next visit rather than showing a stale copy.
  useEffect(() => () => dispatch(clearLink()), [dispatch, clearLink]);

  const retry = useCallback(() => dispatch(fetchLink(key)), [dispatch, fetchLink, key]);

  return {
    link: isCurrent ? entry.link : null,
    loading: !isCurrent || entry.status === 'loading',
    error: isCurrent ? entry.error : null,
    retry,
  };
};

const owned = {
  fetchLink: fetchLinkById,
  clearLink: clearOwnedLink,
  selectEntry: selectOwnedLink,
};

const bySlug = {
  fetchLink: fetchLinkBySlug,
  clearLink: clearPublicLink,
  selectEntry: selectPublicLink,
};

export const useOwnedLink = (id) => useLink(id, owned);
export const usePublicLink = (slug) => useLink(slug, bySlug);
