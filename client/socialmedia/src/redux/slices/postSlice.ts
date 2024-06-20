import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '@/config';
import {Post} from '@/types';
 
 interface PostState {
   posts: Post[];
   loading: boolean;
   error: string | null;
 }
 
 const initialState: PostState = {
   posts: [],
   loading: false,
   error: null,
 };
 
 const getAccessToken = () => {
   return localStorage.getItem('accessToken');
  }
  
  export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    // console.log('Id:', id)
    try {
      const accessToken = getAccessToken();
     const response = await axios.get<Post[]>(`${API_BASE_URL}/posts`,{
      headers: {
         Authorization: `Bearer ${accessToken}`,
      }
     });
     return response.data; 
   } catch (error) {
     throw Error('Failed to fetch posts'); // Throw error for async thunk
   }
 });

 export const createPost = createAsyncThunk('posts/createPost', async (postData: {content: string; status: string }) => {
   try {
      const accessToken = getAccessToken();
     const response = await axios.post<Post[]>(`${API_BASE_URL}/posts`, postData, {
      headers: {
         Authorization: `Bearer ${accessToken}`
      }
     });
     return response.data;
   } catch (error) {
     throw Error('Failed to create post');
   }
 });
export const updatePost = createAsyncThunk('posts/updatePost', async ({id, content}: {id:number, content: string})=> {
  try {
    const accessToken = getAccessToken();
    const response = await axios.put<Post[]>(`${API_BASE_URL}/posts/${id}`, {content},{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating post:', error.response ? error.response.data : error.message);
throw Error('Failed to update post!');    
  }
})
export const deletePost = createAsyncThunk('posts/deletePost', async (id: number)=>{
  try {
    const accessToken = getAccessToken();
    await axios.delete<Post[]>(`${API_BASE_URL}/posts/${id}`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return id;
  } catch (error) {
    throw Error('Failed to delete post!')
  }
})
const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
        
      })
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updatePost.pending, (state)=>{
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post._id !== action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default postSlice.reducer;
