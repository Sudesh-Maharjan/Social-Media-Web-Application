import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StoryData } from '@/types';

interface CurrentStoryState {
   stories: StoryData[];
   currentIndex: number;
  isOpen: boolean;
}

const initialState: CurrentStoryState = {
   stories: [],
  currentIndex: 0,
  isOpen: false,
};

const currentStorySlice = createSlice({
   name: 'currentStory',
   initialState,
   reducers: {
     setCurrentStory: (state, action: PayloadAction<{ stories: StoryData[], index: number }>) => {
       state.stories = action.payload.stories;
       state.currentIndex = action.payload.index;
       state.isOpen = true;
     },
     clearCurrentStory: (state) => {
       state.stories = [];
       state.currentIndex = 0;
       state.isOpen = false;
     },
     nextStory: (state) => {
       if (state.currentIndex < state.stories.length - 1) {
         state.currentIndex += 1;
       } else {
         state.isOpen = false;
       }
     },
   },
 });

export const { setCurrentStory, clearCurrentStory, nextStory } = currentStorySlice.actions;
export default currentStorySlice.reducer;
