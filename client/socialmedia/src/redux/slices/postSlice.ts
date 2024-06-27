import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '@/config';
import {Post} from '@/types';
import { toast } from 'sonner';
import { RootState } from '../store';
 
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
    try {
      const accessToken = getAccessToken();
      const response = await axios.get<Post[]>(`${API_BASE_URL}/posts`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      const posts = response.data;
  
      // Fetch comments for each post
      for (const post of posts) {
        const commentsResponse = await axios.get(`${API_BASE_URL}/comments/${post._id}/comments`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        post.comments = commentsResponse.data;
      }
  
      return posts;
    } catch (error: any) {
     toast.error(error.message || 'Failed to fetch posts');
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
   } catch (error:any) {
     toast.error(error.message || 'Failed to create post');
   }
 });
export const updatePost = createAsyncThunk('posts/updatePost', async ({postId, formData}: {postId:string, formData: FormData})=> {
  try {
    const accessToken = getAccessToken();
    const response = await axios.put<Post[]>(`${API_BASE_URL}/posts/${postId}`,  formData,{
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    toast.success('Post updated successfully!');
    return response.data;
  } catch (error: any) {
    console.error('Error updating post:', error.response ? error.response.data : error.message);
toast.error(error.message || 'Failed to update post');    
  }
})
export const deletePost = createAsyncThunk('posts/deletePost', async (postId: string)=>{
  try {
    const accessToken = getAccessToken();
    await axios.delete<Post[]>(`${API_BASE_URL}/posts/${postId}`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    toast.success('Post deleted successfully!')
    return postId;
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete post')
  }
})
export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId: string, { getState }) => {
    const state = getState() as RootState;
    const { userId, accessToken } = state.auth;
    
    if (!userId || !accessToken) {
     toast.error('You must be logged in to like/dislike a post');
    }

    // Your API call here
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      toast.error('Failed to like/dislike post');
    }

    const data = await response.json();
    return data;
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
        state.loading = false;
        state.posts = action.payload ?? [];
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
        const index = state.posts.findIndex(post => post._id === action.payload?.[0]._id);
        if (index !== -1) {
          state.posts[index] = action.payload?.[0];
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
