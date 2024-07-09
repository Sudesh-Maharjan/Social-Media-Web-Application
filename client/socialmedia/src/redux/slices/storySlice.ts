import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { StoryState, StoryData } from '@/types';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getAuthToken = () => {
  return localStorage.getItem('accessToken'); 
};
export const fetchStories = createAsyncThunk('stories/fetchStories', async () => {
  const token = getAuthToken();
  const response = await axios.get(`${API_BASE_URL}/stories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // if(response.data === undefined || null || [] || {}){
  //   toast.error('No stories posted yet');
  // }
  return response.data;
});

export const addStory = createAsyncThunk('stories/addStory', async (storyData: StoryData) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('mediaUrl', storyData.mediaUrl);
  formData.append('mediaType', storyData.mediaType);
  console.log(storyData.mediaUrl, storyData.mediaType)
  const response = await axios.post(`${API_BASE_URL}/stories`, formData,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  toast.success('Story added');
  return response.data;
});

export const deleteStory = createAsyncThunk('stories/deleteStory', async (storyId) => {
  const token = getAuthToken();
  await axios.delete(`${API_BASE_URL}/stories/${storyId}`,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  toast.success('Stories Deleted!');
  return storyId;
});

const initialState: StoryState = {
  stories: [],
  loading: false,
  error: null,
};
const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stories';
      })
      .addCase(addStory.fulfilled, (state, action) => {
        state.stories.push(action.payload);
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.stories = state.stories.filter((story) => story._id !== action.payload);
      });
  },
});

export default storySlice.reducer;
