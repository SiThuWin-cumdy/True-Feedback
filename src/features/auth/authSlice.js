import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authAPI } from './authAPI';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  status: 'idle',
  error: null,
};

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      return await authAPI.getMe();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch user profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      state.status = 'succeeded';
      state.error = null;
    },
    signOut: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      state.status = 'idle';
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
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
      .addCase('auth/register/pending', (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase('auth/register/fulfilled', (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase('auth/register/rejected', (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Registration failed';
      })
      .addCase('auth/login/pending', (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase('auth/login/fulfilled', (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        state.error = null;
      })
      .addCase('auth/login/rejected', (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Session expired';
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      });
  },
});

export const { signIn, signOut, setCredentials, clearError, setStatus } =
  authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
