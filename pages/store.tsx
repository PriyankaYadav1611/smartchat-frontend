import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import websocketReducer from './websocketSlice';
import meReducer from './meSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        websocket: websocketReducer,
        me: meReducer,
    },
});
