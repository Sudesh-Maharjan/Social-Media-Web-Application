import API_BASE_URL from '@/config';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { User } from '@/types';
 
interface RootState {
  users: {
    users: User[];
    loading: boolean;
    error: string | null;
    currentUser?: User | null;
  };
}
 
 const initialState: RootState['users'] = {
  currentUser: null,
   users: [] as User[],
   loading: false,
   error: null,
 };
 const getAccessToken = () => {
   return localStorage.getItem('accessToken');
  }
  // const getUserId = () => {
  //   return localStorage.getItem('userId');
  // };
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
try {
   const accesToken = getAccessToken();
   const response = await axios.get(`${API_BASE_URL}/users/allusers`,{
      headers: {
         Authorization: `Bearer ${accesToken}`
       }
   });
   return response.data as User[];
} catch (error) {
   throw (error as Error).message;
}
});

export const fetchUserDetails = createAsyncThunk('users/fetchUserDetails', async ({ _id }: { _id: string }, {rejectWithValue}) => {
try {
  const accessToken = getAccessToken();
  const response = await axios.get(`${API_BASE_URL}/users/allusers/${_id}`, {
headers:{
  Authorization: `Bearer ${accessToken}`
}
  });
  return response.data;
} catch (error) {
  return rejectWithValue((error as Error).message);
}


});
export const followUser = createAsyncThunk('users/followUser', async (userIdToFollow: string) => {
   try {
      const accessToken = getAccessToken();
     const response = await axios.post(`${API_BASE_URL}/users/follow`, { userIdToFollow }, {
      headers: {
         Authorization: `Bearer ${accessToken}`
       }
     });
     return response.data;
   } catch (error) {
      throw (error as Error).message;
   }
 });
 export const searchUsers = createAsyncThunk(
   'users/searchUsers',
   async (query: string, { rejectWithValue }) => {
     try {
      const accessToken = getAccessToken();
       const response = await axios.get<User[]>(`${API_BASE_URL}/users/search?query=${query}`,{
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
       });
       return response.data;
     } catch (error) {
      return rejectWithValue((error as Error).message);
     }
   }
 );
 
 export const unfollowUser = createAsyncThunk('users/unfollowUser', async (userIdToUnfollow: string) => {
   try {
      const accessToken = getAccessToken();

     const response = await axios.post(`${API_BASE_URL}/users/unfollow`, { userIdToUnfollow },{
      headers: {
         Authorization: `Bearer ${accessToken}`
       }
     });
     return response.data;
   } catch (error) {
      throw (error as Error).message;
   }
 });
const userSlice = createSlice({
   name: 'users',
   initialState,
   reducers: {
    setAccessToken: (state, action) => {
      state.currentUser = action.payload;
    },
    logoutUser: (state) => {
      state.currentUser = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId'); // Remove user ID from local storage
    },
  },
   extraReducers: (builder) => {
      builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(followUser.fulfilled, (state, action) => {
         const user = action.payload;
         state.users = state.users.map((u) =>
           u._id === user._id ? { ...u, isFollowing: true } : u
         );
       })
       .addCase(unfollowUser.fulfilled, (state, action) => {
         const user = action.payload;
         state.users = state.users.map((u) =>
           u._id === user._id ? { ...u, isFollowing: false } : u
         );
       })
       .addCase(searchUsers.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(searchUsers.fulfilled, (state, action) => {
         state.users = action.payload;
         state.loading = false;
         state.error = null;
       })
       .addCase(searchUsers.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload ? action.payload.toString() : 'Failed to search users';
       })
       .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
   },
});
export const selectUsers = (state: RootState) => state.users.users;
export const selectCurrentUser = (state: RootState) => state.users.currentUser;
export const selectUsersLoading = (state: RootState) => state.users.loading;

export default userSlice.reducer;