import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMe } from '../api/users'


// Async thunk to fetch users
export const getAndSetMe = createAsyncThunk(
  'me/getAndSetMe',
  async (_, { rejectWithValue }) => {
    try {
        const me = getMe();
        return me;
    } catch (error: any) {
        return rejectWithValue("getMe failed");
    }
  }
);

// Initial state and slice
interface MeState {
  me: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MeState = {
  me: null,
  isLoading: false,
  error: null,
};

const meSlice = createSlice({
  name: 'me',
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(getAndSetMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAndSetMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.me = action.payload;
      })
      .addCase(getAndSetMe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default meSlice.reducer;
