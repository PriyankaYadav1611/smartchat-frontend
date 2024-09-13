import { createSlice } from '@reduxjs/toolkit';


const messagesSlice = createSlice({
    name: 'messages',
    initialState: {
        groupIdMessagesMap: {},
    },
    reducers: {
        setGroupIdMessagesMap: (state, action) => {
            state.groupIdMessagesMap = {
                ...state.groupIdMessagesMap,
                ...action.payload.groupIdMessagesMap
            };
            console.log("messagesSlice dispatch.. ", action.payload.groupIdMessagesMap);
        },
        setMessage: (state, action) => {
            const message = action.payload.message;
            console.log("---------------------MessageSlice",message);
            const groupId = message.groupId;
            state.groupIdMessagesMap[groupId] = [...state.groupIdMessagesMap[groupId], message];
            console.log("messagesSlice setMessage.. ", message);
        },
    }
});


export const { setGroupIdMessagesMap, setMessage} = messagesSlice.actions;
export default messagesSlice.reducer;


// Example of groupIdMessagesMap states
// groupIdMessagesMap = {
//     groupId1: [message1, mesaage2, mesaage3],
//     groupId2: [message4, mesaage5, mesaage6],
// }

            // state.groupIdMessagesMap[action.payload.message.groupId] = [...state.groupIdMessagesMap[action.payload.message.groupId], action.payload.message],

            // msg10

            // groupIMessageMap{
            //     groupId01: [msg2,msg7, msg10]
            // }
