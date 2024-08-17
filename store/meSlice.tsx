import { createSlice } from '@reduxjs/toolkit';


const meSlice = createSlice({
    name: 'me',
    initialState: {
        username: '',
    },
    reducers: {
        setUsername: (state, action) => {
            state.username = action.payload.username;
            console.log("meslice username dispatch.. ", action.payload.username);
        }
    }
});


export const { setUsername} = meSlice.actions;
export default meSlice.reducer;
