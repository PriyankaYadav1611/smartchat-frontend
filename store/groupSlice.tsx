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
        addGroup: (state, action) => {
            state.groups = [...state.groups, action.payload.group];
            console.log("groupSlice addGroup.. ", action.payload.group);
        },
        setSelectedGroup: (state, action) => {
            state.selectedGroup = action.payload.selectedGroup;
            console.log("groupSlice groupsdispatch.. ", action.payload.selectedGroup);
        }
    }
});

export const { setGroups, addGroup, setSelectedGroup} = groupSlice.actions;
export default groupSlice.reducer;
