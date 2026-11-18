import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { repliesAPI } from './repliesAPI';

const initialState = {
  replies: [],
  totalCount: 0,
  skip: 0,
  limit: 10,
  totalPages: 1,
  status: 'idle',
  error: null,
};

export const createReply = createAsyncThunk(
  'replies/create',
  async ({ linkId, replyData }, { rejectWithValue }) => {
    try {
      return await repliesAPI.createReply(linkId, replyData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create reply');
    }
  }
);

export const fetchReplies = createAsyncThunk(
  'replies/fetch',
  async ({ linkId, append = false }, { getState, rejectWithValue }) => {
    // Read skip from Redux state to avoid stale closure values from components
    const state = getState();
    const skip = state.replies?.skip ?? 0;
    const limit = state.replies?.limit ?? 10;
    try {
      return await repliesAPI.getReplies(linkId, skip, limit);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch replies');
    }
  }
);

const repliesSlice = createSlice({
  name: 'replies',
  initialState,
  reducers: {
    clearReplies: (state) => {
      state.replies = [];
      state.totalCount = 0;
      state.skip = 0;
      state.totalPages = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSkip: (state, action) => {
      state.skip = action.payload;
    },
    incrementSkip: (state) => {
      state.skip += state.limit;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create reply
      .addCase(createReply.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createReply.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.replies.unshift(action.payload);
        state.totalCount += 1;
        state.error = null;
      })
      .addCase(createReply.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Fetch replies
      .addCase(fetchReplies.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchReplies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // API returns wrapped response: { status: 'success', data: { replies: [...], totalCount: N } }
        const { replies = [], totalCount = 0 } = action.payload || {};

        const newReplies = Array.isArray(replies) ? replies : [];

        if (state.skip === 0) {
          // Initial load - replace
          state.replies = newReplies;
        } else {
          // Load more - append
          state.replies = [...state.replies, ...newReplies];
        }

        state.totalCount = totalCount;
        state.totalPages = Math.ceil(state.totalCount / state.limit);
        state.error = null;
      })
      .addCase(fetchReplies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearReplies, clearError: clearRepliesError, setSkip, incrementSkip } =
  repliesSlice.actions;

export const selectReplies = (state) => state.replies.replies;
export const selectRepliesStatus = (state) => state.replies.status;
export const selectRepliesError = (state) => state.replies.error;
export const selectRepliesPagination = (state) => ({
  skip: state.replies.skip,
  limit: state.replies.limit,
  totalCount: state.replies.totalCount,
  totalPages: state.replies.totalPages,
  hasMore: state.replies.replies.length < state.replies.totalCount,
});

export default repliesSlice.reducer;