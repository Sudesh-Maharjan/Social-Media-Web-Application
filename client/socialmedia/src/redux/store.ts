import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import postReducer from './slices/postSlice'
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import commentReducer from './slices/commentSlice';
import profileReducer from './slices/profileSlice';
import notificationReducer from './slices/notificationSlice';
import chatReducer from './slices/chatSlice';
import storyReducer from './slices/storySlice';
//create store
const store = configureStore({
  reducer: {
    posts:postReducer,
    theme: themeReducer,
    auth: authReducer,
    users: userReducer,
    comment:commentReducer,
    profile: profileReducer,
    notifications: notificationReducer,
    chat: chatReducer,
    stories: storyReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
export default store;
