import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_BASE_URL from "../../../config";

const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};
export const fetchChatHistory = createAsyncThunk(
  "chat/fetchChatHistory",
  async (roomId: string, { rejectWithValue }) => {
    try {
      const accessToken = getAccessToken() ?? "";
      const response = await axios.get(
        `${API_BASE_URL}/messages/room/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Fetched chat history:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching chat history:", error);
      return rejectWithValue(error.response.data);
    }
  }
);
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addMessage: (state, action: { payload: never[] }) => {
      if (Array.isArray(action.payload)) {
      state.messages = [...state.messages, ...action.payload];
      }else{
        state.messages.push(action.payload)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatHistory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages = action.payload;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as null;
      });
  },
});

export const { addMessage } = chatSlice.actions;
export default chatSlice.reducer;
