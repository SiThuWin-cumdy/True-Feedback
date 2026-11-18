import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import feedbackLinksReducer from '../features/feedbackLinks/feedbackLinksSlice';
import repliesReducer from '../features/replies/repliesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feedbackLinks: feedbackLinksReducer,
    replies: repliesReducer,
  },
});

export default store;