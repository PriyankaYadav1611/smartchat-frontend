import { configureStore} from '@reduxjs/toolkit';

import authReducer from './authSlice';
import websocketReducer from './websocketSlice';
import meReducer from './meSlice';
import groupReducer from './groupSlice';
import usersReducer from './usersSlice'

export const store = configureStore ({
    reducer: {
        auth: authReducer,
        websocket: websocketReducer,
        me: meReducer,
        group: groupReducer,
        users: usersReducer
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware ({
            serializableCheck: false,
    })
});
