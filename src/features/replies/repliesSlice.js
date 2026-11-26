import { createSlice } from '@reduxjs/toolkit';
import { createApiThunk } from '../../lib/createApiThunk';
import { isSessionChange } from '../auth/authSlice';
import { repliesAPI } from './repliesAPI';

const PAGE_SIZE = 10;

const initialState = {
  linkId: null, // the link whose replies are loaded
  replies: [],
  totalCount: 0,
  status: 'idle',
  error: null,
  requestId: null,
};

export const createReply = createApiThunk('replies/create', ({ linkId, message }) =>
  repliesAPI.createReply(linkId, message)
);

// Loads the first page, or the next one with `append`.
export const fetchReplies = createApiThunk(
  'replies/fetch',
  ({ linkId, append = false }, { getState }) =>
    repliesAPI.getReplies(linkId, {
      skip: append ? getState().replies.replies.length : 0,
      limit: PAGE_SIZE,
    })
);

const repliesSlice = createSlice({
  name: 'replies',
  initialState,
  reducers: {
    clearReplies: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReply.fulfilled, (state, { payload, meta }) => {
        // Only the owner has the link's replies loaded.
        if (state.linkId !== meta.arg.linkId) return;
        state.replies.unshift(payload);
        state.totalCount += 1;
      })
      .addCase(fetchReplies.pending, (state, { meta }) => {
        const { linkId, append } = meta.arg;
        const base = append ? state : initialState;
        return { ...base, linkId, status: 'loading', error: null, requestId: meta.requestId };
      })
      .addCase(fetchReplies.fulfilled, (state, { payload, meta }) => {
        if (state.requestId !== meta.requestId) return;
        // Replies sent since the last page shift the offsets, so pages can overlap.
        const loadedIds = new Set(state.replies.map((reply) => reply._id));
        const page = Array.isArray(payload?.replies) ? payload.replies : [];
        state.replies.push(...page.filter((reply) => !loadedIds.has(reply._id)));
        state.totalCount = payload?.totalCount ?? state.replies.length;
        state.status = 'succeeded';
      })
      .addCase(fetchReplies.rejected, (state, { payload, error, meta }) => {
        if (state.requestId !== meta.requestId) return;
        state.status = 'failed';
        state.error = (payload ?? error).message;
      })
      .addMatcher(isSessionChange, () => initialState);
  },
});

export const { clearReplies } = repliesSlice.actions;

export const selectRepliesState = (state) => state.replies;

export default repliesSlice.reducer;
