import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        isAuthenticated: false,
    },
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
            state.isAuthenticated = true;
            console.log("dispatch token",state.token,state.isAuthenticated);
        },
        clearToken: (state) => {
            state.token = null;
            state.isAuthenticated = false;
        }
    }
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
