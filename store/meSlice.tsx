import { createSlice } from '@reduxjs/toolkit';


const meSlice = createSlice({
    name: 'me',
    initialState: {
        username: '',
        id: null
    },
    reducers: {
        setMe: (state, action) => {
            state.username = action.payload.username;
            state.id = action.payload.id;
            console.log("meslice username dispatch.. ", action.payload.username);
            console.log("meslice id dispatch.. ", action.payload.id);
        }
    }
});


export const { setMe} = meSlice.actions;
export default meSlice.reducer;
