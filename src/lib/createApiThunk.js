import { createAsyncThunk } from '@reduxjs/toolkit';

// createAsyncThunk for API calls. Rejections carry `{ message, status }`, so
// `.unwrap()` callers can read `err.message` and reducers `action.payload`.
// `status` is undefined when the server could not be reached.
export const createApiThunk = (type, request, options) =>
  createAsyncThunk(
    type,
    async (arg, thunkApi) => {
      try {
        return await request(arg, thunkApi);
      } catch (err) {
        return thunkApi.rejectWithValue({
          message: err.message || 'Something went wrong. Try again.',
          status: err.status,
        });
      }
    },
    options
  );
