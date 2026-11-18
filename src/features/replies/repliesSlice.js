import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { repliesAPI } from './repliesAPI';

const initialState = {
  replies: [],
  totalCount: 0,
  currentPage: 1,
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
  async ({ linkId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await repliesAPI.getReplies(linkId, page, limit);
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
      state.currentPage = 1;
      state.totalPages = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
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
        const { replies, totalCount, page, limit } = action.payload;
        state.replies = Array.isArray(replies) ? replies : [];
        state.totalCount = totalCount || 0;
        state.currentPage = page || 1;
        state.totalPages = Math.ceil((totalCount || 0) / (limit || 10));
        state.error = null;
      })
      .addCase(fetchReplies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearReplies, clearError: clearRepliesError, setPage } =
  repliesSlice.actions;

export const selectReplies = (state) => state.replies.replies;
export const selectRepliesStatus = (state) => state.replies.status;
export const selectRepliesError = (state) => state.replies.error;
export const selectRepliesPagination = (state) => ({
  currentPage: state.replies.currentPage,
  totalPages: state.replies.totalPages,
  totalCount: state.replies.totalCount,
});

export default repliesSlice.reducer;