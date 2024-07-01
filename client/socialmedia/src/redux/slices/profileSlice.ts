import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface RootState {
  profile: ProfileState;
}
import API_BASE_URL from '@/config';
import { toast } from 'sonner';

interface ProfileState {
  loading: boolean;
  error: string | null;
  profilePictureUrl: string | null;
}

const initialState: ProfileState = {
  loading: false,
  error: null,
  profilePictureUrl: null,
};

const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const uploadProfilePicture = createAsyncThunk(
  'profile/uploadProfilePicture',
  async (formData: FormData, { dispatch }) => {
    try {
      const accessToken = getAccessToken();
      const response = await axios.post<{ imagePath: string }>(`${API_BASE_URL}/users/upload-profile-picture`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      dispatch(uploadProfilePictureSuccess(response.data.imagePath));
      console.log('Image path:', response.data.imagePath)
      return response.data.imagePath;
    } catch (error: any) {
      dispatch(uploadProfilePictureFailure(error.message || 'Failed to upload profile picture'));
      throw error;
    }
  }
);

export const deleteProfilePicture = createAsyncThunk(
   'profile/deleteProfilePicture',
   async (_, { dispatch }) => {
     try {
       const accessToken = getAccessToken();
       await axios.delete(`${API_BASE_URL}/users/delete-profile-picture`, {
         headers: {
           Authorization: `Bearer ${accessToken}`,
         },
       });
       dispatch(deleteProfilePictureSuccess());
       toast.success('Profile picture deleted successfully');
        return true;
     } catch (error: any) {
       dispatch(deleteProfilePictureFailure(error.message || 'Failed to delete profile picture'));
       toast.error('Failed to delete profile picture');
       throw error;
     }
   }
 );
export const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    loading: false,
    error: null,
    profilePictureUrl: null
  },
  reducers: {
    
    uploadProfilePictureStart(state) {
      state.loading = true;
      state.error = null;
    },
    uploadProfilePictureSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.profilePictureUrl = action.payload;
    },
    uploadProfilePictureFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    }, 
    deleteProfilePictureStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteProfilePictureSuccess(state) {
      state.loading = false;
      state.profilePictureUrl = null; // Reset the profile picture URL upon deletion
    },
    deleteProfilePictureFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        console.log('Profile picture:', action.payload)
        state.loading = false;
        state.profilePictureUrl = action.payload;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to upload profile picture';
      })
      .addCase(deleteProfilePicture.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(deleteProfilePicture.fulfilled, (state) => {
         state.loading = false;
         state.profilePictureUrl = null; // Reset the profile picture URL upon deletion
       })
       .addCase(deleteProfilePicture.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload || 'Failed to delete profile picture';
       });
  },
});

export const { uploadProfilePictureStart, uploadProfilePictureSuccess, uploadProfilePictureFailure, deleteProfilePictureStart,
   deleteProfilePictureSuccess,
   deleteProfilePictureFailure, } = profileSlice.actions;

export const selectProfilePictureUrl = (state: RootState) => state.profile.profilePictureUrl;

export default profileSlice.reducer;
