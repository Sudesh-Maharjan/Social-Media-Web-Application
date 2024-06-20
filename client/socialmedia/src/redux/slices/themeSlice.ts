import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  darkMode: Cookies.get('darkMode') === 'true',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      Cookies.set('darkMode', state.darkMode.toString(), { expires: 7 });
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      Cookies.set('darkMode', state.darkMode.toString(), { expires: 7 });
    },
  },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
