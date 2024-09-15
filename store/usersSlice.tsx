import { createSlice } from '@reduxjs/toolkit';


const usersSlice = createSlice({
    name: 'users',
    initialState: {
        idUserMap: null,
        users: null,
    },
    reducers: {
        setIdUserMap: (state, action) => {
            state.idUserMap = action.payload.idUserMap;
            console.log("usersSlice dispatch idUserMap:", action.payload.idUserMap);
        },
        setAllUsers: (state, action) => {
            state.users = action.payload.users;
            console.log("usersSlice dispacth setAllUsers:", action.payload.users)
        },
        setUsersAndIdUserMap: (state, action) => {
            state.idUserMap = action.payload.idUserMap;
            state.users = action.payload.users;
        }
    }
});


export const { setIdUserMap, setAllUsers, setUsersAndIdUserMap } = usersSlice.actions;
export default usersSlice.reducer;
