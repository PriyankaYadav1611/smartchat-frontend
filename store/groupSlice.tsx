import { createSlice } from "@reduxjs/toolkit";


const groupSlice = createSlice({
    name:'group',
    initialState: {
        groups: [],
        selectedGroup : null
    },
    reducers: {
        setGroups: (state, action) => {
            state.groups = action.payload.groups;
            console.log("groupSlice groupsdispatch.. ", action.payload.groups);
        },
        setSelectedGroup: (state, action) => {
            state.selectedGroup = action.payload.selectedGroup;
            console.log("groupSlice groupsdispatch.. ", action.payload.selectedGroup);
        }
    }
});

export const { setGroups, setSelectedGroup} = groupSlice.actions;
export default groupSlice.reducer;
