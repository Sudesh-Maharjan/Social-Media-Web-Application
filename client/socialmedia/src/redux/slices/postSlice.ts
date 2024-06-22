import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '@/config';
import {Post} from '@/types';
import { toast } from 'sonner';
 
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

 export const createPost = createAsyncThunk('posts/createPost',  async (formData: FormData)  => {
   try {
      const accessToken = getAccessToken();
     const response = await axios.post<Post[]>(`${API_BASE_URL}/posts`, formData, {
      headers: {
         Authorization: `Bearer ${accessToken}`,
      }
     });
     toast.success('Post created successfully!')
     return response.data;
   } catch (error) {
     toast.error('Failed to create post');
   }
 });
export const updatePost = createAsyncThunk('posts/updatePost', async ({id, formData}: {id:number, formData: FormData})=> {
  try {
    const accessToken = getAccessToken();
    const response = await axios.put<Post[]>(`${API_BASE_URL}/posts/${id}`,  formData,{
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    toast.success('Post updated successfully!');
    return response.data;
  } catch (error: any) {
    console.error('Error updating post:', error.response ? error.response.data : error.message);
toast.error('Failed to update post!');    
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
    toast.success('Post deleted successfully!')
    return id;
  } catch (error) {
    toast.error('Failed to delete post!')
  }
})
export const likePost = createAsyncThunk(
  'posts/likePost',
  async ({ postId, actionType }: { postId: number; actionType: 'like' | 'dislike' }, { rejectWithValue }) => {
    try {
      const accessToken = getAccessToken();
      let url = `${API_BASE_URL}/posts/${postId}/like`;
      if (actionType === 'dislike') {
        url = `${API_BASE_URL}/posts/${postId}/dislike`;
      }
      const response = await axios.post(url, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

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
        state.error = action.payload ? action.payload.toString() : 'Failed to update post';
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
      })
      .addCase(likePost.fulfilled, (state, action) => {
        // Update state after successful like
        const likedPost = state.posts.find(post => post._id === action.payload._id);
        if (likedPost) {
          likedPost.likes = action.payload.likes;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to like/dislike post';
      });
  
  },
});

export default postSlice.reducer;
