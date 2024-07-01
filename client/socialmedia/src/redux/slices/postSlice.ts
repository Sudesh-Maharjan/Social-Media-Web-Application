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

  export const fetchPostDetails = createAsyncThunk( 'posts/fetchPostDetails', async (postId: string) => {
    try {
      const accessToken = getAccessToken() ?? '';
      const response = await axios.get<Post[]>(`${API_BASE_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      const postDetails = response.data;
      console.log('Post Details:',postDetails);
      return postDetails;
    } catch (error) {
      toast.error((error as Error).message || 'Failed to fetch post details');
      throw error;
    }
  })
  export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    try {
      const accessToken = getAccessToken() ?? '';
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
    } catch (error) {
      toast.error((error as Error).message || 'Failed to fetch posts');
      throw error;
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
    toast.error((error as Error).message || 'Failed to create post');
    throw error;
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
    console.log("update post:", response.data)
    toast.success('Post updated successfully!');
    return response.data;
  } catch (error) {
toast.error((error as Error).message || 'Failed to update post');
throw error;
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
  } catch (error) {
    toast.error((error as Error).message || 'Failed to delete post');
    throw error;
  }
})
export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId: string, { getState }) => {
    try {
      const state = getState() as RootState;
      const { accessToken } = state.auth;
      const response = await axios.post<Post>(
        `${API_BASE_URL}/posts/${postId}/like`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.data) {
        toast.error('Failed to like/dislike post');
        return;
      }
     return response.data;
    } catch (error) {
      console.error('Error liking/disliking post:', error);
      toast.error('Failed to like/dislike post');
      throw error;
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    updatePostInState(state, action) {
      const updatedPost = action.payload;
      const index = state.posts.findIndex((post) => post._id === updatedPost._id);
      if (index !== -1) {
        state.posts[index] = updatedPost;
      }
    },
  },
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
        const newPosts = action.payload;
        if (newPosts) {
          state.posts.push(...newPosts);
        }
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
        const updatedPost = action.payload as Post | undefined;
        const index = state.posts.findIndex((post) => post._id === updatedPost?._id);
        if (index !== -1 && updatedPost) {
          state.posts[index] = updatedPost;
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
        const { liked, _id } = action.payload as Partial<Post>;
        const index = state.posts.findIndex((post) => post._id === _id);
        if (index !== -1) {
          state.posts[index].likes = liked;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to like/dislike post';
      });
  
  },
});
export const { updatePostInState } = postSlice.actions;
export default postSlice.reducer;
