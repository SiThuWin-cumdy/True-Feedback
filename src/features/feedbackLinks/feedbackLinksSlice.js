import { createSlice } from '@reduxjs/toolkit';
import { createApiThunk } from '../../lib/createApiThunk';
import { isSessionChange } from '../auth/authSlice';
import { feedbackLinksAPI } from './feedbackLinksAPI';

// A single loaded link. `key` is the id or slug it was requested by.
const emptyEntry = { key: null, link: null, status: 'idle', error: null, requestId: null };

const initialState = {
  activeLinks: [],
  inactiveLinks: [],
  listStatus: 'idle',
  listError: null,
  listRequestId: null,
  ownedLink: emptyEntry, // the signed-in user's link, by id
  publicLink: emptyEntry, // the public page's link, by slug
};

const asArray = (value) => (Array.isArray(value) ? value : []);

export const fetchLinks = createApiThunk('feedbackLinks/fetchAll', async () => {
  const [active, inactive] = await Promise.all([
    feedbackLinksAPI.getActive(),
    feedbackLinksAPI.getInactive(),
  ]);
  return { active: asArray(active), inactive: asArray(inactive) };
});

export const createFeedbackLink = createApiThunk('feedbackLinks/create', (linkData) =>
  feedbackLinksAPI.create(linkData)
);

export const fetchLinkById = createApiThunk('feedbackLinks/fetchById', (id) =>
  feedbackLinksAPI.getById(id)
);

export const fetchLinkBySlug = createApiThunk('feedbackLinks/fetchBySlug', (slug) =>
  feedbackLinksAPI.getBySlug(slug)
);

export const activateLink = createApiThunk('feedbackLinks/activate', (id) =>
  feedbackLinksAPI.activate(id)
);

export const deactivateLink = createApiThunk('feedbackLinks/deactivate', (id) =>
  feedbackLinksAPI.deactivate(id)
);

// Put a link in the list it belongs to, newest first like the API.
const placeLink = (state, link) => {
  const others = (links) => links.filter((l) => l._id !== link._id);
  state.activeLinks = others(state.activeLinks);
  state.inactiveLinks = others(state.inactiveLinks);

  const list = link.isActive ? state.activeLinks : state.inactiveLinks;
  list.push(link);
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Results of a superseded or cleared request are ignored.
const addEntryCases = (builder, thunk, entryName) =>
  builder
    .addCase(thunk.pending, (state, { meta }) => {
      state[entryName] = {
        ...emptyEntry,
        key: meta.arg,
        status: 'loading',
        requestId: meta.requestId,
      };
    })
    .addCase(thunk.fulfilled, (state, { payload, meta }) => {
      const entry = state[entryName];
      if (entry.requestId !== meta.requestId) return;
      entry.status = 'succeeded';
      entry.link = payload;
    })
    .addCase(thunk.rejected, (state, { payload, error, meta }) => {
      const entry = state[entryName];
      if (entry.requestId !== meta.requestId) return;
      entry.status = 'failed';
      entry.error = payload ?? { message: error.message };
    });

const feedbackLinksSlice = createSlice({
  name: 'feedbackLinks',
  initialState,
  reducers: {
    clearOwnedLink: (state) => {
      state.ownedLink = emptyEntry;
    },
    clearPublicLink: (state) => {
      state.publicLink = emptyEntry;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLinks.pending, (state, { meta }) => {
        state.listStatus = 'loading';
        state.listError = null;
        state.listRequestId = meta.requestId;
      })
      .addCase(fetchLinks.fulfilled, (state, { payload, meta }) => {
        if (state.listRequestId !== meta.requestId) return;
        state.listStatus = 'succeeded';
        state.activeLinks = payload.active;
        state.inactiveLinks = payload.inactive;
      })
      .addCase(fetchLinks.rejected, (state, { payload, error, meta }) => {
        if (state.listRequestId !== meta.requestId) return;
        state.listStatus = 'failed';
        state.listError = (payload ?? error).message;
      });

    addEntryCases(builder, fetchLinkById, 'ownedLink');
    addEntryCases(builder, fetchLinkBySlug, 'publicLink');

    builder
      .addCase(createFeedbackLink.fulfilled, (state, { payload }) => placeLink(state, payload))
      .addCase(activateLink.fulfilled, (state, { payload }) => placeLink(state, payload))
      .addCase(deactivateLink.fulfilled, (state, { payload }) => placeLink(state, payload))
      // The public page's link belongs to no session; keep it so signing in or
      // out elsewhere doesn't throw away feedback someone is writing.
      .addMatcher(isSessionChange, (state) => ({
        ...initialState,
        publicLink: state.publicLink,
      }));
  },
});

export const { clearOwnedLink, clearPublicLink } = feedbackLinksSlice.actions;

export const selectActiveLinks = (state) => state.feedbackLinks.activeLinks;
export const selectInactiveLinks = (state) => state.feedbackLinks.inactiveLinks;
export const selectListStatus = (state) => state.feedbackLinks.listStatus;
export const selectListError = (state) => state.feedbackLinks.listError;
export const selectOwnedLink = (state) => state.feedbackLinks.ownedLink;
export const selectPublicLink = (state) => state.feedbackLinks.publicLink;

export default feedbackLinksSlice.reducer;
