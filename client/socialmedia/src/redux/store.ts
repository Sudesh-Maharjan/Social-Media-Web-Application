import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import postReducer from './slices/postSlice'
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    posts:postReducer,
    theme: themeReducer,
    auth: authReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
