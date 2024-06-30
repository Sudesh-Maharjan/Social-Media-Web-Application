import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Comment } from "@/types";
import API_BASE_URL from "@/config";
import { toast } from "sonner";

interface CommentState {
  comments: { [postId: string]: Comment[] };
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: {},
  loading: false,
  error: null,
};
const getAccessToken = () => {
  return localStorage.getItem('accessToken');
 }
 export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (postId: string) => {
    try {
      const accessToken = getAccessToken();
      const response = await axios.get<Comment[]>(`${API_BASE_URL}/comments/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      return { postId, comments: response.data };
    } catch (error) {
      throw new Error('Failed to fetch comments');
    }
  }
);
export const addComment = createAsyncThunk(
  "comments/addComment",
  async ({ postId, content }: { postId: string; content: string }) => {
    try {
      const accessToken = getAccessToken();

      const response = await axios.post<Comment>(`${API_BASE_URL}/comments/${postId}/comments`, {comment: content }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      toast.success('Comment added successfully');
      console.log(response.data)
      return response.data;
    } catch (error) {
      toast.error('Failed to add comment');
      throw new Error('Failed to add comment');
    }
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ postId, commentId, content }: { postId: string; commentId: string; content: string }) => {
    try {

    const accessToken = getAccessToken();
    const response = await axios.put(`${API_BASE_URL}/comments/${postId}/comments/${commentId}`, { comment: content },{
      headers:{
        Authorization: `Bearer ${accessToken}`,
      }
    
    });
    toast.success('Comment updated successfully');
    return response.data;
  }  catch (error) {
    toast.error('Failed to update comment');
    throw new Error('Failed to update comment');
  }
}
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async ({ postId, commentId }: { postId: string; commentId: string }) => {
    try{
    const accessToken = getAccessToken();
    console.log('postId:', postId)
   const response = await axios.delete(`${API_BASE_URL}/comments/${postId}/comments/${commentId}`, {
      headers:{
        Authorization: `Bearer ${accessToken}`,
      }
    });
    toast.success('Comment deleted successfully');
    console.log("response data delete:", response.data)
    return {postId, commentId};
  } catch (error) {
    toast.error('Failed to delete comment');
    throw new Error('Failed to delete comment');
  }
}
);

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(fetchComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchComments.fulfilled, (state, action: PayloadAction<{ postId: string; comments: Comment[] }>) => {
      state.loading = false;
      const { postId, comments } = action.payload;
      state.comments[postId] = comments;
    })
    .addCase(fetchComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch comments";
    })
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        state.loading = false;
        const newComment = action.payload;
        const { postId } = newComment;
        state.comments[postId] = state.comments[postId]//updates the comment for specific postId. Also check if there are existing comments for the post and appends them also with new comment
          ? [...state.comments[postId], newComment]
          : [newComment];
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add comment";
      })
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        state.loading = false;
        const updatedComment = action.payload;
        const { postId } = updatedComment;
        const existingComments = state.comments[postId];
        if (existingComments) {
          state.comments[postId] = existingComments.map(comment =>
            comment._id === updatedComment._id ? updatedComment : comment
          );
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update comment";
      })
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action: PayloadAction<{ postId: string; commentId: string }>) => {
        state.loading = false;
        const { postId, commentId } = action.payload;
        state.comments[postId] = state.comments[postId].filter(comment => comment._id !== commentId);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete comment";
      });
  },
});

export default commentSlice.reducer;
