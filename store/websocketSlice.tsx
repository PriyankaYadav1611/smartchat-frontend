import { createSlice, PayloadAction } from '@reduxjs/toolkit';


const websocketSlice = createSlice({
    name: 'websocket',
    initialState: {
        socket: null,
        isConnected: false,
        stompClient: null,
    },
    reducers: {
        setSocket: (state, action) => {
            state.socket = action.payload.socket;
            state.isConnected = true;
            state.stompClient = action.payload.stompClient;
        },
        clearSocket: (state) => {
            if (state.socket) {
                state.socket.close();
            }
            state.socket = null;
            state.isConnected = false;
            stompClient: null;
        }
    }
});

export const { setSocket, clearSocket } = websocketSlice.actions;
export default websocketSlice.reducer;
