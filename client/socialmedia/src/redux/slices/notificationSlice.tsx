import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '@/config';
import { toast } from 'sonner';

interface Notification {
  recipient: string;
  message: string;
  type: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};
const accessToken = localStorage.getItem('accessToken');
export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async (userId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error: any) {
   console.error('Fetch notifications error:', error); 
    throw error.message;
  }
});
export const deleteNotification = createAsyncThunk(
   'notifications/deleteNotification',
   async (notificationId: string) => {
     try {
       await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
         headers: {
           Authorization: `Bearer ${accessToken}`,
         },
       });
       toast.success('Notification Deleted successfully!');
       return notificationId; // Return the deleted notification ID if successful
     } catch (error: any) {
       throw error.message;
     }
   }
 );
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteNotification.pending, (state) => {
         state.loading = true;
       })
       .addCase(deleteNotification.fulfilled, (state, action) => {
         state.loading = false;
         // Remove the deleted notification from state
         state.notifications = state.notifications.filter(
           (notification) => notification._id !== action.payload
         );
       })
       .addCase(deleteNotification.rejected, (state, action) => {
         state.loading = false;
         state.error = action.error.message;
       });
  },
});

export default notificationsSlice.reducer;
