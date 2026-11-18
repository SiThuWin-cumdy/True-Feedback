import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { feedbackLinksAPI } from './feedbackLinksAPI';

const initialState = {
  activeLinks: [],
  inactiveLinks: [],
  currentLink: null,
  status: 'idle',
  error: null,
};

export const createFeedbackLink = createAsyncThunk(
  'feedbackLinks/create',
  async (linkData, { rejectWithValue }) => {
    try {
      return await feedbackLinksAPI.create(linkData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create feedback link');
    }
  }
);

export const fetchActiveLinks = createAsyncThunk(
  'feedbackLinks/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      return await feedbackLinksAPI.getActive();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch active links');
    }
  }
);

export const fetchInactiveLinks = createAsyncThunk(
  'feedbackLinks/fetchInactive',
  async (_, { rejectWithValue }) => {
    try {
      return await feedbackLinksAPI.getInactive();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch inactive links');
    }
  }
);

export const fetchLinkById = createAsyncThunk(
  'feedbackLinks/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await feedbackLinksAPI.getById(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch feedback link');
    }
  }
);

export const fetchLinkBySlug = createAsyncThunk(
  'feedbackLinks/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      return await feedbackLinksAPI.getBySlug(slug);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch feedback link');
    }
  }
);

export const activateLink = createAsyncThunk(
  'feedbackLinks/activate',
  async (id, { rejectWithValue }) => {
    try {
      return await feedbackLinksAPI.activate(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to activate link');
    }
  }
);

export const deactivateLink = createAsyncThunk(
  'feedbackLinks/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      return await feedbackLinksAPI.deactivate(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to deactivate link');
    }
  }
);

const feedbackLinksSlice = createSlice({
  name: 'feedbackLinks',
  initialState,
  reducers: {
    clearCurrentLink: (state) => {
      state.currentLink = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createFeedbackLink.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createFeedbackLink.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.inactiveLinks.push(action.payload);
        state.error = null;
      })
      .addCase(createFeedbackLink.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchActiveLinks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchActiveLinks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activeLinks = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchActiveLinks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchInactiveLinks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInactiveLinks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.inactiveLinks = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchInactiveLinks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchLinkById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLinkById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentLink = action.payload;
        state.error = null;
      })
      .addCase(fetchLinkById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchLinkBySlug.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLinkBySlug.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentLink = action.payload;
        state.error = null;
      })
      .addCase(fetchLinkBySlug.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(activateLink.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedLink = action.payload;
        state.currentLink = updatedLink;
        state.activeLinks = state.activeLinks.filter(
          (l) => l._id !== updatedLink._id
        );
        state.activeLinks.push(updatedLink);
        state.inactiveLinks = state.inactiveLinks.filter(
          (l) => l._id !== updatedLink._id
        );
        state.error = null;
      })
      .addCase(activateLink.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deactivateLink.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedLink = action.payload;
        state.currentLink = updatedLink;
        state.inactiveLinks = state.inactiveLinks.filter(
          (l) => l._id !== updatedLink._id
        );
        state.inactiveLinks.push(updatedLink);
        state.activeLinks = state.activeLinks.filter(
          (l) => l._id !== updatedLink._id
        );
        state.error = null;
      })
      .addCase(deactivateLink.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  clearCurrentLink,
  clearError: clearLinksError,
  setStatus: setLinksStatus,
} = feedbackLinksSlice.actions;

export const selectActiveLinks = (state) => state.feedbackLinks.activeLinks;
export const selectInactiveLinks = (state) => state.feedbackLinks.inactiveLinks;
export const selectCurrentLink = (state) => state.feedbackLinks.currentLink;
export const selectLinksStatus = (state) => state.feedbackLinks.status;
export const selectLinksError = (state) => state.feedbackLinks.error;

export default feedbackLinksSlice.reducer;
