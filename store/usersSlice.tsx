import { createSlice } from '@reduxjs/toolkit';


const usersSlice = createSlice({
    name: 'users',
    initialState: {
        idUserMap: null,
    },
    reducers: {
        setIdUserMap: (state, action) => {
            state.idUserMap = action.payload.idUserMap;
            console.log("usersSlice dispatch.. ", action.payload.idUserMap);
        }
    }
});


export const { setIdUserMap} = usersSlice.actions;
export default usersSlice.reducer;
