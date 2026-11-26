import { configureStore } from '@reduxjs/toolkit';
import { setUnauthorizedHandler } from '../api/axiosInstance';
import authReducer, { selectToken, sessionReplaced, signOut } from '../features/auth/authSlice';
import feedbackLinksReducer from '../features/feedbackLinks/feedbackLinksSlice';
import repliesReducer from '../features/replies/repliesSlice';
import { storage, TOKEN_KEY } from '../lib/storage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feedbackLinks: feedbackLinksReducer,
    replies: repliesReducer,
  },
  // The state holds the session token; don't expose it to extensions in production.
  devTools: import.meta.env.DEV,
});

// Persist the token.
let savedToken = selectToken(store.getState());
store.subscribe(() => {
  const token = selectToken(store.getState());
  if (token === savedToken) return;
  savedToken = token;
  if (token) storage.set(TOKEN_KEY, token);
  else storage.remove(TOKEN_KEY);
});

// Sign out when the API rejects the current token. A late rejection of an
// older token must not end a newer session.
setUnauthorizedHandler((rejectedToken) => {
  if (rejectedToken === selectToken(store.getState())) store.dispatch(signOut());
});

// Follow sign-ins and sign-outs in other tabs, so this tab never shows one
// account while sending another's token. `key` is null on localStorage.clear().
window.addEventListener('storage', (event) => {
  if (event.key !== TOKEN_KEY && event.key !== null) return;
  const token = storage.get(TOKEN_KEY);
  if (token !== selectToken(store.getState())) store.dispatch(sessionReplaced(token));
});
