import { createSlice } from "@reduxjs/toolkit";

const groupSlice = createSlice({
    name:'group',
    initialState: {
        groups: [],
    },
    reducers: {
        setGroups: (state, action) => {
            state.groups = action.payload.groups;
            console.log("groupSlice groupsdispatch.. ", action.payload.groups);
        }
    }
});

export const { setGroups} = groupSlice.actions;
export default groupSlice.reducer;
