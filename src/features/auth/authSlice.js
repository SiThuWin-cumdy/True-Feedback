import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { createApiThunk } from '../../lib/createApiThunk';
import { storage, TOKEN_KEY } from '../../lib/storage';
import { authAPI } from './authAPI';

const signedOutState = {
  user: null,
  token: null,
  status: 'idle', // of restoring the session: idle | loading | succeeded | failed
  requestId: null, // the fetchMe whose result is still wanted
};

// /auth/login returns `id`, /auth/me returns `_id`.
const toUser = ({ id, _id, username, email }) => ({ id: id ?? _id, username, email });

export const fetchMe = createApiThunk('auth/me', () => authAPI.getMe(), {
  condition: (_, { getState }) => getState().auth.status !== 'loading',
});

// The token is persisted by store.js, so reducers stay pure.
const authSlice = createSlice({
  name: 'auth',
  initialState: () => ({ ...signedOutState, token: storage.get(TOKEN_KEY) || null }),
  reducers: {
    signIn: (_, { payload: { user, token } }) => ({
      ...signedOutState,
      user: toUser(user),
      token,
      status: 'succeeded',
    }),
    signOut: () => signedOutState,
    // Another tab signed in or out.
    sessionReplaced: (_, { payload: token }) => ({ ...signedOutState, token: token || null }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state, { meta }) => {
        state.status = 'loading';
        state.requestId = meta.requestId;
      })
      .addCase(fetchMe.fulfilled, (state, { payload, meta }) => {
        if (state.requestId !== meta.requestId) return;
        state.status = 'succeeded';
        state.user = toUser(payload);
      })
      // Keep the token: a 401 signs out via the unauthorized handler, and any
      // other failure (offline, server down) says nothing about the session.
      .addCase(fetchMe.rejected, (state, { meta }) => {
        if (state.requestId !== meta.requestId) return;
        state.status = 'failed';
      });
  },
});

export const { signIn, signOut, sessionReplaced } = authSlice.actions;

// Other slices drop the previous account's data on these.
export const isSessionChange = isAnyOf(signIn, signOut, sessionReplaced);

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;

export default authSlice.reducer;
