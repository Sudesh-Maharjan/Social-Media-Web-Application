import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';

const store = configureStore({//stores theme state
  reducer: {
    theme: themeReducer,
  },
});

export default store;
